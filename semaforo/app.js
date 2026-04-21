import { renderResult, renderAttribution, prepareFile, escapeHtml } from '/clientUtils.js';
import { sendMagicLink, onAuthChange, getSession, authFetch, signOut } from '/auth-client.js';

// ---- App state ----
let currentAnalysisId = null;
let loadingTimerInterval = null;
let currentUser = null; // { email, city, referralCode, usesRemaining, isAdmin }

// ---- DOM ----
const $ = (sel) => document.querySelector(sel);

const authLogin = $('#auth-login');
const authSignup = $('#auth-signup');
const loginForm = $('#auth-login-form');
const loginEmail = $('#auth-email');
const loginSubmit = $('#auth-login-submit');
const loginStatus = $('#auth-login-status');

const signupForm = $('#auth-signup-form');
const signupCity = $('#auth-city');
const signupSubmit = $('#auth-signup-submit');
const signupStatus = $('#auth-signup-status');
const signupRefNote = $('#auth-ref-note');

const userTopbar = $('#user-topbar');
const topbarCity = $('#user-topbar-city');
const topbarUses = $('#user-topbar-uses');
const inviteBtn = $('#user-invite-btn');
const logoutBtn = $('#user-logout-btn');

const uploadSection = $('#upload-section');
const loadingSection = $('#loading-section');
const resultSection = $('#result-section');
const errorSection = $('#error-section');
const cameraInput = $('#camera-input');
const galleryInput = $('#gallery-input');
const searchInput = $('#search-input');
const searchResults = $('#search-results');
const loadingText = $('#loading-text');
const loadingTimer = $('#loading-timer');
const resultContainer = $('#result-container');
const errorMessage = $('#error-message');
const retryBtn = $('#retry-btn');
const newAnalysisBtn = $('#new-analysis-btn');
const shareBtn = $('#share-whatsapp-btn');
const ctaBtn = $('#cta-reboot30');

// ---- City labels (for UI) ----
const CITY_LABELS = {
  panama_city: 'Ciudad de Panamá', david: 'David',
  bogota: 'Bogotá', medellin: 'Medellín', cartagena: 'Cartagena',
  cdmx: 'Ciudad de México', guadalajara: 'Guadalajara', monterrey: 'Monterrey',
  miami: 'Miami', new_york: 'Nueva York',
  buenos_aires: 'Buenos Aires', lima: 'Lima', santiago_cl: 'Santiago de Chile',
  quito: 'Quito', san_jose_cr: 'San José (CR)',
  madrid: 'Madrid', barcelona: 'Barcelona',
};
function cityLabel(code) { return CITY_LABELS[code] || code || '—'; }

// ---- Referral code from URL ----
function readRefFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('reboot_ref', ref);
  } catch {}
}
function getStoredRef() {
  try { return localStorage.getItem('reboot_ref'); } catch { return null; }
}
function clearStoredRef() {
  try { localStorage.removeItem('reboot_ref'); } catch {}
}
readRefFromUrl();

