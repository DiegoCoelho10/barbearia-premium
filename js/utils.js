// ============================================
// utils.js
// Utilitários compartilhados
// ============================================

// ===== Datas e horários =====

/** Retorna a data de hoje no formato YYYY-MM-DD (timezone local) */
export function hojeISO() {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Converte uma data ISO (YYYY-MM-DD) em objeto Date local (sem deslocamento de timezone) */
export function dataLocal(iso) {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Formata YYYY-MM-DD => DD/MM/YYYY */
export function formatarData(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Retorna o nome do dia da semana em PT (0=dom...6=sab) */
export function diaSemanaNome(idx) {
  return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][idx];
}

/** Retorna a chave do dia da semana (dom, seg, ter, qua, qui, sex, sab) */
export function diaSemanaKey(idx) {
  return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][idx];
}

/** Converte "HH:MM" em minutos desde 00:00 */
export function horaParaMin(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60) + (m || 0);
}

/** Converte minutos desde 00:00 em "HH:MM" */
export function minParaHora(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Verifica se dois intervalos [a, b) sobrepoem-se */
export function intervalosColidem(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}

/** Mês/ano da data ISO (YYYY-MM) */
export function mesAnoISO(iso) {
  if (!iso) return '';
  return iso.substring(0, 7);
}

/** Retorna o mês atual no formato YYYY-MM */
export function mesAtual() {
  return hojeISO().substring(0, 7);
}

// ===== Formatação =====

export function formatarBRL(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarTelefone(tel) {
  if (!tel) return '';
  const limpo = String(tel).replace(/\D/g, '');
  if (limpo.length === 11) return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (limpo.length === 10) return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return tel;
}

export function limparTelefone(tel) {
  return String(tel || '').replace(/\D/g, '');
}

export function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// ===== Validações =====

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function telefoneValido(tel) {
  const limpo = limparTelefone(tel);
  return limpo.length >= 10 && limpo.length <= 11;
}

// ===== Toast / Notificações =====

let toastContainer;
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function toast(msg, tipo = 'info', duracao = 3500) {
  const container = getToastContainer();
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duracao);
}

export const toastSuccess = (msg) => toast(msg, 'success');
export const toastError   = (msg) => toast(msg, 'error', 5000);
export const toastWarning = (msg) => toast(msg, 'warning');

// ===== Loading =====

let loadingEl;
export function showLoading(texto = 'Carregando...') {
  if (loadingEl) return;
  loadingEl = document.createElement('div');
  loadingEl.className = 'loading-overlay';
  loadingEl.innerHTML = `
    <div class="spinner"></div>
    <p style="color: var(--dourado); font-weight: 500;">${escapeHtml(texto)}</p>
  `;
  document.body.appendChild(loadingEl);
}
export function hideLoading() {
  if (loadingEl) { loadingEl.remove(); loadingEl = null; }
}

// ===== Modal =====

export function modal({ titulo, html, onConfirm, onCancel, textoConfirm = 'Confirmar', textoCancel = 'Cancelar', perigo = false }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">${escapeHtml(titulo)}</div>
          <button class="modal-close" aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body">${html}</div>
        <div class="flex gap-1 mt-3" style="justify-content: flex-end;">
          <button class="btn btn-ghost" data-cancel>${escapeHtml(textoCancel)}</button>
          <button class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" data-confirm>${escapeHtml(textoConfirm)}</button>
        </div>
      </div>
    `;

    function fechar(valor) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 200);
      resolve(valor);
    }

    overlay.querySelector('.modal-close').addEventListener('click', () => { onCancel?.(); fechar(false); });
    overlay.querySelector('[data-cancel]').addEventListener('click', () => { onCancel?.(); fechar(false); });
    overlay.querySelector('[data-confirm]').addEventListener('click', () => {
      const result = onConfirm?.(overlay);
      // Se onConfirm retornar false, não fecha
      if (result === false) return;
      fechar(true);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { onCancel?.(); fechar(false); }
    });

    document.body.appendChild(overlay);
  });
}

export function confirmar(mensagem, textoConfirm = 'Sim', perigo = false) {
  return modal({
    titulo: 'Confirmação',
    html: `<p>${escapeHtml(mensagem)}</p>`,
    textoConfirm,
    textoCancel: 'Cancelar',
    perigo
  });
}

// ===== Segurança / HTML =====

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ===== Navegação =====

export function redirecionar(url) {
  window.location.href = url;
}

// ===== Debounce =====

export function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
