import { getSupabase } from '../lib/supabase.js';
import { getAuthUser } from '../lib/auth.js';
import { getAppUser, isValidCity } from '../lib/appUsers.js';

/**
 * GET /api/search?q=<query>&city=<city_code>&all=1
 * Requires auth. Filters by the user's own city by default; pass &all=1 to see
 * results across all cities.
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

  const q = (req.query?.q || '').toString().trim();
  if (!q || q.length < 2) return res.status(200).json({ results: [], city: appUser.city });
  if (q.length > 100) return res.status(400).json({ error: 'query_too_long' });

  const allCities = req.query?.all === '1' || req.query?.all === 'true';
  const cityFilter = req.query?.city && isValidCity(req.query.city) ? req.query.city : appUser.city;

  try {
    const client = getSupabase();
    let query = client
      .from('menu_analyses')
      .select('id, restaurant_name, analysis_json, created_at, city_code')
      .not('restaurant_name', 'is', null)
      .eq('is_menu', true)
      .ilike('restaurant_name', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!allCities) query = query.eq('city_code', cityFilter);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'db_error' });

    // Dedupe by (restaurant_name + city_code), latest wins
    const seen = new Map();
    for (const row of data || []) {
      const key = `${row.restaurant_name.trim().toLowerCase()}|${row.city_code || ''}`;
      if (!seen.has(key)) seen.set(key, row);
    }
    const dedupe = Array.from(seen.values()).slice(0, 10);

    // Exact-match first
    const lowerQ = q.toLowerCase();
    dedupe.sort((a, b) => {
      const aExact = a.restaurant_name.trim().toLowerCase() === lowerQ ? 0 : 1;
      const bExact = b.restaurant_name.trim().toLowerCase() === lowerQ ? 0 : 1;
      return aExact - bExact;
    });

    const results = dedupe.map((row) => ({
      id: row.id,
      name: row.restaurant_name,
      city: row.city_code,
      createdAt: row.created_at,
      summary: row.analysis_json?.summary || null,
    }));

    return res.status(200).json({ results, city: cityFilter, all: allCities });
  } catch (err) {
    console.error('search unexpected:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export const config = { api: { bodyParser: false } };
