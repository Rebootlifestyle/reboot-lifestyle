import { getSupabase } from './supabase.js';

const VALID_CITIES = new Set([
  'panama_city', 'david',
  'bogota', 'medellin', 'cartagena',
  'cdmx', 'guadalajara', 'monterrey',
  'miami', 'new_york',
  'buenos_aires', 'lima', 'santiago_cl', 'quito', 'san_jose_cr',
  'madrid', 'barcelona',
]);

export function isValidCity(city) {
  return typeof city === 'string' && VALID_CITIES.has(city);
}

/**
 * Returns the app_users row for this auth user id, or null if not yet created.
 */
export async function getAppUser(userId) {
  if (!userId) return null;
  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Creates the app_users row on first login. Generates a referral code server-side.
 * Optionally attaches referred_by (the id of the user whose ref code was used).
 * Returns the created row, or null on error.
 */
export async function createAppUser({ id, email, city, referredByCode }) {
  if (!id || !email || !isValidCity(city)) return null;
  try {
    const client = getSupabase();

    // Resolve referrer id from their code, if provided
    let referredById = null;
    if (referredByCode && typeof referredByCode === 'string') {
      const { data: ref } = await client
        .from('app_users')
        .select('id')
        .eq('referral_code', referredByCode)
        .maybeSingle();
      if (ref?.id && ref.id !== id) referredById = ref.id;
    }

    // Generate referral code server-side
    const { data: codeRow, error: codeErr } = await client
      .rpc('generate_referral_code', { email_input: email });
    if (codeErr) {
      console.error('generate_referral_code error', codeErr);
      return null;
    }

    const { data: inserted, error: insErr } = await client
      .from('app_users')
      .insert({
        id,
        email: email.toLowerCase(),
        city,
        referral_code: codeRow,
        referred_by: referredById,
      })
      .select('*')
      .single();

    if (insErr) {
      console.error('createAppUser insert error', insErr);
      return null;
    }

    // Award +1 bonus use to the referrer
    if (referredById) {
      await client
        .from('app_users')
        .update({ bonus_uses: client.rpc ? undefined : undefined })
        // Supabase doesn't let us do x += 1 in a simple update; fetch-then-update
        .eq('id', referredById);
      const { data: r } = await client
        .from('app_users')
        .select('bonus_uses')
        .eq('id', referredById)
        .maybeSingle();
      if (r) {
        await client
          .from('app_users')
          .update({ bonus_uses: (r.bonus_uses || 0) + 1 })
          .eq('id', referredById);
      }
    }

    return inserted;
  } catch (err) {
    console.error('createAppUser unexpected', err);
    return null;
  }
}

/**
 * Idempotent: returns existing app_user or creates one.
 */
export async function ensureAppUser({ id, email, city, referredByCode }) {
  const existing = await getAppUser(id);
  if (existing) return existing;
  return createAppUser({ id, email, city, referredByCode });
}

/**
 * Computes how many analyses this user has left.
 * Admins get effectively unlimited uses.
 */
export function computeUsesRemaining(user) {
  if (!user) return 0;
  if (user.is_admin) return 999;
  return Math.max(0, 3 + (user.bonus_uses || 0) - (user.total_uses || 0));
}

/**
 * Increments total_uses by 1. Admins are not counted.
 */
export async function incrementUsage(user) {
  if (!user || user.is_admin) return;
  try {
    const client = getSupabase();
    await client
      .from('app_users')
      .update({ total_uses: (user.total_uses || 0) + 1 })
      .eq('id', user.id);
  } catch {}
}
