import { analyzeMenu } from '../lib/analyzeMenu.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { logAnalysis, sha256Hex, findCachedByHash, countAnalysesByIp } from '../lib/supabase.js';

const ACCEPTED_MEDIA = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'reboot-salt-fallback';
const MAX_PAYLOAD_B64 = 6_500_000; // ~5MB actual bytes; PDFs need a bit more headroom than photos

// Beta mode: limit fresh analyses per IP until Reboot 30 launches.
// Cache hits and library searches don't count against this.
const BETA_LIMIT = 3;
const BETA_END_ISO = '2026-05-04T00:00:00Z';
// Counting window: only analyses created after this timestamp count.
// Set to a recent-past date so new users start with the full quota.
const BETA_WINDOW_START_ISO = '2026-04-20T00:00:00Z';

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

  const t0 = Date.now();
  const payloadKB = Math.round(dataB64.length / 1024);
  const imageHash = sha256Hex(dataB64);
  const ipHash = sha256Hex(ip + IP_HASH_SALT);

  // CACHE: if we've analyzed this exact image before, return it instantly.
  // Cache hits never count toward the beta quota.
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const cached = await findCachedByHash(imageHash);
    if (cached) {
      return res.status(200).json({
        ...cached.analysis_json,
        analysisId: cached.id,
        cached: true,
        _timing: { totalMs: Date.now() - t0, payloadKB, mediaType, source: 'cache' },
      });
    }
  }

  // BETA LIMIT: before launch, each IP gets 3 fresh analyses.
  // After BETA_END_ISO, the limit disappears automatically.
  const inBeta = Date.now() < new Date(BETA_END_ISO).getTime();
  if (inBeta && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const usedCount = await countAnalysesByIp(ipHash, BETA_WINDOW_START_ISO);
    if (usedCount >= BETA_LIMIT) {
      return res.status(429).json({
        error: 'beta_limit_reached',
        message: 'Usaste tus 3 análisis de la beta. El 4 de mayo arranca Reboot 30 y se libera el acceso completo.',
        beta: {
          limit: BETA_LIMIT,
          used: usedCount,
          remaining: 0,
          endsAt: BETA_END_ISO,
          ctaUrl: 'https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html?utm_source=semaforo&utm_medium=beta_limit&utm_campaign=reboot30',
        },
      });
    }
  }

  try {
    const result = await analyzeMenu({
      fileBase64: dataB64,
      mediaType,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const tClaude = Date.now() - t0;

    // Silent log to Supabase (skipped if env vars absent).
    let analysisId = null;
    let betaRemaining = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const logged = await logAnalysis({
        analysisJson: result,
        imageHash,
        imageBytes: Math.round(dataB64.length * 0.75),
        userAgent: req.headers['user-agent']?.slice(0, 300) || null,
        ipHash,
      });
      analysisId = logged?.id || null;

      // After counting this fresh analysis, report beta remaining for UI hints.
      if (inBeta) {
        const usedAfter = await countAnalysesByIp(ipHash, BETA_WINDOW_START_ISO);
        betaRemaining = Math.max(0, BETA_LIMIT - usedAfter);
      }
    }

    return res.status(200).json({
      ...result,
      analysisId,
      beta: inBeta ? { limit: BETA_LIMIT, remaining: betaRemaining, endsAt: BETA_END_ISO } : null,
      _timing: { claudeMs: tClaude, totalMs: Date.now() - t0, payloadKB, mediaType },
    });
  } catch (err) {
    const elapsed = Date.now() - t0;
    console.error('analyze error:', err);
    if (err.code === 'INVALID_RESPONSE') {
      return res.status(502).json({
        error: 'invalid_model_response',
        message: 'El modelo devolvió algo inesperado. Intenta con otra foto o PDF.',
        _debug: { elapsedMs: elapsed, payloadKB, mediaType, errName: err?.name, errMessage: err?.message?.slice(0, 300) },
      });
    }
    const isTimeout = err?.name === 'AbortError' || /timeout|timed out/i.test(err?.message || '');
    return res.status(500).json({
      error: isTimeout ? 'timeout' : 'internal_error',
      message: isTimeout
        ? 'El menú es muy grande y el análisis tardó más de lo esperado. Intenta con una parte del menú o una foto más corta.'
        : 'Algo falló del lado nuestro. Intenta de nuevo en un minuto.',
      _debug: {
        elapsedMs: elapsed,
        payloadKB,
        mediaType,
        errName: err?.name,
        errMessage: err?.message?.slice(0, 500),
        errCode: err?.code,
        errStatus: err?.status,
      },
    });
  }
}

// Vercel Node.js body parser supports JSON up to ~5MB by default; we bump it for PDFs.
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};
