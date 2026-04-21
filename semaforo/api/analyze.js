import { analyzeMenu } from '../lib/analyzeMenu.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { logAnalysis, sha256Hex, findCachedByHash } from '../lib/supabase.js';
import { getAuthUser } from '../lib/auth.js';
import { getAppUser, computeUsesRemaining, incrementUsage } from '../lib/appUsers.js';
import { getSupabase } from '../lib/supabase.js';

const ACCEPTED_MEDIA = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'reboot-salt-fallback';
const MAX_PAYLOAD_B64 = 13_500_000; // ~10MB actual bytes; multi-page menus need headroom

export default async function handler(req, res) {
  // CORS for future cross-origin calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // === AUTH REQUIRED ===
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'unauthorized', message: 'Regístrate con tu email para usar el Semáforo.' });
  }
  const appUser = await getAppUser(authUser.id);
  if (!appUser) {
    return res.status(403).json({ error: 'profile_incomplete', message: 'Completa tu perfil (ciudad) para continuar.' });
  }

  // === IP rate limit (cheap defense vs. one-user-many-reqs) ===
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    'unknown';
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Demasiadas solicitudes en poco tiempo. Espera un minuto y vuelve a intentar.',
    });
  }

  // === Body shape: { files: [{base64, mediaType}, ...] } (preferred) or { fileBase64, mediaType } (legacy) ===
  const body = req.body || {};
  let files = [];
  if (Array.isArray(body.files) && body.files.length > 0) {
    files = body.files;
  } else {
    const singleData = body.fileBase64 ?? body.imageBase64;
    if (singleData) files = [{ base64: singleData, mediaType: body.mediaType }];
  }

  if (files.length === 0) return res.status(400).json({ error: 'bad_request', message: 'Falta el archivo.' });
  if (files.length > 8) return res.status(400).json({ error: 'too_many_files', message: 'Máximo 8 páginas por análisis.' });

  let totalSize = 0;
  for (const f of files) {
    if (!f?.base64 || typeof f.base64 !== 'string') {
      return res.status(400).json({ error: 'bad_request', message: 'Archivo inválido.' });
    }
    if (!ACCEPTED_MEDIA.has(f.mediaType)) {
      return res.status(400).json({
        error: 'unsupported_media_type',
        message: 'Formato no soportado. Sube foto (JPG/PNG/WebP) o PDF.',
      });
    }
    totalSize += f.base64.length;
  }
  if (totalSize > MAX_PAYLOAD_B64) {
    return res.status(413).json({
      error: 'payload_too_large',
      message: 'Los archivos juntos pesan demasiado. Usa imágenes más pequeñas o menos páginas.',
    });
  }

  const concatForHash = files.map((f) => f.base64).join('|');
  const primaryMediaType = files[0].mediaType;

  const t0 = Date.now();
  const payloadKB = Math.round(totalSize / 1024);
  const imageHash = sha256Hex(concatForHash);
  const ipHash = sha256Hex(ip + IP_HASH_SALT);

  // === CACHE: if same exact image(s) analyzed before, return instantly. Free for user. ===
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const cached = await findCachedByHash(imageHash);
    if (cached) {
      return res.status(200).json({
        ...cached.analysis_json,
        analysisId: cached.id,
        cached: true,
        usesRemaining: computeUsesRemaining(appUser),
        _timing: { totalMs: Date.now() - t0, payloadKB, mediaType: primaryMediaType, source: 'cache', files: files.length },
      });
    }
  }

  // === QUOTA (beta + per-user) ===
  const remaining = computeUsesRemaining(appUser);
  if (remaining <= 0) {
    return res.status(429).json({
      error: 'quota_exhausted',
      message: 'Usaste todos tus análisis. Invita amigos para ganar más, o espera al 4 de mayo cuando arranca Reboot 30.',
      user: {
        referralCode: appUser.referral_code,
        usesRemaining: 0,
      },
      ctaUrl: 'https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html?utm_source=semaforo&utm_medium=quota&utm_campaign=reboot30',
    });
  }

  // === Run analysis ===
  try {
    const result = await analyzeMenu({
      files,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const tClaude = Date.now() - t0;

    // Log to Supabase with user_id + city
    let analysisId = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const client = getSupabase();
        const { data: row, error } = await client
          .from('menu_analyses')
          .insert({
            analysis_json: result,
            model: 'claude-haiku-4-5',
            prompt_version: 'v2',
            image_hash: imageHash,
            image_bytes: Math.round(totalSize * 0.75),
            user_agent: req.headers['user-agent']?.slice(0, 300) || null,
            ip_hash: ipHash,
            user_id: appUser.id,
            city_code: appUser.city,
            is_menu: !result?.error,
            num_items: Array.isArray(result?.items) ? result.items.length : null,
          })
          .select('id')
          .single();
        if (!error) analysisId = row?.id || null;
      } catch (err) {
        console.error('log analysis error', err);
      }
    }

    // Count usage only on successful, non-cached analyses (including no_menu_detected — user tried)
    await incrementUsage(appUser);
    const newRemaining = Math.max(0, remaining - 1);

    return res.status(200).json({
      ...result,
      analysisId,
      usesRemaining: newRemaining,
      _timing: { claudeMs: tClaude, totalMs: Date.now() - t0, payloadKB, mediaType: primaryMediaType, files: files.length },
    });
  } catch (err) {
    const elapsed = Date.now() - t0;
    console.error('analyze error:', err);
    if (err.code === 'INVALID_RESPONSE') {
      return res.status(502).json({
        error: 'invalid_model_response',
        message: 'El modelo devolvió algo inesperado. Intenta con otra foto.',
      });
    }
    const isTimeout = err?.name === 'AbortError' || /timeout|timed out/i.test(err?.message || '');
    return res.status(500).json({
      error: isTimeout ? 'timeout' : 'internal_error',
      message: isTimeout
        ? 'El menú es muy grande y el análisis tardó más de lo esperado.'
        : 'Algo falló del lado nuestro. Intenta de nuevo en un minuto.',
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '14mb' } },
};
