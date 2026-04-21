// Browser-side auth helper using the Supabase JS SDK via ESM CDN.
// Exposes: sendMagicLink, onAuthChange, getSession, getAccessToken, signOut.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Public config (anon key is safe to expose)
const SUPABASE_URL = 'https://lksphyumpahlzzrssevu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xILSjcsqqg3fOlwbALDDbg_IpZSCYA-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/** Kick off magic-link flow. Supabase sends the email. */
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** Register a handler for auth state changes. Returns unsubscribe fn. */
export function onAuthChange(cb) {
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    cb(session?.user || null, session, event);
  });
  return () => sub.subscription.unsubscribe();
}

/** Fetch wrapper that attaches the Supabase access token automatically. */
export async function authFetch(url, opts = {}) {
  const token = await getAccessToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (opts.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...opts, headers });
}
