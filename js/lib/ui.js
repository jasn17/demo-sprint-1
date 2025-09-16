// UI utilities
import { qs } from './dom.js';

export function currencyFromPoints(points, rate = 0.01) {
  // Convert "points" to dollar string based on sponsor conversion (default 1pt = $0.01)
  return `$${(points * rate).toFixed(2)}`;
}

// Toast notification system
let toastTimer;
export function toast(msg) {
  let el = qs('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = `
      position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
      background: rgba(255,255,255,.98); color: #071020; padding: 10px 14px;
      border-radius: 999px; box-shadow: 0 10px 30px rgba(0,0,0,.25);
      z-index: 9999; font-weight: 700; transition: opacity .2s;
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(toastTimer);
  el.style.opacity = '1';
  toastTimer = setTimeout(() => el.style.opacity = '0', 1600);
}

// Create inline error card
export function createErrorCard(message, hint = '') {
  const errorCard = document.createElement('div');
  errorCard.className = 'error-card';
  errorCard.style.cssText = `
    grid-column: 1 / -1;
    padding: 20px;
    background: var(--surface);
    border: 1px solid var(--danger);
    border-radius: var(--radius);
    text-align: center;
    color: var(--danger);
  `;
  errorCard.innerHTML = `
    <h3>⚠️ Error</h3>
    <p>${message}</p>
    ${hint ? `<p class="muted" style="margin-top: 8px; font-size: 14px;">${hint}</p>` : ''}
  `;
  return errorCard;
}
