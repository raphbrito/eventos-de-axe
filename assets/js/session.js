const Session = {
  key: 'gatekeeper.session-token',
  save(token) { localStorage.setItem(this.key, token); },
  get() { return localStorage.getItem(this.key); },
  clear() { localStorage.removeItem(this.key); sessionStorage.removeItem('eventos-de-axe.account-cache'); },
  requireLogin() { if (!this.get()) window.location.replace('login.html'); }
};
