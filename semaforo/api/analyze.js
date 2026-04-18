import { analyzeMenu } from '../lib/analyzeMenu.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { logAnalysis, sha256Hex } from '../lib/supabase.js';

const ACCEPTED_MEDIA = new Set(['image/jpeg', 'image/png', 'image/webp']);
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'reboot-salt-fallback';

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

  const { imageBase64, mediaType } = req.body || {};

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'bad_request', message: 'Falta la imagen.' });
  }

  if (!ACCEPTED_MEDIA.has(mediaType)) {
    return res.status(400).json({
      error: 'unsupported_media_type',
      message: 'Formato no soportado. Usa JPG, PNG o WebP.',
    });
  }

  if (imageBase64.length > 4_500_000) {
    return res.status(413).json({
      error: 'payload_too_large',
      message: 'La imagen es muy grande. Prueba con una más pequeña.',
    });
  }

  try {
    const result = await analyzeMenu({
      imageBase64,
      mediaType,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Fire-and-note: log to Supabase for the Reboot menu library.
    // If Supabase is not configured (no env vars), this returns null and we skip.
    let analysisId = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const logged = await logAnalysis({
        analysisJson: result,
        imageHash: sha256Hex(imageBase64),
        imageBytes: Math.round(imageBase64.length * 0.75), // approx bytes from base64
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
        message: 'El modelo devolvió algo inesperado. Intenta con otra foto.',
      });
    }
    return res.status(500).json({
      error: 'internal_error',
      message: 'Algo falló del lado nuestro. Intenta de nuevo en un minuto.',
    });
  }
}

// Vercel Node.js body parser supports JSON up to ~5MB by default
export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } },
};
