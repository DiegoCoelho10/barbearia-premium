// ============================================
// pwa.js
// Registro do Service Worker + botão "Instalar"
// ============================================

let deferredPrompt = null;

/** Registra o Service Worker (chama isso o quanto antes em todas as páginas) */
export function registrarSW() {
  if (!('serviceWorker' in navigator)) return;
  // Resolve o caminho do SW de forma robusta (funciona em qualquer subpasta de hosting)
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Falha ao registrar SW:', err);
      });
  });
}

/**
 * Habilita o botão "Instalar app".
 * @param {HTMLElement|string} btnOuId - elemento ou id do botão
 */
export function habilitarBotaoInstalar(btnOuId) {
  const btn = typeof btnOuId === 'string' ? document.getElementById(btnOuId) : btnOuId;
  if (!btn) return;

  // Já está instalado como PWA?
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    btn.classList.add('hidden');
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.classList.add('show');
    btn.classList.remove('hidden');
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      btn.classList.remove('show');
      btn.classList.add('hidden');
    }
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    btn.classList.remove('show');
    btn.classList.add('hidden');
    deferredPrompt = null;
  });
}

/** Detecta se está rodando como PWA instalado */
export function estaInstalado() {
  return window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone;
}
