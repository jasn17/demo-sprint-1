// API utilities and data paths
export const DATA = {
  products: 'json/products.json',
  driver: 'json/driver.json',
  about: 'json/about.json'
};

export function loadJSON(url) {
  return fetch(url, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.json();
  });
}
