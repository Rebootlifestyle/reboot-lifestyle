import { renderResult, renderAttribution, renderBetaBanner, renderBetaLimitReached, prepareFile, escapeHtml } from '/clientUtils.js';

let currentAnalysisId = null;
let loadingTimerInterval = null;

const loadingMessages = [
  'Leyendo el menú…',
  'Aplicando los estándares Reboot…',
  'Preparando sustituciones…',
];

const $ = (sel) => document.querySelector(sel);
const uploadSection = $('#upload-section');
const loadingSection = $('#loading-section');
const resultSection = $('#result-section');
const errorSection = $('#error-section');
const cameraInput = $('#camera-input');
const galleryInput = $('#gallery-input');
const searchInput = $('#search-input');
const searchResults = $('#search-results');
const loadingTimer = $('#loading-timer');
const resultContainer = $('#result-container');
const loadingText = $('#loading-text');
const errorMessage = $('#error-message');
const retryBtn = $('#retry-btn');
const newAnalysisBtn = $('#new-analysis-btn');
const shareBtn = $('#share-whatsapp-btn');
const ctaBtn = $('#cta-reboot30');

function showSection(section) {
  [uploadSection, loadingSection, resultSection, errorSection].forEach((s) => (s.hidden = true));
  section.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
  // Vercel Analytics captures page views by default; custom events go here later.
  if (window.fbq) window.fbq('trackCustom', name, data);
  console.log('[event]', name, data);
}

async function handleFile(file) {
  if (!file) return;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  if (!isImage && !isPdf) {
    showError('Archivo no soportado. Sube una foto (JPG/PNG) o un PDF del menú.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError(isPdf
      ? 'El PDF pesa más de 10MB. Prueba con un PDF más pequeño o toma foto de las páginas.'
      : 'La imagen pesa más de 10MB. Tómale otra foto más pequeña.');
    return;
  }

  showSection(loadingSection);
  const loadingInterval = cycleLoadingMessages();
  const timerInterval = startLoadingTimer();
  trackEvent('analysis_started', { kind: isPdf ? 'pdf' : 'image' });

  try {
    const { base64, mediaType } = await prepareFile(file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64: base64, mediaType }),
    });

    clearInterval(loadingInterval);
    stopLoadingTimer();

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      // Beta quota exhausted → dedicated gate with Reboot 30 CTA
      if (errBody.error === 'beta_limit_reached') {
        resultContainer.innerHTML = renderBetaLimitReached(errBody.beta);
        showSection(resultSection);
        trackEvent('beta_limit_reached');
        return;
      }
      const msg = errBody.message || 'Algo falló del lado nuestro. Intenta de nuevo en un minuto.';
      const kind = errBody.error || 'unknown';
      const dbg = errBody._debug ? '\n\n[DEBUG]\n' + JSON.stringify(errBody._debug, null, 2) : '';
      showError(`${msg}\n\n[status: ${response.status}] [kind: ${kind}]${dbg}`);
      return;
    }

    const data = await response.json();
    currentAnalysisId = data.analysisId || null;
    const betaBannerHtml = data.beta ? renderBetaBanner(data.beta) : '';
    const resultHtml = renderResult(data);
    const attributionHtml = currentAnalysisId && !data.error ? renderAttribution() : '';
    resultContainer.innerHTML = betaBannerHtml + resultHtml + attributionHtml;
    if (currentAnalysisId && !data.error) wireAttribution();
    showSection(resultSection);
    trackEvent('analysis_completed', { total: data.summary?.total ?? 0, betaRemaining: data.beta?.remaining });
  } catch (err) {
    clearInterval(loadingInterval);
    stopLoadingTimer();
    console.error(err);
    showError('No pudimos procesar la imagen. Intenta de nuevo.');
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  showSection(errorSection);
}

[cameraInput, galleryInput].forEach((input) => {
  input.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleFile(file);
  });
});

retryBtn.addEventListener('click', () => showSection(uploadSection));
newAnalysisBtn.addEventListener('click', () => showSection(uploadSection));

shareBtn.addEventListener('click', async () => {
  const url = window.location.origin;
  const text = encodeURIComponent(
    `Acabo de analizar un menú con el Semáforo Reboot. Pruébalo tú: ${url}`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  trackEvent('share_whatsapp_clicked');
});

ctaBtn?.addEventListener('click', () => trackEvent('cta_reboot30_clicked'));

// --- Restaurant search (pre-upload lookup in the library) ---
let searchDebounce = null;

function renderSearchResults(results, query) {
  if (!searchResults) return;
  searchResults.innerHTML = '';

  if (!query || query.length < 2) {
    searchResults.hidden = true;
    return;
  }

  if (results.length === 0) {
    searchResults.innerHTML = '<li class="search-empty">No lo tenemos en la biblioteca todavía. Sube foto del menú y lo agregamos.</li>';
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
      <span class="search-result__meta">${total} platos</span>
    `;
    const open = () => openSavedMenu(r.id);
    li.addEventListener('click', open);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    searchResults.appendChild(li);
  }
  searchResults.hidden = false;
}

async function runSearch(query) {
  if (!query || query.length < 2) {
    renderSearchResults([], query);
    return;
  }
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('server');
    const data = await res.json();
    renderSearchResults(data.results || [], query);
  } catch {
    // silent fail — no mostramos error para search
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
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.hidden = true;
  }
});

async function openSavedMenu(id) {
  if (!id) return;
  trackEvent('library_hit', { id });
  showSection(loadingSection);
  loadingText.textContent = 'Trayendo el análisis guardado…';
  startLoadingTimer();

  try {
    const res = await fetch(`/api/menu?id=${encodeURIComponent(id)}`);
    stopLoadingTimer();
    if (!res.ok) {
      showError('No encontramos ese análisis. Sube foto del menú para crearlo.');
      return;
    }
    const data = await res.json();
    currentAnalysisId = null; // ya está guardado, no necesita atribución nueva
    const banner = `<div class="saved-banner">
      <strong>${escapeHtml(data.name || 'Restaurante')}</strong>
      <span>· Análisis de la biblioteca Reboot</span>
    </div>`;
    resultContainer.innerHTML = banner + renderResult(data.analysis || {});
    showSection(resultSection);
  } catch {
    stopLoadingTimer();
    showError('No pudimos traer el análisis. Intenta de nuevo.');
  }
}

// --- Attribution (restaurant name / geolocation) ---
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
      const res = await fetch('/api/attribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    if (!navigator.geolocation) {
      setStatus('Tu navegador no soporta ubicación.', 'error');
      return;
    }
    setStatus('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        postAttribution({ lat: latitude, lng: longitude, accuracyM: accuracy });
      },
      (err) => {
        const msg = err.code === 1
          ? 'Permiso de ubicación denegado. Escribe el nombre del restaurante.'
          : err.code === 3
          ? 'La ubicación tardó demasiado. Escribe el nombre del restaurante.'
          : 'No pudimos obtener tu ubicación (¿estás indoor?). Escribe el nombre del restaurante.';
        setStatus(msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

  nameBtn?.addEventListener('click', () => {
    if (nameForm) {
      nameForm.hidden = false;
      nameInput?.focus();
    }
  });

  nameForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = nameInput?.value?.trim();
    if (!val) return;
    postAttribution({ restaurantName: val });
  });
}
