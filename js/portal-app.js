const app = document.querySelector('#app');
const navigation = document.querySelector('#navigation');
let account = null;
const ACCOUNT_CACHE_KEY = 'eventos-de-axe.account-cache';
const ACCOUNT_CACHE_TTL_MS = 45 * 1000;

const route = () => location.hash.slice(1) || '/';
const go = target => { location.hash = target; };
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const eventUrl = slug => `eventos/${encodeURIComponent(slug)}/`;

function nav() {
  if (!Session.get()) {
    navigation.innerHTML = '<a href="#/login">Entrar</a>';
    return;
  }
  const adminLink = account?.isGlobalAdmin ? '<a href="#/admin">Painel global</a>' : '';
  navigation.innerHTML = `${adminLink}<a href="#/eventos">Meus eventos</a><a href="#/perfil">Meu perfil</a><button id="logout" type="button">Sair</button>`;
  document.querySelector('#logout')?.addEventListener('click', () => { account = null; Session.clear(); go('/'); });
}

function shell(content, modifier = '') {
  app.innerHTML = `<section class="panel ${modifier}">${content}</section>`;
  nav();
}

function showMessage(text, error = false) {
  const message = document.querySelector('#message');
  if (!message) return;
  message.textContent = text;
  message.className = `message${error ? ' error' : ''}`;
}

function readCachedAccount() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(ACCOUNT_CACHE_KEY) || 'null');
    if (!cached || cached.token !== Session.get() || Date.now() - cached.savedAt > ACCOUNT_CACHE_TTL_MS) return null;
    return cached.data;
  } catch (_) { return null; }
}

function cacheAccount(data) {
  sessionStorage.setItem(ACCOUNT_CACHE_KEY, JSON.stringify({ token: Session.get(), savedAt: Date.now(), data }));
}

async function requestMyEvents(force = false) {
  if (!force && account) return { success: true, data: account };
  const cached = !force && readCachedAccount();
  if (cached) {
    account = cached;
    return { success: true, data: account };
  }
  const result = await Api.request('my-events', 'GET', {}, true);
  account = result.data;
  cacheAccount(account);
  return result;
}

function home() {
  shell(`<section class="system-hero">
      <p class="system-kicker">Um projeto criado dentro do Axé</p>
      <h1>Celebrar também é cuidar de cada detalhe.</h1>
      <p class="system-lead">Uma plataforma aberta para transformar convites, informações e confirmações de presença em experiências mais acolhedoras, organizadas e respeitosas.</p>
      <p class="system-hero-note"><span aria-hidden="true">✦</span> Tecnologia a serviço das celebrações e das comunidades de matriz africana.</p>
    </section>
    <section class="editorial-section story-layout">
      <div><p class="system-overline">Como tudo começou</p><h2>Uma necessidade real se tornou caminho.</h2></div>
      <div class="story-copy"><p>O Eventos de Axé nasceu durante a preparação do próprio Odún Ìjẹ de Rafael Brito. Ao criar um convite digital para um momento tão importante, surgiu a vontade de transformar aquela solução em algo que pudesse acompanhar outras casas, dirigentes e celebrações.</p><p>Na organização de eventos religiosos, confirmações de presença, informações importantes e orientações aos convidados muitas vezes ficam dispersas entre mensagens e planilhas. A plataforma surgiu para reunir esse cuidado em um só lugar, sem perder a identidade de cada encontro.</p><p>Aos poucos, aquilo que seria apenas um convite passou a se transformar em uma base para eventos que desejam acolher melhor, organizar com mais calma e comunicar com clareza.</p></div>
    </section>
    <section class="principles">
      <div class="principles-heading"><p class="system-overline">O que é o Eventos de Axé</p><h2>Uma estrutura simples para experiências singulares.</h2><p>Cada evento mantém sua própria voz e aparência; por trás dela, uma gestão centralizada para informações, localização, RSVP e convidados.</p></div>
      <div class="principles-grid">
        <article class="principle"><span>01</span><h3>Identidade de cada casa</h3><p>Páginas feitas para refletir a celebração, os símbolos e a forma de receber de cada comunidade.</p></article>
        <article class="principle"><span>02</span><h3>Organização com leveza</h3><p>Informações, confirmação de presença e acompanhamento reunidos sem tornar o processo complexo.</p></article>
        <article class="principle"><span>03</span><h3>Um projeto aberto</h3><p>Gratuito, em evolução constante e construído para crescer junto com as necessidades de quem o utiliza.</p></article>
      </div>
    </section>
    <section class="system-statement">
      <p class="system-overline">Uma base para muitos encontros</p><h2>Cada celebração mantém sua personalidade. A organização encontra um mesmo lugar.</h2>
      <p>O Eventos de Axé cresce junto com os eventos que hospeda, buscando tornar a preparação mais clara e a experiência de cada convidado mais cuidadosa.</p>
    </section>
    <section class="developer">
      <div class="developer-copy"><p class="system-overline">Quem desenvolve</p><h2>Idealizado por Rafael Brito.</h2><p>Apaixonado por tecnologia, organização de processos e pelas religiões de matriz africana, Rafael uniu essas experiências para criar uma ferramenta simples, moderna e respeitosa para eventos religiosos.</p></div>
      <div class="developer-links"><a href="https://instagram.com/raphbrito" target="_blank" rel="noopener">Instagram</a><a href="https://github.com/raphbrito" target="_blank" rel="noopener">GitHub</a><a href="https://github.com/raphbrito/Eventos-de-Axe" target="_blank" rel="noopener">Repositório</a></div>
    </section>
    <footer class="system-footer"><p>© ${new Date().getFullYear()} Eventos de Axé</p><p>·</p><p>Uma plataforma para convites, RSVP e celebrações.</p></footer>`, 'home-panel');
}

