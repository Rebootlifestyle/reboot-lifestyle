import { getSupabase } from '../lib/supabase.js';
import { getAuthUser } from '../lib/auth.js';
import { getAppUser } from '../lib/appUsers.js';

/**
 * GET /api/menu?id=<analysisId>
 * Returns a saved analysis by id. Requires auth.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'db_unavailable' });
  }

  const authUser = await getAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'unauthorized' });
  const appUser = await getAppUser(authUser.id);
  if (!appUser) return res.status(403).json({ error: 'profile_incomplete' });

  const idRaw = req.query?.id;
  const id = parseInt(idRaw, 10);
  if (!id || Number.isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'bad_request', message: 'ID inválido.' });
  }

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('menu_analyses')
      .select('id, restaurant_name, analysis_json, created_at, is_menu, city_code')
      .eq('id', id)
      .eq('is_menu', true)
      .single();

    if (error || !data) return res.status(404).json({ error: 'not_found' });

    return res.status(200).json({
      id: data.id,
      name: data.restaurant_name,
      city: data.city_code,
      createdAt: data.created_at,
      analysis: data.analysis_json,
    });
  } catch (err) {
    console.error('menu get unexpected:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export const config = { api: { bodyParser: false } };
