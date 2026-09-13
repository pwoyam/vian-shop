import { I, IF } from './icons.js';
import { art } from './art.js';
import { esc, fa, faD, toman, pctOff } from './utils.js';
import { state, cartCount, cartTotal } from './store.js';
import { CONFIG } from './config.js';

export function stars(r, s) {
  s = s || 14; let o = '';
  for (let i = 1; i <= 5; i++)
    o += '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="' + (i <= Math.round(r) ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.6" class="ic" style="color:var(--warn)">' + (ICONS_STAR) + '</svg>';
  return '<span style="display:inline-flex;gap:2px">' + o + '</span>';
}
const ICONS_STAR = '<path d="M12 2.6l2.9 5.9 6.5 1-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.1 1.1-6.5L2.6 9.5l6.5-1Z"/>';

export function priceBlock(p, big) {
  if (big) return '<div class="pd-price"><span class="big">' + toman(p.price) + '</span>' +
    (p.old ? '<span class="oldp" style="font-size:15px">' + fa(p.old) + '</span><span class="offc">' + fa(pctOff(p)) + '٪</span>' : '') + '</div>';
  return '<div class="pline-col"><div style="display:flex;gap:7px;align-items:center">' +
    (p.old ? '<span class="oldp">' + fa(p.old) + '</span><span class="offc">' + fa(pctOff(p)) + '٪</span>' : '') +
    '</div><span class="price">' + toman(p.price) + '</span></div>';
}

export function cardP(p, mode, catName) {
  mode = mode || 'g';
  const w = state.wish.indexOf(p.id) > -1, c = state.cmp.indexOf(p.id) > -1;
  return '<article class="pcard rv ' + (mode === 'l' ? 'l' : '') + ' ' + (p.stock === 0 ? 'stock-out' : '') + '" data-id="' + p.id + '">' +
    '<div class="pmedia"><a href="#/product/' + p.id + '" aria-label="' + esc(p.name) + '">' + art(p) + '</a>' +
    '<div class="pbdg">' + (p.old ? '<span class="bdg bdg-acc">' + fa(pctOff(p)) + '٪ تخفیف</span>' : '') + (p.isNew ? '<span class="bdg bdg-ink">جدید</span>' : '') + (p.stock === 0 ? '<span class="bdg bdg-mut">ناموجود</span>' : '') + '</div>' +
    '<div class="qa">' +
    '<button class="qbtn ' + (w ? 'act' : '') + '" data-act="wish" data-id="' + p.id + '" aria-label="علاقه‌مندی">' + IF('heart', 17) + '</button>' +
    '<button class="qbtn ' + (c ? 'act' : '') + '" data-act="cmp" data-id="' + p.id + '" aria-label="مقایسه">' + I('swap', 16) + '</button>' +
    '<a class="qbtn" href="#/product/' + p.id + '" aria-label="مشاهده">' + I('eye', 16) + '</a>' +
    '</div></div>' +
    '<div class="pbody">' +
    '<div class="pcat"><span>' + (catName || '') + '</span><span>' + p.brand + '</span></div>' +
    '<h3 class="pname"><a href="#/product/' + p.id + '">' + p.name + '</a></h3>' +
    (mode === 'l' ? '<p class="pdesc">' + (p.desc || '') + '</p>' : '') +
    '<div class="prate">' + stars(p.rating) + ' <span>' + faD(p.rating) + ' (' + fa(p.rc) + ')</span></div>' +
    '<div class="pline">' + priceBlock(p) +
    '<button class="addmini" data-act="add-cart" data-id="' + p.id + '" aria-label="افزودن به سبد" ' + (p.stock === 0 ? 'disabled' : '') + '>' + (p.stock === 0 ? I('bell', 18) : I('bag', 18)) + '</button>' +
    '</div></div></article>';
}

export function skelCards(n) {
  let o = '';
  for (let i = 0; i < n; i++) o += '<div class="sk-card"><div class="sk img"></div><div class="b"><div class="sk ln"></div><div class="sk ln w60"></div><div class="sk ln w40"></div></div></div>';
  return o;
}
export function emptySt(icon, title, desc, href, txt) {
  return '<div class="empty rv on"><div class="ei">' + I(icon, 38) + '</div><h3>' + title + '</h3><p>' + desc + '</p>' +
    (href ? '<a class="btn btn-p" href="' + href + '">' + (txt || 'ادامه') + '</a>' : '') + '</div>';
}
export function secHead(kicker, title, link, linkTxt) {
  return '<div class="sec-head"><div><div class="kicker">' + kicker + '</div><h2 class="sec-title">' + title + '</h2></div>' +
    (link ? '<a class="sec-link" href="' + link + '">' + (linkTxt || 'مشاهده همه') + ' ' + I('arrowL', 16) + '</a>' : '') + '</div>';
}
export function crumb(items) {
  let o = '<nav class="crumb" aria-label="مسیر">';
  for (let i = 0; i < items.length; i++)
    o += i < items.length - 1 ? '<a href="' + items[i].h + '">' + items[i].t + '</a>' + I('chevL', 13) : '<span>' + items[i].t + '</span>';
  return o + '</nav>';
}
export function stepper(val, min, max, ctx) {
  return '<div class="stepper" data-ctx="' + ctx + '"><button type="button" data-act="q-inc" aria-label="کاهش">' + I('minus', 15) +
    '</button><input type="number" value="' + val + '" min="' + min + '" max="' + max + '" readonly aria-label="تعداد">' +
    '<button type="button" data-act="q-inc" data-d="1" aria-label="افزایش">' + I('plus', 15) + '</button></div>';
}
export function pager(cur, total, base) {
  if (total < 2) return '';
  let o = '<button class="pg" ' + (cur <= 1 ? 'disabled' : '') + ' onclick="location.hash=\'' + base + 'page=' + (cur - 1) + '\'">' + I('chevR', 16) + '</button>';
  let skipped = false;
  for (let i = 1; i <= total; i++) {
    if (total > 7 && i > 2 && i < total - 1 && Math.abs(i - cur) > 1) { if (!skipped) { o += '<span class="pg" style="border:none;background:none">…</span>'; skipped = true; } continue; }
    o += '<button class="pg ' + (i === cur ? 'on' : '') + '" onclick="location.hash=\'' + base + 'page=' + i + '\'">' + fa(i) + '</button>';
  }
  o += '<button class="pg" ' + (cur >= total ? 'disabled' : '') + ' onclick="location.hash=\'' + base + 'page=' + (cur + 1) + '\'">' + I('chevL', 16) + '</button>';
  return '<div class="pgn">' + o + '</div>';
}

export function renderCartDrawer() {
  const keys = Object.keys(state.cart);
  const body = $('#cartBody'), foot = $('#cartFoot');
  if (!keys.length) {
    body.innerHTML = emptySt('bag', 'سبد خرید خالی است', 'هنوز کالایی به سبد اضافه نکرده‌اید.', '#/shop', 'مشاهده محصولات');
    foot.innerHTML = ''; return;
  }
  body.innerHTML = keys.map(k => {
    const it = state.cart[k], p = window.__byId(it.id);
    return '<div class="ci-row"><a class="cm" href="#/product/' + p.id + '">' + art(p) + '</a>' +
      '<div class="cb"><a href="#/product/' + p.id + '"><b>' + p.name + '</b></a>' +
      '<div class="meta">' + (it.color ? 'رنگ: ' + it.color + ' • ' : '') + (it.size ? 'سایز: ' + it.size : '') + '</div>' +
      '<div class="cr">' + stepper(it.qty, 1, p.stock, k) + '<span class="price">' + toman(p.price * it.qty) + '</span></div>' +
      '</div><button class="ibtn" style="width:34px;height:34px" data-act="cart-rm" data-key="' + k + '" aria-label="حذف">' + I('trash', 16) + '</button></div>';
  }).join('');
  const t = cartTotal();
  const free = t >= CONFIG.freeShip;
  foot.innerHTML = '<div class="sum-row"><span>جمع کالاها (' + fa(cartCount()) + ')</span><span>' + toman(t) + '</span></div>' +
    (free ? '<div class="sum-row" style="color:var(--ok)"><span>ارسال</span><span>رایگان</span></div>'
          : '<div class="sum-row"><span>ارسال (تقریبی)</span><span>' + toman(45000) + '</span></div>') +
    '<div class="sum-row tot"><span>مبلغ قابل پرداخت</span><span>' + toman(t + (free ? 0 : 45000)) + '</span></div>' +
    '<div style="display:flex;gap:10px;margin-top:14px"><a class="btn btn-p" style="flex:1" href="#/checkout" data-act="cart-close">ادامهٔ خرید</a><a class="btn btn-o" href="#/cart" data-act="cart-close">سبد کامل</a></div>';
}
export function renderCmpBar() {
  const bar = $('#cmpbar'); if (!bar) return;
  if (!state.cmp.length) { bar.classList.remove('show'); return; }
  $('#cmpThumbs').innerHTML = state.cmp.slice(0, 4).map(id => {
    const p = window.__byId(id); return p ? '<span class="th">' + art(p) + '</span>' : '';
  }).join('');
  bar.classList.add('show');
}
export function openDrawer(sel) { document.querySelector(sel).classList.add('open'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; }
export function closeDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
  $('#scrim').classList.remove('on'); document.body.style.overflow = '';
}