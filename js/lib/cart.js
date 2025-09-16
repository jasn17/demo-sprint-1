// Cart management - single source of truth
import { toast } from './ui.js';

const CART_KEY = 'nd_cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.ITEM_ID === item.ITEM_ID);
  if (existing) {
    // increment qty if in stock
    if (existing.qty < item.ITEM_STOCK) existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  toast(`Added "${item.ITEM_NAME}" to cart`);
}

export function removeFromCart(itemId) {
  let cart = getCart().filter(i => i.ITEM_ID !== itemId);
  saveCart(cart);
  // Note: renderCart() will be called by the page module
}

export function updateQty(itemId, qty) {
  const cart = getCart();
  const it = cart.find(i => i.ITEM_ID === itemId);
  if (!it) return;
  // Clamp quantity to [1, ITEM_STOCK]
  it.qty = Math.max(1, Math.min(qty, it.ITEM_STOCK));
  saveCart(cart);
  // Note: renderCart() will be called by the page module
}

export function cartTotalPoints() {
  return getCart().reduce((sum, i) => sum + (i.ITEM_PRICE * i.qty), 0);
}
