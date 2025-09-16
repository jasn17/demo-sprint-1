// Cart page initialization
import { qs } from '../lib/dom.js';
import { currencyFromPoints, toast } from '../lib/ui.js';
import { getCart, saveCart, updateQty, removeFromCart, cartTotalPoints } from '../lib/cart.js';

function renderCart() {
  const tbody = qs('#cart-body');
  const totalEl = qs('#cart-total');
  if (!tbody || !totalEl) return;

  const cart = getCart();
  tbody.innerHTML = '';

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--muted);">Your cart is empty.</td></tr>`;
    totalEl.textContent = `0 pts ($0.00)`;
    return;
  }

  for (const item of cart) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.ITEM_NAME}</td>
      <td>${item.ITEM_PRICE} pts</td>
      <td>
        <input type="number" min="1" max="${item.ITEM_STOCK}" value="${item.qty}" style="width:70px;background:#0b1222;color:var(--text);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:6px">
      </td>
      <td>${item.ITEM_PRICE * item.qty} pts</td>
      <td><button class="btn btn-danger" data-remove="${item.ITEM_ID}">Remove</button></td>
    `;
    
    // qty change
    const qtyInput = tr.querySelector('input');
    if (qtyInput) {
      qtyInput.addEventListener('change', ev => {
        const val = Number(ev.target.value || 1);
        updateQty(item.ITEM_ID, val);
        renderCart(); // re-render after update
      });
    }
    
    // remove
    const removeBtn = tr.querySelector('button[data-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeFromCart(item.ITEM_ID);
        renderCart(); // re-render after removal
      });
    }

    tbody.appendChild(tr);
  }

  const totalPts = cartTotalPoints();
  totalEl.textContent = `${totalPts} pts (${currencyFromPoints(totalPts)})`;
}

export function initCart() {
  const table = qs('#cart');
  if (!table) return; // only on cart page
  
  renderCart();

  const checkoutBtn = qs('#checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (getCart().length === 0) return toast('Cart is empty');
      // In a real app, you'd POST to server; here we just clear and show a toast.
      saveCart([]);
      renderCart();
      toast('Order placed! 🎉 (mock)');
    });
  }
}
