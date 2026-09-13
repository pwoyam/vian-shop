// استیت سراسری + عملیات سبد/علاقه‌مندی/مقایسه (بدون رندر — رندر در components/app)
export const state = {
  cart: {}, wish: [], cmp: [], user: null,
  orders: [], addrs: [], notifs: [], recent: [], view: 'grid',
  theme: { preset: 'firoozeh', mode: 'light', radius: 'soft', custom: null }
};

const SKEY = 'vian_store_v1';
try {
  const s = localStorage.getItem(SKEY);
  if (s) { const p = JSON.parse(s); for (const k in p) state[k] = p[k]; }
} catch (e) {}

export function save() { try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch (e) {} }

export function cartCount() { let n = 0; for (const k in state.cart) n += state.cart[k].qty; return n; }
export function cartTotal() {
  let t = 0;
  for (const k in state.cart) { const it = state.cart[k]; const p = window.__byId && window.__byId(it.id); if (p) t += p.price * it.qty; }
  return t;
}

// افزودن به سبد — فقط استیت؛ رندر و توست با فراخواننده
// دریافت‌کننده‌ی byId از بیرون تزریق می‌شود تا وابستگی حلقه‌ای نشود
export function addToCart(id, qty, color, size) {
  qty = qty || 1;
  const p = window.__byId(id);
  if (!p || p.stock === 0) return { ok: false, reason: 'out' };
  const key = id + '|' + (color || '') + '|' + (size || '');
  const cur = state.cart[key] ? state.cart[key].qty : 0;
  if (cur + qty > p.stock) return { ok: false, reason: 'max' };
  state.cart[key] = { id, qty: cur + qty, color, size };
  save(); syncBadges(true);
  return { ok: true };
}
export function setQty(key, qty) {
  if (!state.cart[key]) return;
  const p = window.__byId(state.cart[key].id);
  qty = Math.max(1, Math.min(p ? p.stock : qty, qty));
  state.cart[key].qty = qty; save(); syncBadges();
}
export function removeFromCart(key) { delete state.cart[key]; save(); syncBadges(true); }

export function toggleWish(id) {
  const i = state.wish.indexOf(id);
  let added;
  if (i > -1) { state.wish.splice(i, 1); added = false; }
  else { state.wish.push(id); added = true; }
  save(); syncBadges();
  document.querySelectorAll('[data-act="wish"][data-id="' + id + '"]').forEach(b => b.classList.toggle('act', added));
  return added;
}
export function toggleCmp(id) {
  const i = state.cmp.indexOf(id);
  let added;
  if (i > -1) { state.cmp.splice(i, 1); added = false; }
  else {
    if (state.cmp.length >= 4) return { added: false, full: true };
    state.cmp.push(id); added = true;
  }
  save(); syncBadges();
  document.querySelectorAll('[data-act="cmp"][data-id="' + id + '"]').forEach(b => b.classList.toggle('act', added));
  return { added, full: false };
}

export function notifAdd(icon, title, desc) {
  state.notifs.unshift({ id: uid(), icon, title, desc, date: 'لحظاتی پیش', read: false });
  save();
}
function uid() { return Math.random().toString(36).slice(2, 9); }

export function syncBadges(pop) {
  function set(sel, n) {
    const el = document.querySelector(sel); if (!el) return;
    el.textContent = Number(n).toLocaleString('fa-IR');
    el.classList.toggle('show', n > 0);
    if (pop) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
  set('#cartCnt', cartCount()); set('#wishCnt', state.wish.length); set('#cmpCnt', state.cmp.length);
}