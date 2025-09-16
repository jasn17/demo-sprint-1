const DATA = {
  products: 'products.json',   // ensure this file sits next to your HTML files
  driver:   'driver.json'
};

// --- Utilities ---
const qs  = (sel, root=document) => root.querySelector(sel);
const qsa = (sel, root=document) => [...root.querySelectorAll(sel)];

function currencyFromPoints(points, rate = 0.01){
  // Convert "points" to dollar string based on sponsor conversion (default 1pt = $0.01)
  return `$${(points * rate).toFixed(2)}`;
}

function loadJSON(url){
  return fetch(url, { cache: 'no-store' }).then(r => {
    if(!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.json();
  });
}

const CART_KEY = 'nd_cart';
const USER_KEY = 'nd_user';

function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }


function updateQty(itemId, qty){
  const cart = getCart();
  const it = cart.find(i => i.ITEM_ID === itemId);
  if(!it) return;
  it.qty = Math.max(1, Math.min(qty, it.ITEM_STOCK));
  saveCart(cart);
  renderCart();
}

function cartTotalPoints(){
  return getCart().reduce((sum, i) => sum + (i.ITEM_PRICE * i.qty), 0);
}

// --- Toast (tiny) ---
let toastTimer;
function toast(msg){
  let el = qs('#toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = `
      position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
      background: rgba(255,255,255,.98); color: #071020; padding: 10px 14px;
      border-radius: 999px; box-shadow: 0 10px 30px rgba(0,0,0,.25);
      z-index: 9999; font-weight: 700;
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(toastTimer);
  el.style.opacity = '1';
  toastTimer = setTimeout(()=> el.style.opacity = '0', 1600);
}

// --- Page: Landing (index.html) ---
function initLanding(){
  const btn = qs('#get-started-btn');
  if(btn){
    btn.addEventListener('click', () => {
      // send users to products catalog page
      window.location.href = '/products.html';
    });
  }
}

// --- Page: Products (products.html) ---
async function initProducts(){
  const grid = qs('.products-grid');
  if(!grid) return; // only run on products page

  // Greeting (from driver.json)
  try{
    const drivers = await loadJSON(DATA.driver);
    if(Array.isArray(drivers) && drivers.length){
      const d = drivers[0];
      const greet = qs('#greeting');
      if(greet) greet.textContent = `Welcome back, ${d.firstName}!`;
    }
  }catch(e){ /* optional */ }

  // Catalog
  let products = [];
  try{
    products = await loadJSON(DATA.products);
  }catch(e){
    grid.innerHTML = `<div class="product-card">Could not load products.</div>`;
    return;
  }

  grid.innerHTML = '';
  for(const p of products){
    const inStock = (p.ITEM_STOCK ?? 0) > 0;
    const img = (p.ITEM_IMG && p.ITEM_IMG !== 'placeholder')
      ? p.ITEM_IMG
      : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'; // fallback

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${img}" alt="${p.ITEM_NAME}">
      <div class="product-title">${p.ITEM_NAME}</div>
      <div class="product-desc">${p.ITEM_DES || ''}</div>
      <div class="card-row">
        <span class="badge">${p.ITEM_STOCK} in stock</span>
        <strong>${p.ITEM_PRICE} pts <span style="color:var(--muted);font-weight:400">(${currencyFromPoints(p.ITEM_PRICE)})</span></strong>
      </div>
      <button class="btn ${inStock ? 'btn-primary' : ''}" ${inStock ? '' : 'disabled'} data-id="${p.ITEM_ID}">
        ${inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    `;
    grid.appendChild(card);
  }

  // Add-to-cart wiring
  grid.addEventListener('click', e => {
    const btn = e.target.closest('button[data-id]');
    if(!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    const item = products.find(x => x.ITEM_ID === id);
    if(item) addToCart(item);
  });
}

// --- Page: Cart (cart.html) ---
function renderCart(){
  const tbody = qs('#cart-body');
  const totalEl = qs('#cart-total');
  if(!tbody || !totalEl) return;

  const cart = getCart();
  tbody.innerHTML = '';

  if(cart.length === 0){
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--muted);">Your cart is empty.</td></tr>`;
    totalEl.textContent = `0 pts ($0.00)`;
    return;
  }

  for(const item of cart){
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
    tr.querySelector('input').addEventListener('change', ev => {
      const val = Number(ev.target.value || 1);
      updateQty(item.ITEM_ID, val);
    });
    // remove
    tr.querySelector('button[data-remove]').addEventListener('click', () => removeFromCart(item.ITEM_ID));

    tbody.appendChild(tr);
  }

  const totalPts = cartTotalPoints();
  totalEl.textContent = `${totalPts} pts (${currencyFromPoints(totalPts)})`;
}

function initCart(){
  const table = qs('#cart');
  if(!table) return; // only on cart page
  renderCart();

  const checkoutBtn = qs('#checkout-btn');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', () => {
      if(getCart().length === 0) return toast('Cart is empty');
      // In a real app, you’d POST to server; here we just clear and show a toast.
      localStorage.removeItem(CART_KEY);
      renderCart();
      toast('Order placed! 🎉 (mock)');
    });
  }
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', () => {
  initLanding();
  initProducts();
  initCart();
});


