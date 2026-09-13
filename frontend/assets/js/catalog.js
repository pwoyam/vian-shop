// کش محصولات و دسته‌ها — در حالت demo از data.js، در حالت api از بک‌اند پر می‌شود
import { PRODUCTS, CATS } from './data.js';

export let products = PRODUCTS.slice();
export let categories = CATS.map(c => ({ ...c, count: PRODUCTS.filter(p => p.cat === c.id).length }));

export function setCatalog(p, c) {
  products = p;
  categories = c.map(x => ({ ...x, count: x.count != null ? x.count : p.filter(pp => pp.cat === x.id).length }));
  window.__byId = byId;
}
export function byId(id) { return products.find(x => x.id === id) || null; }
export function catOf(id) { return categories.find(c => c.id === id) || categories[0]; }
export function catName(id) { const c = catOf(id); return c ? c.name : ''; }
window.__byId = byId;