// ---- Sections ----
function showSection(section) {
  [authLogin, authSignup, uploadSection, loadingSection, resultSection, errorSection].forEach((s) => {
    if (s) s.hidden = true;
  });
  if (section) section.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Auth bootstrap ----
async function bootstrapAuth() {
  const session = await getSession();
  if (!session?.user) {
    showSection(authLogin);
    updateTopbar(null);
    return;
  }
  // Session exists → try loading profile
  try {
    const res = await authFetch('/api/me');
    if (res.status === 404) {
      // Profile missing → finish signup
      prefillRefNote();
      showSection(authSignup);
      updateTopbar(null);
      return;
    }
    if (!res.ok) throw new Error('load profile failed');
    const data = await res.json();
    currentUser = data;
    updateTopbar(data);
    showSection(uploadSection);
  } catch (err) {
    console.error('bootstrap error', err);
    showSection(authLogin);
  }
}

function prefillRefNote() {
  const ref = getStoredRef();
  if (ref && signupRefNote) {
    signupRefNote.textContent = `Te invitó ${ref} — ellos ganan 1 análisis extra cuando entres.`;
    signupRefNote.hidden = false;
  }
}

function updateTopbar(user) {
  if (!userTopbar) return;
  if (!user) {
    userTopbar.hidden = true;
    return;
  }
  userTopbar.hidden = false;
  topbarCity.textContent = cityLabel(user.city);
  topbarUses.textContent = user.isAdmin ? '∞ usos' : `${user.usesRemaining} usos`;
}

onAuthChange((user) => {
  if (!user) {
    currentUser = null;
    updateTopbar(null);
    showSection(authLogin);
  } else {
    // User just signed in or session refreshed → re-bootstrap to get profile
    bootstrapAuth();
  }
});

// ---- Auth handlers ----
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (loginEmail.value || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    loginStatus.textContent = 'Pon un email válido.';
    loginStatus.dataset.kind = 'error';
    return;
  }
  loginSubmit.disabled = true;
  loginStatus.textContent = 'Enviando link…';
  loginStatus.dataset.kind = 'info';
  try {
    await sendMagicLink(email);
    loginStatus.textContent = `✓ Te mandamos un link a ${email}. Ábrelo desde el mismo celular.`;
    loginStatus.dataset.kind = 'success';
  } catch (err) {
    console.error(err);
    loginStatus.textContent = 'No pudimos enviar el link. Verifica el email y prueba otra vez.';
    loginStatus.dataset.kind = 'error';
  } finally {
    loginSubmit.disabled = false;
  }
});

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = signupCity.value;
  if (!city) {
    signupStatus.textContent = 'Elige tu ciudad.';
    signupStatus.dataset.kind = 'error';
    return;
  }
  signupSubmit.disabled = true;
  signupStatus.textContent = 'Creando tu perfil…';
  signupStatus.dataset.kind = 'info';
  try {
    const ref = getStoredRef();
    const res = await authFetch('/api/me', {
      method: 'POST',
      body: JSON.stringify({ city, ref: ref || undefined }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error creando perfil');
    }
    const data = await res.json();
    currentUser = data;
    clearStoredRef();
    updateTopbar(data);
    showSection(uploadSection);
  } catch (err) {
    console.error(err);
    signupStatus.textContent = 'No pudimos crear tu perfil. Intenta de nuevo.';
    signupStatus.dataset.kind = 'error';
  } finally {
    signupSubmit.disabled = false;
  }
});

logoutBtn?.addEventListener('click', async () => {
  await signOut();
  currentUser = null;
  updateTopbar(null);
  showSection(authLogin);
});

// ---- Invite flow ----
inviteBtn?.addEventListener('click', async () => {
  if (!currentUser?.referralCode) return;
  const url = `https://menu.rebootlifestyle.com?ref=${encodeURIComponent(currentUser.referralCode)}`;
  const text = `Te comparto el Semáforo Reboot — sube foto de cualquier menú y te dice qué pedir. Entra con mi link y ambos ganamos un análisis extra.\n\n${url}`;

  // Try WhatsApp share; fall back to clipboard
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Semáforo Reboot', text, url });
      return;
    }
  } catch {}

  try {
    await navigator.clipboard.writeText(text);
    inviteBtn.textContent = 'Copiado ✓';
    setTimeout(() => (inviteBtn.textContent = 'Invitar +'), 2000);
  } catch {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }
});

// ---- Analysis pipeline ----
const loadingMessages = [
  'Leyendo el menú…',
  'Aplicando los estándares Reboot…',
  'Preparando sugerencias…',
];

function cycleLoadingMessages() {
  let i = 0;
  loadingText.textContent = loadingMessages[0];
  return setInterval(() => {
    i = (i + 1) % loadingMessages.length;
    loadingText.textContent = loadingMessages[i];
  }, 2500);
}

function startLoadingTimer() {
  const start = Date.now();
  if (loadingTimer) loadingTimer.textContent = '0 s';
  if (loadingTimerInterval) clearInterval(loadingTimerInterval);
  loadingTimerInterval = setInterval(() => {
    if (loadingTimer) loadingTimer.textContent = `${Math.floor((Date.now() - start) / 1000)} s`;
  }, 1000);
  return loadingTimerInterval;
}
function stopLoadingTimer() {
  if (loadingTimerInterval) {
    clearInterval(loadingTimerInterval);
    loadingTimerInterval = null;
  }
}

