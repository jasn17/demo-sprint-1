// Main router - calls appropriate page initialization based on data-page attribute
import { initIndex } from './pages/index.js';
import { initProducts } from './pages/products.js';
import { initCart } from './pages/cart.js';
import { initProfile } from './pages/profile.js';
import { initAbout } from './pages/about.js';
import { initLogin } from './pages/login.js';

// Page router
function initPage() {
  const page = document.body.getAttribute('data-page');
  
  switch (page) {
    case 'index':
      initIndex();
      break;
    case 'products':
      initProducts();
      break;
    case 'cart':
      initCart();
      break;
    case 'profile':
      initProfile();
      break;
    case 'about':
      initAbout();
      break;
    case 'login':
      initLogin();
      break;
    default:
      console.warn(`Unknown page: ${page}`);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPage);
