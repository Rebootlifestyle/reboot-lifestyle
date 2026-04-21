import { attributeAnalysis } from '../lib/supabase.js';
import { getAuthUser } from '../lib/auth.js';
import { getAppUser } from '../lib/appUsers.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'db_unavailable' });
  }

  const authUser = await getAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'unauthorized' });
  const appUser = await getAppUser(authUser.id);
  if (!appUser) return res.status(403).json({ error: 'profile_incomplete' });

  const { analysisId, restaurantName, lat, lng, accuracyM } = req.body || {};

  if (!analysisId || typeof analysisId !== 'number') {
    return res.status(400).json({ error: 'bad_request', message: 'Falta analysisId válido.' });
  }
  if (restaurantName != null && typeof restaurantName !== 'string') {
    return res.status(400).json({ error: 'bad_request', message: 'restaurantName inválido.' });
  }
  if (lat != null && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
    return res.status(400).json({ error: 'bad_request', message: 'Latitud inválida.' });
  }
  if (lng != null && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
    return res.status(400).json({ error: 'bad_request', message: 'Longitud inválida.' });
  }

  const ok = await attributeAnalysis({
    analysisId,
    restaurantName,
    lat,
    lng,
    accuracyM,
  });

  if (!ok) return res.status(500).json({ error: 'db_error', message: 'No pudimos guardar. Intenta otra vez.' });
  return res.status(200).json({ ok: true });
}

export const config = { api: { bodyParser: { sizeLimit: '10kb' } } };
