// Login page initialization
import { qs } from '../lib/dom.js';
import { demoLogin } from '../lib/auth.js';

export async function initLogin() {
  const form = qs('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = qs('#login-email').value.trim();
    const pass = qs('#login-pass').value.trim();
    const msgEl = qs('#login-msg');
    msgEl.textContent = '';
    
    try {
      const user = await demoLogin(email, pass);
      msgEl.textContent = `Welcome, ${user.firstName}! Redirecting…`;
      setTimeout(() => window.location.href = 'products.html', 600);
    } catch (err) {
      msgEl.textContent = 'Invalid email or password (case-sensitive).';
    }
  });
}
