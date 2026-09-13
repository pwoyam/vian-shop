// ============================================================
// لایه‌ی داده — در حالت demo محلی، در حالت api از بک‌اند
// ============================================================
import { CONFIG } from './config.js';
import { PRODUCTS, CATS, REVIEWS_SEED } from './data.js';
import { state, save } from './store.js';

const API = CONFIG.apiBase;
const MODE = CONFIG.mode;

function getToken() { return localStorage.getItem('vian_token') || ''; }
export function setToken(t) {
  if (t) localStorage.setItem('vian_token', t); else localStorage.removeItem('vian_token');
}

async function jfetch(path, opts = {}) {
  const res = await fetch(API + path, {
    method: opts.method || 'GET',
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      getToken() ? { Authorization: 'Bearer ' + getToken() } : {},
      opts.headers || {}
    ),
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'request_failed'); e.code = data.error; throw e; }
  return data;
}
function mapApiProduct(p) {
  return {
    id: p.id, name: p.name, cat: p.category_id, art: p.art, hue: p.hue,
    price: p.price, old: p.old_price || 0, stock: p.stock, rating: p.rating,
    rc: p.rating_count, brand: p.brand, isNew: !!p.is_new, feat: !!p.is_featured,
    best: !!p.is_bestseller, desc: p.description, specs: p.specs || [], sizes: p.sizes || []
  };
}

export const api = {
  mode: MODE,

  async getProducts(filters = {}) {
    if (MODE === 'demo') {
      let list = PRODUCTS.slice();
      if (filters.cat) list = list.filter(p => p.cat === filters.cat);
      if (filters.q) list = list.filter(p => (p.name + p.brand + (p.desc || '')).indexOf(filters.q) > -1);
      if (filters.off === '1') list = list.filter(p => p.old);
      if (filters.avail === '1') list = list.filter(p => p.stock > 0);
      if (filters.brand) list = list.filter(p => p.brand === filters.brand);
      if (filters.min) list = list.filter(p => p.price >= +filters.min);
      if (filters.max) list = list.filter(p => p.price <= +filters.max);
      const sorts = {
        new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0),
        cheap: (a, b) => a.price - b.price, exp: (a, b) => b.price - a.price,
        pop: (a, b) => b.rc - a.rc, rate: (a, b) => b.rating - a.rating
      };
      list.sort(sorts[filters.sort] || ((a, b) => (b.feat || 0) - (a.feat || 0) || b.rating - a.rating));
      return { items: list, total: list.length };
    }
    const qs = new URLSearchParams();
    Object.keys(filters).forEach(k => { if (filters[k] !== undefined && filters[k] !== '') qs.set(k, filters[k]); });
    const d = await jfetch('/products?' + qs.toString());
    return { items: d.items.map(mapApiProduct), total: d.total };
  },

  async getProduct(id) {
    if (MODE === 'demo') return PRODUCTS.find(p => p.id === id) || null;
    return mapApiProduct(await jfetch('/products/' + id));
  },

  async getRelated(id) {
    if (MODE === 'demo') {
      const p = PRODUCTS.find(x => x.id === id);
      return p ? PRODUCTS.filter(x => x.cat === p.cat && x.id !== id).slice(0, 4) : [];
    }
    return (await jfetch('/products/' + id + '/related')).map(mapApiProduct);
  },

  async getCategories() {
    if (MODE === 'demo') {
      return CATS.map(c => Object.assign({}, c, { count: PRODUCTS.filter(p => p.cat === c.id).length }));
    }
    return (await jfetch('/categories')).map(c => ({ id: c.id, name: c.name, icon: c.icon, hue: c.hue, count: c.product_count }));
  },

  async getReviews(id) {
    if (MODE === 'demo') return (REVIEWS_SEED[id] || []).slice();
    return (await jfetch('/reviews/product/' + id)).map(r => ({
      n: r.name, d: r.created_at, r: r.rating, t: r.body, v: r.verified
    }));
  },

  async addReview(id, rating, body) {
    if (MODE === 'demo') {
      (REVIEWS_SEED[id] = REVIEWS_SEED[id] || []).unshift({
        n: state.user ? state.user.name : 'کاربر ' + CONFIG_name(), d: 'لحظاتی پیش', r: rating, t: body, v: !!state.user
      });
      return { ok: true };
    }
    return jfetch('/reviews/product/' + id, { method: 'POST', body: { rating, body } });
  },

  // --- auth ---
  async register(name, email, password) {
    if (MODE === 'demo') {
      state.user = { name, email, phone: '' }; save();
      return { user: state.user };
    }
    const d = await jfetch('/auth/register', { method: 'POST', body: { name, email, password } });
    setToken(d.token); state.user = d.user; save();
    return d;
  },
  async login(email, password) {
    if (MODE === 'demo') {
      state.user = { name: email.split('@')[0] || 'کاربر', email, phone: '' }; save();
      return { user: state.user };
    }
    const d = await jfetch('/auth/login', { method: 'POST', body: { email, password } });
    setToken(d.token); state.user = d.user; save();
    return d;
  },
  logout() { state.user = null; setToken(''); save(); },

  // --- orders ---
  async placeOrder(order) {
    if (MODE === 'demo') {
      const id = 'VN-' + Math.floor(1000 + Math.random() * 9000);
      state.orders.unshift(Object.assign({ id, date: 'امروز', status: 0 }, order));
      save();
      return { id };
    }
    return jfetch('/orders', { method: 'POST', body: order });
  },
  async getOrders() {
    if (MODE === 'demo') return state.orders.slice();
    return jfetch('/orders');
  },

  // --- user / addresses / notifications ---
  async updateProfile(fields) {
    if (MODE === 'demo') { Object.assign(state.user, fields); save(); return state.user; }
    return jfetch('/users/me', { method: 'PUT', body: fields });
  },
  async getAddresses() {
    if (MODE === 'demo') return state.addrs.slice();
    return jfetch('/users/addresses');
  },
  async addAddress(a) {
    if (MODE === 'demo') {
      a.id = Math.random().toString(36).slice(2, 9);
      if (!state.addrs.length) a.def = true;
      state.addrs.push(a); save(); return a;
    }
    return jfetch('/users/addresses', { method: 'POST', body: a });
  },
  async removeAddress(id) {
    if (MODE === 'demo') { state.addrs = state.addrs.filter(x => x.id !== id); save(); return { ok: true }; }
    return jfetch('/users/addresses/' + id, { method: 'DELETE' });
  },
  async getNotifications() {
    if (MODE === 'demo') return state.notifs.slice();
    return jfetch('/users/notifications');
  },
  async markNotificationsRead() {
    if (MODE === 'demo') { state.notifs.forEach(n => n.read = true); save(); return { ok: true }; }
    return jfetch('/users/notifications/read', { method: 'POST' });
  }
};

function CONFIG_name() { return CONFIG.brand.name; }