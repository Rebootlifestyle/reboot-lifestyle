import { createClient } from '@supabase/supabase-js';

/**
 * Extracts and validates a Bearer JWT from the Authorization header.
 * Returns the authenticated user (from auth.users) or null if invalid/missing.
 * This is Supabase's own JWT — we verify it against the project's JWT secret
 * by asking Supabase to resolve it, which is the cheapest secure path.
 */
export async function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  if (!process.env.SUPABASE_URL) return null;
  const publicKey = process.env.SUPABASE_ANON_KEY;
  if (!publicKey) return null;

  try {
    // Use a per-request client scoped to this token so RLS applies to the caller.
    const client = createClient(process.env.SUPABASE_URL, publicKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
