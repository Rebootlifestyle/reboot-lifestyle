import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

let cached = null;

/**
 * Returns a singleton Supabase client using the service_role key.
 * The service_role key bypasses RLS and is ONLY safe to use server-side (Vercel function).
 * Never expose this client or key to browser code.
 */
export function getSupabase() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Inserts a row in menu_analyses. Returns { id } on success, or null if the
 * database write fails (we swallow errors so analyses never break because of DB).
 */
export async function logAnalysis({
  analysisJson,
  imageHash,
  imageBytes,
  userAgent,
  ipHash,
  model = 'claude-sonnet-4-6',
  promptVersion = 'v1',
}) {
  try {
    const client = getSupabase();
    const isMenu = !analysisJson?.error;
    const numItems = Array.isArray(analysisJson?.items) ? analysisJson.items.length : null;

    const { data, error } = await client
      .from('menu_analyses')
      .insert({
        analysis_json: analysisJson,
        model,
        prompt_version: promptVersion,
        image_hash: imageHash,
        image_bytes: imageBytes,
        user_agent: userAgent,
        ip_hash: ipHash,
        is_menu: isMenu,
        num_items: numItems,
      })
      .select('id')
      .single();

    if (error) {
      console.error('supabase insert error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('supabase unexpected error:', err);
    return null;
  }
}

/**
 * Attaches restaurant attribution metadata to an existing analysis row.
 * Returns true on success, false on failure.
 */
export async function attributeAnalysis({
  analysisId,
  restaurantName,
  lat,
  lng,
  accuracyM,
}) {
  try {
    const client = getSupabase();
    const update = {};
    if (typeof restaurantName === 'string' && restaurantName.trim()) {
      update.restaurant_name = restaurantName.trim().slice(0, 200);
    }
    if (typeof lat === 'number' && typeof lng === 'number') {
      update.restaurant_lat = lat;
      update.restaurant_lng = lng;
    }
    if (typeof accuracyM === 'number') {
      update.location_accuracy_m = accuracyM;
    }
    if (Object.keys(update).length === 0) return false;

    const { error } = await client
      .from('menu_analyses')
      .update(update)
      .eq('id', analysisId);

    if (error) {
      console.error('supabase attribute error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('supabase attribute unexpected error:', err);
    return false;
  }
}

/**
 * Computes a sha256 hash of an input string, returning its hex digest.
 * Used to hash images (for dedupe) and IPs (for privacy-respecting rate tracking).
 */
export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Counts fresh analyses attributed to this ip_hash since `since` timestamp.
 * Used for beta-mode limiting (3 analyses per IP until launch date).
 * Returns 0 on any error — we prefer letting a user through over blocking.
 */
export async function countAnalysesByIp(ipHash, sinceIso) {
  if (!ipHash) return 0;
  try {
    const client = getSupabase();
    let query = client
      .from('menu_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash);
    if (sinceIso) query = query.gte('created_at', sinceIso);
    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Looks up the most recent successful analysis for this exact image hash.
 * Returns { id, analysis_json } or null. Never throws — caller should treat
 * null as "no cache, proceed with new analysis".
 */
export async function findCachedByHash(imageHash) {
  if (!imageHash) return null;
  try {
    const client = getSupabase();
    // Cache any prior analysis with this exact image, including
    // 'no_menu_detected' — re-analyzing the same bytes wastes tokens.
    const { data, error } = await client
      .from('menu_analyses')
      .select('id, analysis_json')
      .eq('image_hash', imageHash)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