function trackEvent(name, data = {}) {
  if (window.fbq) window.fbq('trackCustom', name, data);
  console.log('[event]', name, data);
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []).slice(0, 8);
  if (files.length === 0) return;

  for (const file of files) {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      showError('Archivo no soportado. Sube foto (JPG/PNG) o PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Uno de los archivos pesa más de 10MB. Prueba con menos páginas.');
      return;
    }
  }

  showSection(loadingSection);
  if (files.length > 1) {
    loadingText.textContent = `Leyendo ${files.length} páginas del menú…`;
  }
  const loadingInterval = cycleLoadingMessages();
  startLoadingTimer();
  trackEvent('analysis_started', { pages: files.length });

  try {
    const prepared = await Promise.all(files.map((f) => prepareFile(f)));
    const payloadFiles = prepared.map((p) => ({ base64: p.base64, mediaType: p.mediaType }));

    const response = await authFetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ files: payloadFiles }),
    });

    clearInterval(loadingInterval);
    stopLoadingTimer();

    if (response.status === 401) {
      showSection(authLogin);
      return;
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      if (errBody.error === 'quota_exhausted') {
        resultContainer.innerHTML = renderQuotaExhausted(errBody);
        showSection(resultSection);
        trackEvent('quota_exhausted');
        return;
      }
      showError(errBody.message || 'Algo falló. Intenta de nuevo en un minuto.');
      return;
    }

    const data = await response.json();
    currentAnalysisId = data.analysisId || null;
    if (typeof data.usesRemaining === 'number' && currentUser) {
      currentUser.usesRemaining = data.usesRemaining;
      updateTopbar(currentUser);
    }
    const resultHtml = renderResult(data);
    const attributionHtml = currentAnalysisId && !data.error ? renderAttribution() : '';
    resultContainer.innerHTML = resultHtml + attributionHtml;
    if (currentAnalysisId && !data.error) wireAttribution();
    showSection(resultSection);
    trackEvent('analysis_completed', { total: data.summary?.total ?? 0, usesRemaining: data.usesRemaining });
  } catch (err) {
    clearInterval(loadingInterval);
    stopLoadingTimer();
    console.error(err);
    showError('No pudimos procesar la imagen. Intenta de nuevo.');
  }
}

function renderQuotaExhausted(errBody) {
  const ctaUrl = errBody.ctaUrl || 'https://rebootlifestyle.github.io/reboot-lifestyle/reboot30.html?utm_source=semaforo&utm_medium=quota';
  const ref = currentUser?.referralCode || '';
  const inviteUrl = ref ? `https://menu.rebootlifestyle.com?ref=${ref}` : '';
  return `
    <section class="beta-gate">
      <p class="beta-gate__eyebrow">CUOTA AGOTADA</p>
      <h2 class="beta-gate__title">Usaste tus <span class="hl">análisis</span></h2>
      <p class="beta-gate__copy">Invita amigos con tu link: por cada uno que entre, ganas <strong>+1 análisis</strong>. O regístrate al Reboot 30 y se libera el acceso completo el 4 de mayo.</p>
      ${inviteUrl ? `<button type="button" class="btn-primary beta-gate__cta" id="quota-invite-btn">Invitar amigos →</button>` : ''}
      <a class="btn-secondary beta-gate__cta" href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener" style="margin-top:10px">Ir al Reboot 30</a>
      <p class="beta-gate__date">4 · MAYO · 2026</p>
    </section>
  `;
}

// Re-wire invite button inside the quota-exhausted screen
document.addEventListener('click', (e) => {
  if (e.target?.id === 'quota-invite-btn') {
    inviteBtn?.click();
  }
});

function showError(msg) {
  errorMessage.textContent = msg;
  showSection(errorSection);
}

[cameraInput, galleryInput].forEach((input) => {
  input?.addEventListener('change', (e) => {
    const files = e.target.files;
    const list = files ? Array.from(files) : [];
    e.target.value = '';
    if (list.length > 0) handleFiles(list);
  });
});

retryBtn?.addEventListener('click', () => showSection(uploadSection));
newAnalysisBtn?.addEventListener('click', () => showSection(uploadSection));

