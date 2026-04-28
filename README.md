💈 Barbearia Premium — Sistema completo de gestão
PWA profissional de agendamento e gestão para barbearia, construído em HTML + CSS + JavaScript puro (sem frameworks) com Firebase como backend.
---
✨ Recursos
🔐 Autenticação — login/cadastro de cliente e admin (Firebase Auth)
📅 Agendamento inteligente — slots gerados dinamicamente conforme horário de funcionamento, duração do serviço, agendamentos existentes e bloqueios
⚡ Encaixes — admin pode forçar horários ignorando a validação automática
✂️ Gestão de serviços — CRUD com duração, preço, ativo/inativo
💰 Financeiro — receitas automáticas dos atendimentos + despesas fixas e variáveis, com cálculo de lucro mensal
🚫 Bloqueios — folgas, feriados, intervalos
📲 WhatsApp — link `wa.me` automático + estrutura para Z-API/Twilio
📱 PWA instalável — manifest, service worker, offline básico, ícones, atalhos
🎨 UI luxo — tema preto + dourado, mobile-first, animações suaves
---
📁 Estrutura
```
barbearia/
├── index.html              # Splash + redirect automático
├── login.html              # Login + cadastro (toggle)
├── dashboard.html          # Painel admin (4 abas)
├── agendamento.html        # Tela do cliente
├── manifest.json           # PWA
├── service-worker.js       # Cache offline
├── firestore.rules         # Regras de segurança Firestore
├── css/
│   └── styles.css
├── js/
│   ├── firebase-config.js  # ⚠️ EDITE com seus dados
│   ├── auth.js
│   ├── utils.js
│   ├── agendamento.js      # Lógica de agenda + slots
│   ├── financeiro.js
│   ├── whatsapp.js         # wa.me + estrutura para API
│   ├── pwa.js
│   └── dashboard.js
└── assets/
    ├── icon-192.png
    └── icon-512.png
```
---
🚀 Setup (passo a passo)
1. Criar projeto no Firebase
Acesse https://console.firebase.google.com/
Adicionar projeto → escolha um nome (ex: `barbearia-premium`)
Pode desativar Google Analytics (opcional)
2. Habilitar Authentication
No menu lateral: Build → Authentication → Get started
Aba Sign-in method → habilite Email/Password
3. Habilitar Firestore
No menu lateral: Build → Firestore Database → Create database
Escolha modo produção
Selecione a região mais próxima (ex: `southamerica-east1`)
4. Aplicar as regras de segurança
Firestore → aba Rules
Cole o conteúdo do arquivo `firestore.rules`
Clique em Publish
5. Pegar suas credenciais
Configurações do projeto (engrenagem) → Project settings
Em Your apps, clique no ícone `</>` para adicionar um app web
Dê um nome (ex: "Web") e registre
Copie o objeto `firebaseConfig`
6. Configurar o app
Abra `js/firebase-config.js` e substitua o objeto:
```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "barbearia-premium.firebaseapp.com",
  projectId: "barbearia-premium",
  storageBucket: "barbearia-premium.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};
```
7. Criar o primeiro admin
Como o cadastro público sempre cria `role: 'cliente'`, o admin precisa ser promovido manualmente:
Opção A — pelo Console (recomendado):
Cadastre uma conta normal pelo `login.html` (ou direto no Authentication do Firebase)
Vá em Firestore → coleção `usuarios` → seu documento
Edite o campo `role` de `cliente` para `admin`
Opção B — via Authentication:
Authentication → Add user → e-mail e senha
Copie o UID
Firestore → adicione manualmente o doc `usuarios/{UID}` com:
```json
   { "uid": "...", "nome": "Admin", "email": "...", "telefone": "", "role": "admin" }
   ```
---
🌐 Deploy
Opção 1 — Firebase Hosting (recomendado)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# escolha o projeto, public dir = ".", single-page app = NO, configurar GitHub = NO
firebase deploy
```
Opção 2 — Vercel / Netlify
Faça upload da pasta inteira como site estático. Funciona sem build.
Opção 3 — Servidor local (testes)
```bash
# Python 3
python3 -m http.server 8080

# ou Node
npx serve .
```
Acesse http://localhost:8080
> ⚠️ Importante: **PWA exige HTTPS em produção** (localhost funciona em HTTP).
---
📲 Integração WhatsApp avançada
Por padrão o sistema usa `wa.me` (abre o WhatsApp do dispositivo). Para automatizar (envio sem clique), edite `js/whatsapp.js` e configure a API:
```js
import { configurarAPI } from './js/whatsapp.js';

// Z-API
configurarAPI({
  provider: 'zapi',
  baseUrl: 'https://api.z-api.io/instances/SEU_ID/token/SEU_TOKEN',
  token: 'SEU_CLIENT_TOKEN'
});

// Twilio (passe sempre por um backend!)
configurarAPI({
  provider: 'twilio',
  endpoint: 'https://seu-backend.com/whatsapp/send'
});
```
Os ganchos `notificarConfirmacao()`, `notificarLembrete()`, `notificarCancelamento()` já estão prontos no módulo.
---
🧱 Coleções Firestore
Coleção	Documentos
`usuarios`	`{ uid, nome, email, telefone, role: 'admin'
`servicos`	`{ nome, duracao, preco, ativo }`
`agendamentos`	`{ clienteUid, clienteNome, clienteTelefone, servicoId, servicoNome, duracao, preco, data, hora, status, encaixe }`
`configuracoes/horarios`	`{ dom, seg, ter, qua, qui, sex, sab: { ativo, abre, fecha } }`
`bloqueios`	`{ data, dia_completo, hora_inicio, hora_fim, motivo }`
`financeiro`	`{ tipo: 'receita'
---
🐛 Troubleshooting
"Missing or insufficient permissions" → as regras do Firestore não foram aplicadas. Veja seção 4.
"FirebaseError: API key not valid" → você não substituiu o `firebaseConfig` em `js/firebase-config.js`.
Service Worker não carrega → o SW só funciona em HTTP/HTTPS (não em `file://`). Use um servidor local.
Login em loop → o usuário existe no Auth mas não tem documento na coleção `usuarios`. Crie manualmente ou apague do Auth.
---
🎯 Roadmap (próximos passos)
Múltiplos barbeiros
Comissões por barbeiro
Relatórios em PDF
Lembretes automáticos via cron + Cloud Functions
Programa de fidelidade
Avaliação pós-atendimento
---
Feito com ☕ por Diego — Barbearia Premium 💈
