// ui.js — handles login and theme toggle

(function(){
  // Demo site: do not store real credentials in source.
  // For demo purposes accept any non-empty username/password.

  // Defer DOM-dependent initialization until the document is ready
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const themeToggle = document.getElementById('theme-toggle');

    // make errorMessage focusable if present so .focus() works
    if(errorMessage && !errorMessage.hasAttribute('tabindex')){
      errorMessage.setAttribute('tabindex','-1');
      errorMessage.setAttribute('role','status');
      errorMessage.setAttribute('aria-live','polite');
    }

    // Theme: read from localStorage or prefers-color-scheme
    function getSavedTheme(){
      return localStorage.getItem('site-theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    function applyTheme(theme){
      if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('site-theme', theme);
      // update aria-pressed and button label
      if(themeToggle){
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }

    // Initial theme application
    applyTheme(getSavedTheme());

    if(themeToggle){
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // Login handling
    if(loginForm){
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(errorMessage) errorMessage.classList.remove('success');

        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        const username = (usernameEl && usernameEl.value || '').trim();
        const password = (passwordEl && passwordEl.value || '').trim();

        if(!username || !password){
          showError('Please enter both email and password.');
          return;
        }

        // Demo login: accept any non-empty credentials (no real auth on static site)
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => location.href = 'main.html', 900);
      });
    }

    function showError(msg){
      if(!errorMessage) return; // nothing to show
      errorMessage.textContent = msg;
      errorMessage.classList.remove('success');
      errorMessage.classList.add('error');
      // let CSS control color; focus so screen readers announce it
      try { errorMessage.focus(); } catch(e){}
    }

    function showSuccess(msg){
      if(!errorMessage) return;
      errorMessage.textContent = msg;
      errorMessage.classList.add('success');
      errorMessage.classList.remove('error');
      try { errorMessage.focus(); } catch(e){}
    }
  });
})();