function login() {
  shell('<h1>Entrar</h1><form id="login-form" class="form"><label>E-mail<input name="email" type="email" required></label><label>Senha<input name="senha" type="password" required></label><button class="button">Entrar</button><a class="text-link" href="?view=forgot">Esqueci minha senha</a></form><p class="message" id="message"></p>');
  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const result = await Api.request('login', 'POST', Object.fromEntries(new FormData(event.target)));
      Session.save(result.data.token);
      const mine = await requestMyEvents();
      go(mine.data.isGlobalAdmin ? '/admin' : mine.data.events.length === 1 ? `/evento/${mine.data.events[0].slug}` : '/eventos');
    } catch (error) { showMessage(error.message, true); }
  });
}

async function events() {
  try {
    const result = await requestMyEvents();
    shell(`<div class="page-heading"><div><p class="eyebrow">Área administrativa</p><h1>Meus eventos</h1><p class="muted">Olá, ${escapeHtml(result.data.user.name)}.</p></div></div><div class="event-grid">${result.data.events.map(event => `<article class="card event-card"><h2>${escapeHtml(event.nome)}</h2><div class="card-actions"><a class="button" href="#/evento/${encodeURIComponent(event.slug)}">Abrir dashboard</a>${result.data.isGlobalAdmin ? `<a class="button secondary" href="${eventUrl(event.slug)}" target="_blank" rel="noopener">Página pública</a>` : ''}</div></article>`).join('') || '<p>Nenhum evento disponível para esta conta.</p>'}</div>`);
  } catch (_) { go('/login'); }
}

function eventCard(event) {
  return `<article class="card event-card"><p class="eyebrow">${escapeHtml(event.slug)}</p><h2>${escapeHtml(event.nome)}</h2><div class="card-actions"><a class="button" href="#/evento/${encodeURIComponent(event.slug)}" target="_blank" rel="noopener">Dashboard</a><a class="button secondary" href="${eventUrl(event.slug)}" target="_blank" rel="noopener">Página pública</a></div></article>`;
}

function userRow(user) {
  const name = `${user.name || ''} ${user.lastName || ''}`.trim() || 'Sem nome';
  return `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.status || '')}</td><td><button class="button danger delete-user" type="button" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(name)}">Excluir</button></td></tr>`;
}

