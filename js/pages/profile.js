// Profile page initialization
import { qs } from '../lib/dom.js';
import { initLogoutButtons, getCurrentUser } from '../lib/auth.js';

export function initProfile() {
  const nameEl = qs('#p-name');
  if (!nameEl) return;

  // Initialize logout buttons
  initLogoutButtons();

  const user = getCurrentUser();
  if (user) {
    qs('#p-name').textContent = `${user.firstName} ${user.lastName}`;
    qs('#p-email').textContent = user.email;
    qs('#p-phone').textContent = user.phoneNumber || '—';
    qs('#p-bday').textContent = user.birthday || '—';
  } else {
    // Show placeholder if no user
    qs('#p-name').textContent = '—';
    qs('#p-email').textContent = '—';
    qs('#p-phone').textContent = '—';
    qs('#p-bday').textContent = '—';
  }
}
