/* ============================================
   service-worker.js
   Cache offline básico
   - HTML: network-first (sempre tenta buscar atualização)
   - CSS/JS/imagens locais: cache-first
   - Firebase / Firestore: passa direto (sem cache)
   ============================================ */

const VERSAO = 'barbearia-v1.0.0';
const ASSETS_ESTATICOS = [
  './',
  './index.html',
  './login.html',
  './dashboard.html',
  './agendamento.html',
  './manifest.json',
  './css/styles.css',
  './js/firebase-config.js',
  './js/auth.js',
  './js/utils.js',
  './js/agendamento.js',
  './js/dashboard.js',
  './js/financeiro.js',
  './js/whatsapp.js',
  './js/pwa.js',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSAO).then((cache) => {
      // addAll falha se UM arquivo der erro; usamos add individual com tolerância
      return Promise.all(
        ASSETS_ESTATICOS.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Falha ao cachear', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas GET
  if (request.method !== 'GET') return;

  // Não interferir nas chamadas Firebase / Google
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    return; // browser segue normal
  }

  // HTML: network-first
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(VERSAO).then((c) => c.put(request, copy));
          return resp;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Estáticos: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        // Apenas cacheia respostas válidas e do mesmo domínio
        if (resp.ok && url.origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(VERSAO).then((c) => c.put(request, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
