import { analyzeMenu } from '../lib/analyzeMenu.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { logAnalysis, sha256Hex } from '../lib/supabase.js';

const ACCEPTED_MEDIA = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'reboot-salt-fallback';
const MAX_PAYLOAD_B64 = 6_500_000; // ~5MB actual bytes; PDFs need a bit more headroom than photos

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    'unknown';

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Superaste los análisis permitidos por ahora. Intenta de nuevo en una hora.',
    });
  }

  // Accept either the new field name (fileBase64) or the legacy one (imageBase64).
  const { fileBase64, imageBase64, mediaType } = req.body || {};
  const dataB64 = fileBase64 ?? imageBase64;

  if (!dataB64 || typeof dataB64 !== 'string') {
    return res.status(400).json({ error: 'bad_request', message: 'Falta el archivo.' });
  }

  if (!ACCEPTED_MEDIA.has(mediaType)) {
    return res.status(400).json({
      error: 'unsupported_media_type',
      message: 'Formato no soportado. Sube una foto (JPG, PNG, WebP) o un PDF del menú.',
    });
  }

  if (dataB64.length > MAX_PAYLOAD_B64) {
    return res.status(413).json({
      error: 'payload_too_large',
      message: 'El archivo es muy grande. Si es PDF, usa uno más pequeño o toma foto.',
    });
  }

  try {
    const result = await analyzeMenu({
      fileBase64: dataB64,
      mediaType,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Silent log to Supabase (skipped if env vars absent).
    let analysisId = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const logged = await logAnalysis({
        analysisJson: result,
        imageHash: sha256Hex(dataB64),
        imageBytes: Math.round(dataB64.length * 0.75),
        userAgent: req.headers['user-agent']?.slice(0, 300) || null,
        ipHash: sha256Hex(ip + IP_HASH_SALT),
      });
      analysisId = logged?.id || null;
    }

    return res.status(200).json({ ...result, analysisId });
  } catch (err) {
    console.error('analyze error:', err);
    if (err.code === 'INVALID_RESPONSE') {
      return res.status(502).json({
        error: 'invalid_model_response',
        message: 'El modelo devolvió algo inesperado. Intenta con otra foto o PDF.',
      });
    }
    // Distinguish timeout from other errors
    const isTimeout = err?.name === 'AbortError' || /timeout|timed out/i.test(err?.message || '');
    return res.status(500).json({
      error: isTimeout ? 'timeout' : 'internal_error',
      message: isTimeout
        ? 'El menú es muy grande y el análisis tardó más de lo esperado. Intenta con una parte del menú o una foto más corta.'
        : 'Algo falló del lado nuestro. Intenta de nuevo en un minuto.',
    });
  }
}

// Vercel Node.js body parser supports JSON up to ~5MB by default; we bump it for PDFs.
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};