function loadJSON(url){
  return fetch(url, { cache: 'no-store' }).then(r => {
    if(!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.json();
  });
}

function currencyFromPoints(points, rate=0.01){
  return `$${(points * rate).toFixed(2)}`;
}

function toast(msg){
  let el = qs('#toast');
  if(!el){
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
  el.style.opacity = '1';
  setTimeout(()=> el.style.opacity = '0', 1600);
}

/* =======================
   Auth (Demo)
   - Username = full Gmail (case-sensitive)
   - Password = lastName (case-sensitive)
======================= */
async function demoLogin(email, password){
  const drivers = await loadJSON(DATA.driver); // emails/last names come from driver.json
  const user = drivers.find(d => d.email === email && d.lastName === password);
  if(!user) throw new Error('Invalid credentials');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

/*
function requireAuth(redirect='/login.html'){
  const u = getCurrentUser();
  if(!u) window.location.href = redirect;
  return u;
}
*/

function logout(){
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login.html';
}

/* Wire logout buttons (if present) */
function initLogoutButtons(){
  qsa('#logout-btn').forEach(btn => btn.addEventListener('click', logout));
}

/* =======================
   Cart
======================= */
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function addToCart(item){
  const cart = getCart();
  const ex = cart.find(i => i.ITEM_ID === item.ITEM_ID);
  if(ex){
    if(ex.qty < item.ITEM_STOCK) ex.qty += 1;
  }else{
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  toast(`Added “${item.ITEM_NAME}”`);
}

/* =======================
   Pages
======================= */
async function initLoginPage(){
  const form = qs('#login-form');
  if(!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = qs('#login-email').value.trim();
    const pass  = qs('#login-pass').value.trim();
    const msgEl = qs('#login-msg');
    msgEl.textContent = '';
    try{
      const user = await demoLogin(email, pass);
      msgEl.textContent = `Welcome, ${user.firstName}! Redirecting…`;
      setTimeout(()=> window.location.href = '/products.html', 600);
    }catch(err){
      msgEl.textContent = 'Invalid email or password (case-sensitive).';
    }
  });
}

async function initProductsPage(){
  const grid = qs('.products-grid');
  if(!grid) return;

  
  initLogoutButtons();

  const greet = qs('#greeting');
  if(greet) greet.textContent = `Hello, ${user.firstName} ${user.lastName}`;

  let products = [];
  try{
    products = await loadJSON(DATA.products); // images/names/prices from products.json
  }catch(e){
    grid.innerHTML = `<div class="product-card">Could not load products.</div>`;
    return;
  }

  qs('#results-count')?.replaceChildren(document.createTextNode(`${products.length} results`));

  grid.innerHTML = '';
  for(const p of products){
    const inStock = (p.ITEM_STOCK ?? 0) > 0;
    const img = p.ITEM_IMG || 'https://via.placeholder.com/400x300?text=Item';
    const card = document.createElement('article');
    card.className = 'product-card product-card--amazon';
    card.innerHTML = `
      <a class="thumb"><img src="${img}" alt="${p.ITEM_NAME}"></a>
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

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]');
    if(!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    if(!products.length) products = await loadJSON(DATA.products);
    const item = products.find(x => x.ITEM_ID === id);
    if(item) addToCart(item);
  });
}

function initProfilePage(){
  const nameEl = qs('#p-name');
  if(!nameEl) return;

  
  initLogoutButtons();

  qs('#p-name').textContent  = `${user.firstName} ${user.lastName}`;
  qs('#p-email').textContent = user.email;
  qs('#p-phone').textContent = user.phoneNumber || '—';
  qs('#p-bday').textContent  = user.birthday || '—';
}

/* =======================
   Boot
======================= */
document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initProductsPage();
  initProfilePage();
});

function displayProducts(products) {
  

}
