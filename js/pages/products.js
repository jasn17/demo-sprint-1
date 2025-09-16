// Products page initialization
import { qs, qsa } from '../lib/dom.js';
import { loadJSON, DATA } from '../lib/api.js';
import { currencyFromPoints, createErrorCard } from '../lib/ui.js';
import { addToCart } from '../lib/cart.js';
import { initLogoutButtons, getCurrentUser } from '../lib/auth.js';

export async function initProducts() {
  const grid = qs('.products-grid');
  if (!grid) return; // only run on products page

  // Initialize logout buttons
  initLogoutButtons();

  // Greeting (from driver.json)
  try {
    const drivers = await loadJSON(DATA.driver);
    if (Array.isArray(drivers) && drivers.length) {
      const d = drivers[0];
      const greet = qs('#greeting');
      if (greet) greet.textContent = `Welcome back, ${d.firstName}!`;
    }
  } catch (e) { 
    // Optional greeting, don't show error
  }

  // Load products
  let products = [];
  try {
    products = await loadJSON(DATA.products);
  } catch (e) {
    const errorCard = createErrorCard(
      'Could not load products.',
      'Please check your connection and try again.'
    );
    grid.appendChild(errorCard);
    return;
  }

  // Update results count
  const resultsCount = qs('#results-count');
  if (resultsCount) {
    resultsCount.textContent = `${products.length} results`;
  }

  // Clear grid and render products
  grid.innerHTML = '';
  for (const p of products) {
    const inStock = (p.ITEM_STOCK ?? 0) > 0;
    const img = (p.ITEM_IMG && p.ITEM_IMG !== 'placeholder')
      ? p.ITEM_IMG
      : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'; // fallback

    const card = document.createElement('article');
    card.className = 'product-card product-card--amazon';
    card.innerHTML = `
      <a class="thumb"><img src="${img}" alt="${p.ITEM_NAME}" onerror="this.src='https://via.placeholder.com/400x300?text=Item'"></a>
      <div class="pc-body">
        <a class="pc-title" href="#">${p.ITEM_NAME}</a>
        <div class="pc-desc">${p.ITEM_DES || ''}</div>
        <div class="pc-price">
          <strong>${p.ITEM_PRICE} pts</strong>
          <span class="muted">(${currencyFromPoints(p.ITEM_PRICE)})</span>
        </div>
        <div class="pc-actions">
          <button class="btn btn--primary" ${inStock ? '' : 'disabled'} data-id="${p.ITEM_ID}">
            ${inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
        <div class="pc-meta muted">${p.ITEM_STOCK} in stock</div>
      </div>
    `;
    grid.appendChild(card);
  }

  // Add-to-cart wiring
  grid.addEventListener('click', e => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    const item = products.find(x => x.ITEM_ID === id);
    if (item) addToCart(item);
  });
}
