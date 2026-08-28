function showMessage(element, message, isError = false) { element.textContent = message; element.className = `message ${isError ? 'error' : 'success'}`; }
function queryToken() { return new URLSearchParams(location.search).get('token'); }
function redirectIfLoggedIn() { if (Session.get()) location.replace('perfil.html'); }

let pendingRequestCount = 0;
function setRequestPending(isPending) {
  pendingRequestCount += isPending ? 1 : -1;
  pendingRequestCount = Math.max(0, pendingRequestCount);
  const pending = pendingRequestCount > 0;
  document.body.setAttribute('aria-busy', String(pending));
  if (isPending) {
    const active = document.activeElement;
    const button = active?.matches('button') ? active : active?.closest('form')?.querySelector('button[type="submit"], button:not([type])');
    if (button && !button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent;
      button.disabled = true;
      button.textContent = 'Aguarde...';
    }
  }
  if (!pending) {
    document.querySelectorAll('button[data-default-label]').forEach(button => {
      button.disabled = false;
      button.textContent = button.dataset.defaultLabel;
      delete button.dataset.defaultLabel;
    });
  }
}