async function admin(forceAccountRefresh = false) {
  try {
    const mine = await requestMyEvents(forceAccountRefresh);
    if (!mine.data.isGlobalAdmin) return go('/eventos');
    const [all, users] = await Promise.all([Api.request('events', 'GET', {}, true), Api.request('admin-users', 'GET', {}, true)]);
    shell(`<div class="page-heading"><div><p class="eyebrow">Administração</p><h1>Painel administrativo global</h1><p class="muted">Gerencie eventos, acessos e administradores do sistema.</p></div></div>
      <div class="admin-layout"><section class="card"><h2>Novo evento</h2><form id="event-form" class="form compact-form"><label>Nome<input name="nome" required></label><label>Slug<input name="slug" pattern="[a-z0-9-]+" required></label><label>ID da planilha RSVP<input name="planilhaRsvpId" required></label><label>Aba de respostas<input name="abaRsvp" required></label><label>E-mail da responsável<input name="emailResponsavel" type="email" required></label><button class="button">Criar evento</button></form></section>
      <section class="card"><h2>Convidar administrador global</h2><p class="muted">O convite permite criar uma conta com acesso a todos os eventos.</p><form id="global-invite" class="form compact-form"><label>E-mail<input name="email" type="email" required></label><button class="button secondary">Enviar convite</button></form></section></div>
      <p id="message" class="message"></p>
      <section class="admin-section"><div class="section-title-row"><h2>Eventos cadastrados</h2><span>${all.data.events.length}</span></div><div class="event-grid">${all.data.events.map(eventCard).join('') || '<p>Nenhum evento cadastrado.</p>'}</div></section>
      <section class="admin-section"><div class="section-title-row"><h2>Usuários cadastrados</h2><span>${users.data.users.length}</span></div><div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Status</th><th>Ação</th></tr></thead><tbody>${users.data.users.map(userRow).join('') || '<tr><td colspan="4">Nenhum usuário cadastrado.</td></tr>'}</tbody></table></div></section>`);
    document.querySelector('#global-invite').addEventListener('submit', async event => {
      event.preventDefault();
      try { const result = await Api.request('invite-global-admin', 'POST', Object.fromEntries(new FormData(event.target)), true); showMessage(result.message); event.target.reset(); } catch (error) { showMessage(error.message, true); }
    });
    document.querySelector('#event-form').addEventListener('submit', async event => {
      event.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(event.target));
        await Api.request('create-event', 'POST', data, true);
        const invite = await Api.request('create-registration-invite', 'POST', { email: data.emailResponsavel, eventSlug: data.slug }, true);
        showMessage(invite.message);
        sessionStorage.removeItem(ACCOUNT_CACHE_KEY);
        await admin(true);
      } catch (error) { showMessage(error.message, true); }
    });
    document.querySelectorAll('.delete-user').forEach(button => button.addEventListener('click', async () => {
      if (!confirm(`Excluir o acesso de ${button.dataset.userName}? Esta ação não pode ser desfeita.`)) return;
      try { const result = await Api.request('admin-delete-user', 'POST', { userId: button.dataset.userId }, true); showMessage(result.message); await admin(); } catch (error) { showMessage(error.message, true); }
    }));
  } catch (_) { go('/login'); }
}

async function profile() {
  try {
    const result = await Api.request('profile', 'GET', {}, true);
    const user = result.data.user;
    shell(`<div class="page-heading"><div><p class="eyebrow">Conta</p><h1>Meu perfil</h1><p class="muted">Atualize seus dados e credenciais de acesso.</p></div></div><div class="profile-grid">
      <section class="card"><h2>Dados pessoais</h2><form id="profile-form" class="form compact-form"><label>Nome<input name="nome" value="${escapeHtml(user.name)}" required></label><label>Sobrenome<input name="sobrenome" value="${escapeHtml(user.lastName)}" required></label><button class="button">Salvar dados</button></form></section>
      <section class="card"><h2>Alterar e-mail</h2><form id="email-form" class="form compact-form"><label>Novo e-mail<input name="email" type="email" value="${escapeHtml(user.email)}" required></label><label>Senha atual<input name="senha" type="password" required></label><button class="button secondary">Solicitar alteração</button></form></section>
      <section class="card"><h2>Alterar senha</h2><form id="password-form" class="form compact-form"><label>Senha atual<input name="senhaAtual" type="password" required></label><label>Nova senha<input name="novaSenha" type="password" required></label><label>Confirmar nova senha<input name="confirmarSenha" type="password" required></label><button class="button secondary">Atualizar senha</button></form></section></div><p id="message" class="message"></p>`);
    const submit = (id, routeName, method = 'POST') => document.querySelector(id).addEventListener('submit', async event => {
      event.preventDefault();
      try { const response = await Api.request(routeName, method, Object.fromEntries(new FormData(event.target)), true); showMessage(response.message); if (routeName === 'profile') await profile(); else event.target.reset(); } catch (error) { showMessage(error.message, true); }
    });
    submit('#profile-form', 'profile', 'PATCH');
    submit('#email-form', 'change-email');
    submit('#password-form', 'change-password');
  } catch (_) { go('/login'); }
}

