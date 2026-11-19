(() => {
  const event = window.EVENTO_40TOU;
  const $ = id => document.getElementById(id);
  const toast = $("toast");
  let toastTimer;

  const setText = (id, value) => { const node = $(id); if (node) node.textContent = value || "A confirmar"; };
  const notify = message => { toast.textContent = message; toast.classList.add("is-visible"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3800); };
  const setCounter = (days, hours, minutes, seconds) => {
    $("days").textContent = days; $("hours").textContent = hours; $("minutes").textContent = minutes; $("seconds").textContent = seconds;
  };
  const two = value => String(value).padStart(2, "0");

  function fillEventData() {
    document.title = `${event.nome} — ${event.tema}`;
    setText("eventDate", event.evento.dataExibicao);
    setText("eventTime", event.evento.horarioExibicao);
    setText("eventVenue", event.evento.local);
    setText("eventAddress", event.evento.endereco);
    setText("outfit-title", event.traje.titulo);
    setText("outfitText", event.traje.descricao);
    setText("rsvpText", event.rsvp.texto);
    $("rsvpLink").href = event.rsvp.url || "#rsvp-title";
  }

  function startCountdown() {
    const machine = $("arcadeMachine");
    const target = event.evento.inicio ? new Date(event.evento.inicio) : null;
    if (!target || Number.isNaN(target.getTime())) return;
    machine.dataset.state = "active";
    setText("countdownMessage", "LEVEL 40 UNLOCKING");
    setText("countdownSubtitle", "A contagem começou. Prepare-se para a festa!");
    const tick = () => {
      const remaining = Math.max(0, target.getTime() - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      setCounter(String(Math.floor(totalSeconds / 86400)).padStart(2, "0"), two(Math.floor(totalSeconds % 86400 / 3600)), two(Math.floor(totalSeconds % 3600 / 60)), two(totalSeconds % 60));
      if (remaining <= 0) { setText("countdownMessage", "LEVEL 40 LIBERADO!"); setText("countdownSubtitle", "A festa começou. Vem celebrar!"); return; }
      window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
  }

  function initialiseArcade() {
    const machine = $("arcadeMachine");
    const activate = () => { machine.classList.add("is-powered"); startCountdown(); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { activate(); return; }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      activate(); observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(machine);
  }

  function openRoute(url) {
    if (!url) { notify("A rota será liberada assim que o local da festa for confirmado."); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillEventData();
    initialiseArcade();
    $("rsvpLink").addEventListener("click", clickEvent => {
      if (event.rsvp.url) return;
      clickEvent.preventDefault();
      notify("O formulário oficial de confirmação será liberado em breve.");
    });
    $("mapsButton").addEventListener("click", () => openRoute(event.localizacao.googleMaps));
    $("wazeButton").addEventListener("click", () => openRoute(event.localizacao.waze));
  });
})();
