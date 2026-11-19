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
  const callApi = async (route, payload) => {
    const response = await fetch(`${window.EVENTOS_DE_AXE_API_URL}?route=${encodeURIComponent(route)}`, { method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify({...payload,route}) });
    if (!response.ok) throw new Error("Não foi possível conectar ao serviço do painel.");
    return response.json();
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
    try {
      const result = await callApi("login", {email:email.value.trim(), senha:password.value});
      if (!result.success || !result.data?.token) throw new Error(result.message || "E-mail ou senha inválidos.");
      localStorage.setItem("gatekeeper.session-token", result.data.token);
      await loadDashboard(result.data.token); form.reset(); notify("Painel carregado com sucesso.");
    } catch (error) { notify(error.message || "Não foi possível entrar no painel."); password.focus(); }
  });
  document.getElementById("logoutButton").addEventListener("click", () => { localStorage.removeItem("gatekeeper.session-token"); showLogin(); notify("Sessão encerrada."); });
  document.getElementById("exportPdf").addEventListener("click", () => { try { window.EventExports.exportPdf(event, window.dashboardGuests || []); } catch (error) { notify(error.message); } });
  document.getElementById("exportReceptionPdf").addEventListener("click", () => { try { window.EventExports.exportPdf(event, window.dashboardGuests || [], true); } catch (error) { notify(error.message); } });
  document.getElementById("exportExcel").addEventListener("click", () => { try { window.EventExports.exportExcel(event, window.dashboardGuests || []); } catch (error) { notify(error.message); } });
  document.addEventListener("DOMContentLoaded", async () => { const token = localStorage.getItem("gatekeeper.session-token"); if (!token) { showLogin(); return; } try { await loadDashboard(token); } catch (_) { localStorage.removeItem("gatekeeper.session-token"); showLogin(); } });
})();
