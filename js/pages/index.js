// Landing page initialization
import { qs } from '../lib/dom.js';

export function initIndex() {
  const btn = qs('#get-started-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      // send users to products catalog page
      window.location.href = 'products.html';
    });
  }
}