async function eventDashboard(slug) {
  try {
    const mine = await requestMyEvents();
    if (!mine.data.events.some(event => event.slug === slug)) return go('/eventos');
    const event = mine.data.events.find(item => item.slug === slug);
    shell(`<div class="page-heading dashboard-heading"><div><p class="eyebrow">Dashboard do evento</p><h1>${escapeHtml(event.nome)}</h1></div><a class="button secondary" href="${eventUrl(slug)}" target="_blank" rel="noopener">Abrir página pública</a></div><div class="frame-loading" id="frame-loading"><span></span>Carregando o dashboard…</div><iframe class="event-frame" title="Dashboard de ${escapeHtml(event.nome)}" src="${eventUrl(slug)}dashboard.html"></iframe>`, 'dashboard-panel');
    document.querySelector('.event-frame')?.addEventListener('load', () => document.querySelector('#frame-loading')?.remove(), { once: true });
  } catch (_) { go('/login'); }
}

function authView(view) {
  const token = new URLSearchParams(location.search).get('token') || '';
  if (view === 'forgot') {
    shell('<h1>Recuperar senha</h1><form id="forgot" class="form"><label>E-mail<input name="email" type="email" required></label><button class="button">Enviar instruções</button></form><p id="message" class="message"></p>');
    document.querySelector('#forgot').addEventListener('submit', async event => { event.preventDefault(); try { showMessage((await Api.request('forgot-password', 'POST', Object.fromEntries(new FormData(event.target)))).message); } catch (error) { showMessage(error.message, true); } });
    return;
  }
  if ((view === 'verify' || view === 'confirm-email') && token) {
    shell('<h1>Confirmação</h1><p id="message" class="message">Processando confirmação...</p>');
    Api.request(view === 'verify' ? 'verify-email' : 'confirm-email', view === 'verify' ? 'GET' : 'POST', { token }).then(result => showMessage(result.message)).catch(error => showMessage(error.message, true));
    return;
  }
  if (!token) return go('/login');
  const invite = view === 'invite';
  shell(`<h1>${invite ? 'Criar acesso' : 'Redefinir senha'}</h1><form id="token-form" class="form">${invite ? '<label>Nome<input name="nome" required></label><label>Sobrenome<input name="sobrenome" required></label>' : ''}<label>Senha<input name="${invite ? 'senha' : 'novaSenha'}" type="password" required></label><label>Confirmar senha<input name="confirmarSenha" type="password" required></label><button class="button">Salvar</button></form><p id="message" class="message"></p>`);
  document.querySelector('#token-form').addEventListener('submit', async event => { event.preventDefault(); try { const response = await Api.request(invite ? 'accept-registration-invite' : 'reset-password', 'POST', { ...Object.fromEntries(new FormData(event.target)), token }); showMessage(response.message); setTimeout(() => { history.replaceState({}, '', location.pathname); go('/login'); }, 1500); } catch (error) { showMessage(error.message, true); } });
}

function render() {
  const view = new URLSearchParams(location.search).get('view');
  if (view) return authView(view);
  const current = route();
  if (current === '/') return home();
  if (current === '/login') return login();
  if (current === '/admin') return admin();
  if (current === '/eventos') return events();
  if (current === '/perfil') return profile();
  if (current.startsWith('/evento/')) return eventDashboard(decodeURIComponent(current.slice(8)));
  return home();
}

window.addEventListener('hashchange', render);
render();
