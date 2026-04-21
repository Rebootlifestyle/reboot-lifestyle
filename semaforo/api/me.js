import { getAuthUser } from '../lib/auth.js';
import { ensureAppUser, computeUsesRemaining } from '../lib/appUsers.js';

/**
 * GET  /api/me                   returns current user's profile + usage
 * POST /api/me  { city, ref? }   creates or updates the app_users row on first login
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const authUser = await getAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'unauthorized' });

  if (req.method === 'GET') {
    const appUser = await (await import('../lib/appUsers.js')).getAppUser(authUser.id);
    if (!appUser) {
      return res.status(404).json({ error: 'profile_incomplete', message: 'Completa tu perfil.' });
    }
    return res.status(200).json({
      email: appUser.email,
      city: appUser.city,
      referralCode: appUser.referral_code,
      usesRemaining: computeUsesRemaining(appUser),
      isAdmin: appUser.is_admin,
    });
  }

  if (req.method === 'POST') {
    const { city, ref } = req.body || {};
    const user = await ensureAppUser({
      id: authUser.id,
      email: authUser.email,
      city,
      referredByCode: ref,
    });
    if (!user) {
      return res.status(400).json({ error: 'invalid_input', message: 'Ciudad no válida o error al crear perfil.' });
    }
    return res.status(200).json({
      email: user.email,
      city: user.city,
      referralCode: user.referral_code,
      usesRemaining: computeUsesRemaining(user),
      isAdmin: user.is_admin,
    });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
