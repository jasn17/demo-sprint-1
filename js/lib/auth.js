// Demo authentication (not enforced)
import { loadJSON } from './api.js';

const USER_KEY = 'nd_user';

export async function demoLogin(email, password) {
  const drivers = await loadJSON('json/driver.json'); // emails/last names come from driver.json
  const user = drivers.find(d => d.email === email && d.lastName === password);
  if (!user) throw new Error('Invalid credentials');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  window.location.href = 'login.html';
}

// Wire logout buttons (if present)
export function initLogoutButtons() {
  const logoutBtns = document.querySelectorAll('#logout-btn');
  logoutBtns.forEach(btn => btn.addEventListener('click', logout));
}
