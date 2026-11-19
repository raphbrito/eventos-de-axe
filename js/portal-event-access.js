/* Complemento do painel global: libera administradores para eventos específicos. */
(() => {
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

  async function mountEventAccess() {
    if (!location.hash.startsWith("#/admin") || !Session.get() || document.getElementById("eventAccessCard")) return;
    const layout = document.querySelector(".admin-layout");
    if (!layout) return;
    const card = document.createElement("article");
    card.className = "card";
    card.id = "eventAccessCard";
    card.innerHTML = `<p class="eyebrow">Acesso por evento</p><h2>Convide uma administradora</h2><p>Se a conta já existir, o acesso é liberado. Caso contrário, a pessoa recebe um convite de cadastro restrito ao evento escolhido.</p><form id="eventAccessForm" class="form"><label>Evento<select name="slug" id="eventAccessEvent" required><option value="">Carregando eventos…</option></select></label><label>E-mail da administradora<input name="email" type="email" autocomplete="email" required placeholder="mari@exemplo.com"></label><button class="button secondary" type="submit">Enviar convite / liberar acesso</button></form>`;
    layout.append(card);
    const select = card.querySelector("select");
    try {
      const result = await Api.request("events", "GET", {}, true);
      const events = result.data?.events || [];
      select.innerHTML = events.length
        ? `<option value="">Selecione um evento</option>${events.map(item => `<option value="${escapeHtml(item.slug)}">${escapeHtml(item.nome)} (${escapeHtml(item.slug)})</option>`).join("")}`
        : '<option value="">Nenhum evento cadastrado</option>';
      const mari = [...select.options].find(option => option.value === "40tou-da-mari");
      if (mari) mari.selected = true;
    } catch (error) {
      select.innerHTML = '<option value="">Não foi possível carregar os eventos</option>';
      showMessage(document.querySelector("#adminMessage"), error.message, true);
    }
    card.querySelector("form").addEventListener("submit", async submitEvent => {
      submitEvent.preventDefault();
      const message = document.querySelector("#adminMessage");
      const data = Object.fromEntries(new FormData(submitEvent.currentTarget));
      try {
        const result = await Api.request("create-registration-invite", "POST", { email: data.email, eventSlug: data.slug }, true);
        showMessage(message, result.message || "Convite enviado ou acesso liberado para este evento.");
        submitEvent.currentTarget.reset();
        if (mari) mari.selected = true;
      } catch (error) {
        showMessage(message, error.message || "Não foi possível liberar o acesso.", true);
      }
    });
  }

  window.addEventListener("hashchange", () => window.setTimeout(mountEventAccess, 0));
  document.addEventListener("DOMContentLoaded", () => window.setTimeout(mountEventAccess, 0));
})();
