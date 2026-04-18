import { renderResult, renderAttribution, compressImage } from '/clientUtils.js';

let currentAnalysisId = null;

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

function trackEvent(name, data = {}) {
  // Vercel Analytics captures page views by default; custom events go here later.
  if (window.fbq) window.fbq('trackCustom', name, data);
  console.log('[event]', name, data);
}

async function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showError('Eso no parece una imagen. Prueba con una foto del menú.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('La imagen pesa más de 10MB. Tómale otra foto más pequeña.');
    return;
  }

  showSection(loadingSection);
  const loadingInterval = cycleLoadingMessages();
  trackEvent('analysis_started');

  try {
    const { base64, mediaType } = await compressImage(file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mediaType }),
    });

    clearInterval(loadingInterval);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody.message || 'Algo falló del lado nuestro. Intenta de nuevo en un minuto.';
      showError(msg);
      return;
    }

    const data = await response.json();
    currentAnalysisId = data.analysisId || null;
    const resultHtml = renderResult(data);
    const attributionHtml = currentAnalysisId && !data.error ? renderAttribution() : '';
    resultContainer.innerHTML = resultHtml + attributionHtml;
    if (currentAnalysisId && !data.error) wireAttribution();
    showSection(resultSection);
    trackEvent('analysis_completed', { total: data.summary?.total ?? 0 });
  } catch (err) {
    clearInterval(loadingInterval);
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
    setStatus('Pidiendo permiso de ubicación…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        postAttribution({ lat: latitude, lng: longitude, accuracyM: accuracy });
      },
      () => setStatus('No pudimos obtener tu ubicación.', 'error'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
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
