(() => {
  const app = document.querySelector('#app');
  const navigation = document.querySelector('#navigation');
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const currentRoute = () => location.hash.startsWith('#/') ? (location.hash.slice(2).split('?')[0] || 'inicio') : 'inicio';
  const publicUrl = slug => new URL(`eventos/${encodeURIComponent(slug)}/`, document.baseURI).href;
  const dashboardUrl = slug => `${publicUrl(slug)}dashboard.html`;

  function renderNavigation() {
    const logged = Boolean(Session.get());
    navigation.innerHTML = currentRoute() === 'inicio'
      ? `<a href="#sobre">Sobre</a><a href="#recursos">Como funciona</a><a href="#eventos">Eventos</a><a class="nav-action" href="#/${logged ? 'admin' : 'entrar'}">${logged ? 'Área de gestão' : 'Entrar'}</a>`
      : `<a href="#/">Início</a>${logged ? `<a href="#/admin">Gestão</a><button type="button" data-action="logout">Sair</button>` : `<a class="nav-action" href="#/entrar">Entrar</a>`}`;
  }

  function homeView() {
    return `<section class="home-panel">
      <section class="home-hero"><div class="home-hero__content">
        <p class="home-kicker">Eventos de Axé · por Topázio Soluções Tecnológicas</p>
        <h1>Todo encontro merece <em>presença</em> antes de acontecer.</h1>
        <p class="home-lead">Uma plataforma para criar páginas de celebração, acolher confirmações e organizar os detalhes que sustentam cada encontro — com respeito à identidade de cada casa.</p>
        <div class="home-actions"><a class="button" href="#eventos">Conheça as celebrações</a><a class="button secondary" href="#sobre">Entenda o projeto</a></div>
        <p class="hero-footnote">Tecnologia feita para servir ao cuidado, à memória e à continuidade.</p>
      </div></section>
      <section id="sobre" class="home-section home-section--split">
        <div><h2>Organizar também é uma forma de acolher.</h2></div>
        <div class="home-copy"><p>Eventos de Axé nasceu da experiência concreta de preparar uma celebração religiosa. Entre mensagens, listas e informações espalhadas, ficou clara a necessidade de uma ferramenta simples, cuidadosa e feita para esse contexto.</p><p>Aqui, cada evento tem sua própria presença: uma página para contar o que importa, orientar quem chega e receber confirmações sem perder o caráter humano do encontro.</p></div>
      </section>
      <section id="recursos" class="feature-band"><div class="feature-band__heading"><h2>Menos dispersão. Mais espaço para o que realmente importa.</h2></div>
        <div class="feature-list"><article><h3>Convites com identidade</h3><p>Uma página pública que apresenta a celebração com linguagem, informações e visual próprios.</p></article><article><h3>RSVP organizado</h3><p>Confirmações de presença centralizadas para preparar a recepção com mais segurança.</p></article><article><h3>Gestão tranquila</h3><p>Uma área administrativa para acompanhar respostas, listas e dados essenciais do evento.</p></article></div>
      </section>
      <section id="eventos" class="home-section events-showcase" aria-labelledby="eventsTitle">
        <div class="events-showcase__heading"><div><p class="event-kicker">Celebrações hospedadas</p><h2 id="eventsTitle">Encontros que já têm lugar para acontecer.</h2></div><p>Conheça as páginas públicas criadas no Eventos de Axé. Esta vitrine é atualizada automaticamente a partir dos eventos ativos cadastrados na plataforma.</p></div>
        <div class="events-carousel" aria-label="Eventos hospedados">
          <div id="publicEventsTrack" class="events-carousel__track" aria-live="polite"><p class="events-carousel__message">Carregando celebrações...</p></div>
          <div class="events-carousel__controls"><button id="publicEventsPrevious" type="button" class="events-carousel__control" aria-label="Ver eventos anteriores">Anteriores</button><button id="publicEventsNext" type="button" class="events-carousel__control" aria-label="Ver próximos eventos">Próximos</button></div>
        </div>
        <p id="publicEventsStatus" class="events-showcase__status">A vitrine mostra os eventos públicos ativos.</p>
      </section>
      <section class="platform-statement"><h2>Cada celebração mantém sua personalidade. A organização permanece simples, segura e centralizada.</h2><p>O Eventos de Axé cresce junto com as comunidades que o utilizam, desenvolvendo recursos com escuta, clareza e respeito às tradições.</p></section>
      <footer class="home-footer"><p>Eventos de Axé · uma solução da Topázio Soluções Tecnológicas</p><p>Projeto independente, aberto e em constante evolução.</p></footer>
    </section>`;
  }

  function loginView() {
    return `<section class="panel"><div class="page-heading"><div><p class="eyebrow">Acesso administrativo</p><h1>Entre na área de gestão</h1><p>Use suas credenciais para administrar seus eventos e convites.</p></div></div><form id="loginForm" class="form" novalidate><label>E-mail<input name="email" type="email" autocomplete="email" required></label><label>Senha<input name="senha" type="password" autocomplete="current-password" required></label><button class="button" type="submit">Entrar</button><p id="formMessage" class="message" role="status"></p></form></section>`;
  }

  function adminView() {
    if (!Session.get()) { location.hash = '#/entrar'; return ''; }
    return `<section class="panel"><div class="page-heading"><div><p class="eyebrow">Administração</p><h1>Painel administrativo global</h1><p>Gerencie os eventos publicados e os acessos do sistema.</p></div><a class="button secondary" href="#/">Ver home</a></div><div id="adminMessage" class="message" role="status"></div><div class="admin-layout"><article class="card"><p class="eyebrow">Novo evento</p><h2>Crie uma nova celebração</h2><form id="eventForm" class="form"><label>Nome<input name="nome" required></label><label>Slug<input name="slug" required pattern="[a-z0-9-]+" placeholder="nome-do-evento"></label><label>ID da planilha RSVP<input name="planilhaRsvpId" required></label><label>Aba de respostas<input name="abaRsvp" required></label><button class="button" type="submit">Criar evento</button></form></article><article class="card"><p class="eyebrow">Acesso global</p><h2>Convide uma pessoa administradora</h2><p>O convite permite administrar todos os eventos cadastrados.</p><form id="inviteForm" class="form"><label>E-mail<input name="email" type="email" required></label><button class="button secondary" type="submit">Enviar convite</button></form></article></div><section class="admin-section"><p class="eyebrow">Eventos cadastrados</p><h2>Suas celebrações</h2><div id="eventsList" class="event-grid"><div class="empty-state">Carregando eventos...</div></div></section></section>`;
  }

  async function loadEvents() {
    const target = document.querySelector('#eventsList');
    if (!target) return;
    try {
      const result = await Api.request('events', 'GET', {}, true);
      const events = result.data?.events || result.events || [];
      target.innerHTML = events.length ? events.map(event => {
        const slug = escapeHtml(event.slug || event.id_evento || '');
        const name = escapeHtml(event.nome || slug);
        return `<article class="card event-card"><span class="event-slug">${slug}</span><h2>${name}</h2><div class="card-actions"><a class="button secondary" href="${publicUrl(slug)}" target="_blank" rel="noopener">Página pública</a><a class="button" href="${dashboardUrl(slug)}" target="_blank" rel="noopener">Dashboard</a></div></article>`;
      }).join('') : '<div class="empty-state">Nenhum evento cadastrado ainda.</div>';
    } catch (error) { target.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
  }

  function bindPublicEventsCarousel(events) {
    const track = document.querySelector('#publicEventsTrack');
    const previous = document.querySelector('#publicEventsPrevious');
    const next = document.querySelector('#publicEventsNext');
    if (!track || !previous || !next) return;

    const move = direction => {
      const card = track.querySelector('.events-carousel__card');
      const distance = card ? card.getBoundingClientRect().width + 20 : track.clientWidth;
      track.scrollBy({ left: distance * direction, behavior: 'smooth' });
    };
    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const canScroll = maxScroll > 4;
      previous.disabled = !canScroll || track.scrollLeft <= 4;
      next.disabled = !canScroll || track.scrollLeft >= maxScroll - 4;
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls, { passive: true });
    requestAnimationFrame(updateControls);
  }

  async function loadPublicEvents() {
    const track = document.querySelector('#publicEventsTrack');
    const status = document.querySelector('#publicEventsStatus');
    if (!track || !status) return;
    try {
      const result = await Api.request('public-events', 'GET');
      const events = result.data?.events || result.events || [];
      if (!events.length) {
        track.innerHTML = '<p class="events-carousel__message">Ainda não há celebrações públicas para mostrar.</p>';
        status.textContent = 'Quando um evento for ativado, ele aparecerá aqui automaticamente.';
        return;
      }
      track.innerHTML = events.map(event => {
        const slug = escapeHtml(event.slug || '');
        const name = escapeHtml(event.nome || event.slug || 'Celebração');
        return `<article class="events-carousel__card"><p class="events-carousel__eyebrow">Evento hospedado</p><h3>${name}</h3><p>Informações, confirmação de presença e orientações reunidas em uma página feita para este encontro.</p><a class="button" href="${publicUrl(slug)}">Ver convite</a></article>`;
      }).join('');
      status.textContent = `${events.length} ${events.length === 1 ? 'celebração disponível' : 'celebrações disponíveis'} nesta vitrine.`;
      bindPublicEventsCarousel(events);
    } catch (error) {
      track.innerHTML = '<p class="events-carousel__message">Não foi possível carregar as celebrações neste momento.</p>';
      status.textContent = 'Tente atualizar a página em alguns instantes.';
    }
  }

  function bindLogin() {
    document.querySelector('#loginForm')?.addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; const message = document.querySelector('#formMessage');
      try { const result = await Api.request('login', 'POST', Object.fromEntries(new FormData(form))); const token = result.data?.token || result.token; if (!token) throw new Error('A API não retornou uma sessão válida.'); Session.save(token); location.hash = '#/admin'; } catch (error) { showMessage(message, error.message, true); }
    });
  }

  function bindAdmin() {
    loadEvents();
    document.querySelector('#eventForm')?.addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; const message = document.querySelector('#adminMessage');
      try { const result = await Api.request('create-event', 'POST', Object.fromEntries(new FormData(form)), true); showMessage(message, result.message || 'Evento criado com sucesso.'); form.reset(); loadEvents(); } catch (error) { showMessage(message, error.message, true); }
    });
    document.querySelector('#inviteForm')?.addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; const message = document.querySelector('#adminMessage');
      try { const result = await Api.request('invite-global-admin', 'POST', Object.fromEntries(new FormData(form)), true); showMessage(message, result.message || 'Convite enviado.'); form.reset(); } catch (error) { showMessage(message, error.message, true); }
    });
  }

  function bindNavigation() { navigation.querySelector('[data-action="logout"]')?.addEventListener('click', () => { Session.clear(); location.hash = '#/'; }); }
  function render() { const activeRoute = currentRoute(); renderNavigation(); app.innerHTML = activeRoute === 'entrar' ? loginView() : activeRoute === 'admin' ? adminView() : homeView(); bindNavigation(); if (activeRoute === 'entrar') bindLogin(); if (activeRoute === 'admin') bindAdmin(); if (activeRoute === 'inicio') loadPublicEvents(); }
  window.addEventListener('hashchange', () => { if (location.hash.startsWith('#/')) render(); });
  render();
})();
