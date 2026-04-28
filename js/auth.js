// ============================================
// auth.js
// Autenticação (Firebase Auth + Firestore)
// ============================================

import {
  auth, db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  doc, setDoc, getDoc, serverTimestamp
} from './firebase-config.js';
import { toastError, toastSuccess, emailValido, limparTelefone, telefoneValido } from './utils.js';

// Cache do perfil do usuário atual
let perfilAtual = null;

/**
 * Cadastra um novo usuário (cliente OU admin)
 * @param {object} dados - { nome, email, senha, telefone, role }
 * @returns {Promise<object>} { user, perfil }
 */
export async function cadastrar({ nome, email, senha, telefone, role = 'cliente' }) {
  if (!nome || nome.trim().length < 2) throw new Error('Informe seu nome completo.');
  if (!emailValido(email)) throw new Error('E-mail inválido.');
  if (!senha || senha.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');
  if (role === 'cliente' && !telefoneValido(telefone)) {
    throw new Error('Telefone inválido. Use DDD + número.');
  }

  const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
  const user = cred.user;

  // Atualiza displayName
  try { await updateProfile(user, { displayName: nome.trim() }); } catch (_) {}

  // Cria documento na coleção 'usuarios'
  const perfil = {
    uid: user.uid,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: limparTelefone(telefone),
    role,
    criadoEm: serverTimestamp()
  };

  await setDoc(doc(db, 'usuarios', user.uid), perfil);
  perfilAtual = perfil;

  return { user, perfil };
}

/**
 * Login com email e senha. Carrega o perfil do Firestore.
 */
export async function login(email, senha) {
  if (!emailValido(email)) throw new Error('E-mail inválido.');
  if (!senha) throw new Error('Informe sua senha.');

  const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);
  const perfil = await carregarPerfil(cred.user.uid);
  perfilAtual = perfil;
  return { user: cred.user, perfil };
}

/** Logout */
export async function logout() {
  perfilAtual = null;
  await signOut(auth);
}

/** Carrega o perfil de um usuário a partir do Firestore */
export async function carregarPerfil(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

/**
 * Helper de proteção de rota.
 * @param {object} opts
 * @param {string} opts.redirectIfNoUser - URL para redirecionar se não logado
 * @param {string} [opts.requireRole] - 'admin' | 'cliente' (se especificado, redireciona se role diferente)
 * @param {string} [opts.redirectWrongRole] - URL de fallback caso role não bata
 * @returns {Promise<object>} perfil do usuário
 */
export function proteger({ redirectIfNoUser, requireRole, redirectWrongRole = '/' }) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (redirectIfNoUser) window.location.href = redirectIfNoUser;
        resolve(null);
        return;
      }
      try {
        const perfil = await carregarPerfil(user.uid);
        if (!perfil) {
          // Usuário autenticado mas sem doc no Firestore (caso anômalo)
          await signOut(auth);
          if (redirectIfNoUser) window.location.href = redirectIfNoUser;
          resolve(null);
          return;
        }
        if (requireRole && perfil.role !== requireRole) {
          window.location.href = redirectWrongRole;
          resolve(null);
          return;
        }
        perfilAtual = perfil;
        resolve(perfil);
      } catch (err) {
        console.error('[auth] Erro ao carregar perfil:', err);
        toastError('Erro ao carregar perfil.');
        resolve(null);
      }
    });
  });
}

/** Retorna o perfil em cache (precisa ter chamado proteger() ou login() antes) */
export function getPerfilAtual() {
  return perfilAtual;
}

/** Mensagens amigáveis de erro do Firebase */
export function mensagemErroAuth(err) {
  const code = err?.code || '';
  const map = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-disabled': 'Usuário desativado.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.'
  };
  return map[code] || err?.message || 'Erro desconhecido.';
}