shareBtn?.addEventListener('click', () => {
  const url = 'https://menu.rebootlifestyle.com';
  const text = encodeURIComponent(`Acabo de analizar un menú con el Semáforo Reboot. Pruébalo tú: ${url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  trackEvent('share_whatsapp_clicked');
});

ctaBtn?.addEventListener('click', () => trackEvent('cta_reboot30_clicked'));

// ---- Search ----
let searchDebounce = null;
function renderSearchResults(results, query) {
  if (!searchResults) return;
  searchResults.innerHTML = '';
  if (!query || query.length < 2) { searchResults.hidden = true; return; }
  if (results.length === 0) {
    searchResults.innerHTML = '<li class="search-empty">No lo tenemos en tu ciudad todavía. Sube foto del menú y lo agregamos.</li>';
    searchResults.hidden = false;
    return;
  }
  for (const r of results) {
    const total = r.summary?.total ?? '?';
    const li = document.createElement('li');
    li.className = 'search-result';
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.dataset.id = r.id;
    li.innerHTML = `
      <span class="search-result__name">${escapeHtml(r.name)}</span>
      <span class="search-result__meta">${total} platos · ${cityLabel(r.city)}</span>
    `;
    const open = () => openSavedMenu(r.id);
    li.addEventListener('click', open);
    li.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); }
    });
    searchResults.appendChild(li);
  }
  searchResults.hidden = false;
}

async function runSearch(query) {
  if (!query || query.length < 2) { renderSearchResults([], query); return; }
  try {
    const res = await authFetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('server');
    const data = await res.json();
    renderSearchResults(data.results || [], query);
  } catch {
    renderSearchResults([], query);
  }
}

searchInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => runSearch(q), 250);
});
searchInput?.addEventListener('focus', () => {
  const q = searchInput.value.trim();
  if (q.length >= 2) runSearch(q);
});
document.addEventListener('click', (e) => {
  if (!searchInput || !searchResults) return;
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) searchResults.hidden = true;
});

async function openSavedMenu(id) {
  if (!id) return;
  trackEvent('library_hit', { id });
  showSection(loadingSection);
  loadingText.textContent = 'Trayendo el análisis guardado…';
  startLoadingTimer();
  try {
    const res = await authFetch(`/api/menu?id=${encodeURIComponent(id)}`);
    stopLoadingTimer();
    if (!res.ok) { showError('No encontramos ese análisis. Sube foto del menú para crearlo.'); return; }
    const data = await res.json();
    currentAnalysisId = null;
    const banner = `<div class="saved-banner">
      <strong>${escapeHtml(data.name || 'Restaurante')}</strong>
      <span>· ${cityLabel(data.city)} · Análisis guardado</span>
    </div>`;
    resultContainer.innerHTML = banner + renderResult(data.analysis || {});
    showSection(resultSection);
  } catch {
    stopLoadingTimer();
    showError('No pudimos traer el análisis. Intenta de nuevo.');
  }
}

// ---- Attribution (unchanged logic, now also auth-aware) ----
function wireAttribution() {
  const locBtn = document.getElementById('attr-location-btn');
  const nameBtn = document.getElementById('attr-name-btn');
  const nameForm = document.getElementById('attr-name-form');
  const nameInput = document.getElementById('attr-name-input');
  const statusEl = document.getElementById('attr-status');

  const setStatus = (msg, kind = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.kind = kind;
  };

  const lock = () => {
    [locBtn, nameBtn].forEach((b) => b && (b.disabled = true));
    if (nameForm) nameForm.hidden = true;
  };

  async function postAttribution(body) {
    try {
      const res = await authFetch('/api/attribute', {
        method: 'POST',
        body: JSON.stringify({ analysisId: currentAnalysisId, ...body }),
      });
      if (!res.ok) throw new Error('server');
      setStatus('✓ Gracias, quedó guardado.', 'success');
      lock();
      trackEvent('attribution_saved', { hasName: !!body.restaurantName, hasLoc: typeof body.lat === 'number' });
    } catch {
      setStatus('No pudimos guardar. Intenta de nuevo en un momento.', 'error');
    }
  }

  locBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) { setStatus('Tu navegador no soporta ubicación.', 'error'); return; }
    setStatus('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        postAttribution({ lat: latitude, lng: longitude, accuracyM: accuracy });
      },
      (err) => {
        const msg = err.code === 1 ? 'Permiso de ubicación denegado.'
          : err.code === 3 ? 'La ubicación tardó demasiado.'
          : 'No pudimos obtener tu ubicación (¿estás indoor?).';
        setStatus(msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

  nameBtn?.addEventListener('click', () => {
    if (nameForm) { nameForm.hidden = false; nameInput?.focus(); }
  });

  nameForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = nameInput?.value?.trim();
    if (!val) return;
    postAttribution({ restaurantName: val });
  });
}

// ---- Start ----
bootstrapAuth();
