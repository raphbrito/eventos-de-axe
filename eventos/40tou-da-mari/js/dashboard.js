(() => {
  const event = window.EVENTO_40TOU;
  const loginScreen = document.getElementById("login");
  const dashboard = document.getElementById("dashboard");
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const toast = document.getElementById("toast");
  let timer;

  const notify = message => { toast.textContent = message; toast.classList.add("is-visible"); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove("is-visible"), 4200); };
  const status = document.getElementById("loginStatus");
  const submitButton = form.querySelector('button[type="submit"]');
  let submitting = false;
  const callApi = async (route, payload) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(window.EVENTOS_DE_AXE_API_URL + "?route=" + encodeURIComponent(route), {
        method: "POST", mode: "cors", credentials: "omit", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, route }), signal: controller.signal
      });
      if (!response.ok) throw new Error("O serviço do painel respondeu com erro HTTP " + response.status + ".");
      let result;
      try { result = await response.json(); }
      catch (_) { throw new Error("O serviço não retornou JSON. Confira a publicação e o acesso público do Apps Script."); }
      if (!result.success) {
        if (["UNAUTHORIZED", "SESSION_EXPIRED"].includes(result.error?.code)) localStorage.removeItem("gatekeeper.session-token");
        throw new Error(result.message || "Não foi possível concluir a operação.");
      }
      return result;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("O serviço demorou mais de 45 segundos. Aguarde um momento antes de tentar novamente.");
      if (error instanceof TypeError) throw new Error("Não foi possível conectar ao Apps Script. Verifique a conexão e teste em janela anônima, sem extensões ou VPN. Se persistir, confira a implantação do serviço.");
      throw error;
    } finally { clearTimeout(timeout); }
  };
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  function showLogin() { dashboard.hidden = true; loginScreen.hidden = false; email.focus(); }
  function showDashboard(data) {
    const stats = data.estatisticas || {};
    document.getElementById("responses").textContent = stats.respostas ?? "—";
    document.getElementById("confirmed").textContent = stats.confirmados ?? "—";
    document.getElementById("declined").textContent = stats.recusas ?? "—";
    document.getElementById("companions").textContent = stats.acompanhantes ?? "—";
    document.getElementById("people").textContent = stats.pessoas ?? "—";
    document.getElementById("updatedAt").textContent = data.atualizadoEm ? `Atualizado em ${data.atualizadoEm}` : "Sem atualização disponível";
    const guests = Array.isArray(data.convidados) ? data.convidados : [];
    window.dashboardGuests = guests;
    document.getElementById("guestList").innerHTML = guests.length ? guests.map(guest => `<tr><td>${escape(guest.nome || "—")}</td><td>${guest.confirmado === true ? "Confirmado" : guest.confirmado === false ? "Recusou" : "—"}</td><td>${escape(guest.acompanhantes ?? 0)}</td><td>${escape(guest.dataResposta || "—")}</td></tr>`).join("") : '<tr><td class="empty-cell" colspan="4">Nenhuma resposta disponível ainda.</td></tr>';
    loginScreen.hidden = true; dashboard.hidden = false;
  }
  async function loadDashboard(token) {
    const result = await callApi("event-dashboard", {_method:"GET", token, slug:event.slug});
    if (!result.success) throw new Error(result.message || "Não foi possível carregar o painel.");
    showDashboard(result.data);
  }
  form.addEventListener("submit", async submitEvent => {
    submitEvent.preventDefault();
    if (!email.value.trim() || !password.value) { notify("Informe e-mail e senha para acessar o painel."); return; }
    if (submitting) return;
    submitting = true; submitButton.disabled = true;
    const existingToken = null; // Explicit form submission always authenticates the supplied account.
    let stage = existingToken ? "carregamento do painel" : "autenticação";
    status.textContent = existingToken ? "Carregando painel…" : "Autenticando…";
    try {
      let token = existingToken;
      if (!token) {
        const result = await callApi("login", { email: email.value.trim(), senha: password.value });
        token = result.data?.token;
        if (!token) throw new Error("O serviço não retornou uma sessão válida.");
        localStorage.setItem("gatekeeper.session-token", token);
      }
      stage = "carregamento do painel"; status.textContent = "Sessão confirmada. Carregando painel…";
      await loadDashboard(token);
      status.textContent = ""; form.reset(); notify("Painel carregado com sucesso.");
    } catch (error) {
      status.textContent = "Falha na etapa de " + stage + ": " + error.message;
      notify(error.message); password.focus();
    } finally { submitting = false; submitButton.disabled = false; }

  });
  document.getElementById("logoutButton").addEventListener("click", () => { localStorage.removeItem("gatekeeper.session-token"); showLogin(); notify("Sessão encerrada."); });
  document.getElementById("exportPdf").addEventListener("click", () => { try { window.EventExports.exportPdf(event, window.dashboardGuests || []); } catch (error) { notify(error.message); } });
  document.getElementById("exportReceptionPdf").addEventListener("click", () => { try { window.EventExports.exportPdf(event, window.dashboardGuests || [], true); } catch (error) { notify(error.message); } });
  document.getElementById("exportExcel").addEventListener("click", () => { try { window.EventExports.exportExcel(event, window.dashboardGuests || []); } catch (error) { notify(error.message); } });
  document.addEventListener("DOMContentLoaded", async () => { const token = localStorage.getItem("gatekeeper.session-token"); if (!token) { showLogin(); return; } try { await loadDashboard(token); } catch (error) { showLogin(); status.textContent = "Não foi possível restaurar o painel: " + error.message; } });
})();
