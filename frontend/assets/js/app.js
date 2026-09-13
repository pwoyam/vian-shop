import { CONFIG, THEMES } from './config.js';
import { I, IF } from './icons.js';
import { $, $$, esc, fa, escRe, applyTheme, bindReveals, hideSplash, showFatal, toast, confirmBox, toTop, closeModal, openModal } from './utils.js';
import { state, save, addToCart, setQty, removeFromCart, toggleWish, toggleCmp, syncBadges, cartTotal, notifAdd } from './store.js';
import { api } from './api.js';
import { setCatalog, byId, catOf, products, categories } from './catalog.js';
import { OTP, loginUser } from './session.js';
import { renderCartDrawer, renderCmpBar, openDrawer, closeDrawers, emptySt } from './components.js';
import { art } from './art.js';

import { homeView } from './views/home.js';
import { listingView } from './views/listing.js';
import { productView } from './views/product.js';
import { cartView } from './views/cart.js';
import { checkoutView, placeOrder } from './views/checkout.js';
import { authView } from './views/auth.js';
import { accountView } from './views/account.js';
import { aboutView, contactView, faqView, docView, notFound } from './views/static.js';
import { TERMS, PRIVACY } from './data.js';

const SALE_END = Date.now() + (26 * 3600 + 41 * 60) * 1000;

/* ---------------- روتر ---------------- */
function parseHash() {
  const h = location.hash.slice(1) || '/';
  const idx = h.indexOf('?');
  return { path: idx > -1 ? h.slice(0, idx) : (h || '/'), params: new URLSearchParams(idx > -1 ? h.slice(idx + 1) : '') };
}
async function route() {
  const { path, params } = parseHash();
  const v = $('#view');
  closeDrawers(); closeSearch(); closeModal(); toTop();
  v.classList.remove('view-anim'); void v.offsetWidth; v.classList.add('view-anim');
  const routes = [
    [/^\/$/, () => homeView()],
    [/^\/shop$/, () => listingView(params)],
    [/^\/product\/([\w-]+)$/, m => productView(m[1])],
    [/^\/cart$/, () => cartView()],
    [/^\/checkout$/, () => checkoutView(params)],
    [/^\/wishlist$/, () => wishView()],
    [/^\/compare$/, () => compareView()],
    [/^\/auth\/(\w+)$/, m => authView(m[1])],
    [/^\/account$/, () => accountView(params)],
    [/^\/about$/, () => aboutView()],
    [/^\/contact$/, () => contactView()],
    [/^\/faq$/, () => faqView()],
    [/^\/terms$/, () => docView('شرایط و قوانین', TERMS)],
    [/^\/privacy$/, () => docView('حریم خصوصی', PRIVACY)]
  ];
  let matched = false;
  for (const [re, fn] of routes) { const m = path.match(re); if (m) { await fn(m); matched = true; break; } }
  if (!matched) v.innerHTML = notFound();
  $$('.nav>a').forEach(a => { const dm = a.getAttribute('data-match'); a.classList.toggle('on', !!dm && new RegExp(dm).test(path)); });
  bindReveals();
}

/* wishlist / compare در اپ تا وابستگی حلقه‌ای نشود */
function wishView() {
  const ps = state.wish.map(byId).filter(Boolean);
  $('#view').innerHTML = '<div class="wrap" style="padding-top:34px">' +
    '<div class="sec-head"><div><div class="kicker">لیست شما</div><h2 class="sec-title">علاقه‌مندی‌ها</h2></div></div>' +
    (ps.length ? '<div class="pgrid">' + ps.map(p => cardWrapper(p)).join('') + '</div>'
      : emptySt('heart', 'هنوز چیزی اینجا نیست', 'محصولاتی که دوست دارید را با آیکون قلب ذخیره کنید.', '#/shop', 'شروع خرید')) + '</div>';
}
function compareView() {
  const ps = state.cmp.map(byId).filter(Boolean);
  if (!ps.length) { $('#view').innerHTML = '<div class="wrap" style="padding-top:34px">' + emptySt('swap', 'لیست مقایسه خالی است', 'تا ۴ کالا را برای مقایسه انتخاب کنید.', '#/shop', 'مشاهده محصولات') + '</div>'; return; }
  const specKeys = []; const seen = {};
  ps.forEach(p => (p.specs || []).forEach(s => { if (!seen[s[0]]) { seen[s[0]] = 1; specKeys.push(s[0]); } }));
  $('#view').innerHTML = '<div class="wrap" style="padding-top:34px">' +
    '<div class="sec-head"><div><div class="kicker">ابزار خرید</div><h2 class="sec-title">مقایسهٔ محصولات</h2></div></div>' +
    '<div class="cmp-wrap"><table class="cmp-t">' +
    '<tr><th>محصول</th>' + ps.map(p => '<td><div class="cimg">' + art(p) + '</div><b style="font-size:13.5px;line-height:1.7">' + p.name + '</b><br><button class="btn btn-g btn-sm" style="color:var(--danger)" data-act="cmp" data-id="' + p.id + '">' + I('x', 13) + ' حذف</button></td>').join('') + '</tr>' +
    '<tr><th>قیمت</th>' + ps.map(p => '<td><span class="price" style="font-size:15px">' + fa(p.price) + ' تومان</span></td>').join('') + '</tr>' +
    '<tr><th>موجودی</th>' + ps.map(p => '<td>' + (p.stock === 0 ? '<span class="bdg bdg-mut">ناموجود</span>' : '<span class="bdg bdg-ok">موجود</span>') + '</td>').join('') + '</tr>' +
    '<tr><th>برند</th>' + ps.map(p => '<td>' + p.brand + '</td>').join('') + '</tr>' +
    specKeys.map(k => '<tr><th>' + k + '</th>' + ps.map(p => { const f = (p.specs || []).find(s => s[0] === k); return '<td>' + (f ? f[1] : '—') + '</td>'; }).join('') + '</tr>').join('') +
    '</table></div></div>';
}
import { cardP } from './components.js';
function cardWrapper(p) { return cardP(p, 'g', catOf(p.cat).name); }

/* ---------------- جستجو ---------------- */
let searchTimer;
function openSearch() { $('#sov').classList.add('open'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; setTimeout(() => { const el = $('#sovInput'); if (el) el.focus(); }, 120); renderSuggestions(''); }
function closeSearch() { $('#sov').classList.remove('open'); if (!$$('.drawer.open').length) { $('#scrim').classList.remove('on'); document.body.style.overflow = ''; } }
function renderSuggestions(q) {
  const box = $('#sovSug'); q = (q || '').trim();
  if (!q) {
    const rc = state.recent;
    box.innerHTML = rc.length
      ? '<h6>جستجوهای اخیر <button data-act="clear-recent">پاک‌کردن</button></h6><div style="display:flex;gap:8px;flex-wrap:wrap">' + rc.map(r => '<button class="chip" data-q="' + esc(r) + '" data-act="recent">' + I('clock', 14) + ' ' + esc(r) + '</button>').join('') + '</div>'
      : '<h6>جستجوهای پرطرفدار</h6><div style="display:flex;gap:8px;flex-wrap:wrap">' + ['هدفون', 'کتانی', 'ماگ', 'عطر', 'ساعت'].map(r => '<button class="chip" data-q="' + r + '" data-act="recent">' + r + '</button>').join('') + '</div>';
    return;
  }
  const cats = categories.filter(c => c.name.indexOf(q) > -1);
  const ps = products.filter(p => p.name.indexOf(q) > -1 || p.brand.indexOf(q) > -1 || (p.desc && p.desc.indexOf(q) > -1)).slice(0, 6);
  if (!ps.length && !cats.length) { box.innerHTML = emptySt('search', 'نتیجه‌ای پیدا نشد', 'املای دیگری را امتحان کنید.'); return; }
  let html = '';
  if (cats.length) html += '<h6>دسته‌بندی</h6>' + cats.map(c => '<a class="sitem" href="#/shop?cat=' + c.id + '" data-act="search-close"><span class="si">' + I(c.icon, 20) + '</span><span><b>' + c.name + '</b><span>دسته‌بندی</span></span></a>').join('');
  if (ps.length) html += '<h6>محصولات</h6>' + ps.map(p => { let nm = p.name; try { nm = nm.replace(new RegExp(escRe(q), 'g'), m => '<mark>' + m + '</mark>'); } catch (e) {} return '<a class="sitem" href="#/product/' + p.id + '" data-act="search-close"><span class="st">' + art(p) + '</span><span><b>' + nm + '</b><span>' + p.brand + '</span></span><span class="sp">' + fa(p.price) + '</span></a>'; }).join('');
  box.innerHTML = html;
}

/* ---------------- هدر و فوتر ---------------- */
function buildChrome() {
  $('#logoName').textContent = CONFIG.brand.name; $('#logoTag').textContent = CONFIG.brand.tagline; $('#logoMark').textContent = CONFIG.brand.first;
  $('#fLogoName').textContent = CONFIG.brand.name; $('#fLogoMark').textContent = CONFIG.brand.first;
  $('#fAbout').textContent = CONFIG.brand.desc; $('#fCopy').textContent = CONFIG.brand.copy;
  $('#tbPhone').innerHTML = I('phone', 13) + ' ' + CONFIG.contact.phone;
  $('#tbSale').innerHTML = I('zap', 13) + ' ' + CONFIG.announcements[0];
  $('#mainNav').innerHTML = CONFIG.nav.map(n => {
    if (n.dd) return '<button data-dd aria-haspopup="true">' + n.label + ' ' + I('chevD', 14) + '</button><div class="dd">' +
      categories.map(c => '<a href="#/shop?cat=' + c.id + '"><span class="di">' + I(c.icon, 20) + '</span><span><b>' + c.name + '</b><span>' + fa(c.count) + ' کالا</span></span></a>').join('') + '</div>';
    return '<a href="' + n.href + '" data-match="' + (n.href === '#/' ? '^/$' : n.href.split('?')[0].slice(1)) + '">' + n.label + '</a>';
  }).join('');
  const ddBtn = $('#mainNav [data-dd]');
  if (ddBtn) ddBtn.onclick = ev => { ev.stopPropagation(); const dd = ddBtn.parentElement.querySelector('.dd'); if (dd) dd.classList.toggle('open'); };
  $('#searchBtn').innerHTML = I('search', 21); $('#userBtn').innerHTML = I('user', 21);
  $('#wishBtn').insertAdjacentHTML('afterbegin', I('heart', 21));
  $('#cmpBtn').insertAdjacentHTML('afterbegin', I('swap', 21));
  $('#cartBtn').insertAdjacentHTML('afterbegin', I('bag', 21));
  $('#menuBtn').innerHTML = I('menu', 22); $('#menuBtn').style.display = window.innerWidth <= 920 ? 'grid' : 'none';
  $('#sovIc').innerHTML = I('search', 24); $('#sovClose').innerHTML = I('x', 22);
  $('#cartDrawer').querySelector('.dw-head .ibtn').innerHTML = I('x', 20);
  $('#menuDrawer').querySelector('.dw-head .ibtn').innerHTML = I('x', 20);
  $('#filterDrawer').querySelector('.dw-head .ibtn').innerHTML = I('x', 20);
  $('#cdTitle').innerHTML = I('bag', 19) + ' سبد خرید'; $('#mmTitle').innerHTML = I('menu', 19) + ' منو';
  $('#fQuick').innerHTML = [['خانه', '#/'], ['فروشگاه', '#/shop'], ['پیشنهادها', '#/shop?off=1'], ['مقایسه', '#/compare'], ['درباره ما', '#/about']].map(l => '<li><a href="' + l[1] + '">' + I('chevL', 13) + ' ' + l[0] + '</a></li>').join('');
  $('#fSrv').innerHTML = [['پیگیری سفارش', '#/account?tab=orders'], ['سوالات متداول', '#/faq'], ['شرایط و قوانین', '#/terms'], ['حریم خصوصی', '#/privacy'], ['تماس با ما', '#/contact']].map(l => '<li><a href="' + l[1] + '">' + I('chevL', 13) + ' ' + l[0] + '</a></li>').join('');
  $('#fContact').innerHTML = '<li>' + I('pin', 16) + ' ' + CONFIG.contact.addr + '</li><li>' + I('phone', 16) + ' <span class="ltr">' + CONFIG.contact.phone + '</span></li><li>' + I('mail', 16) + ' <span class="ltr">' + CONFIG.contact.email + '</span></li><li>' + I('clock', 16) + ' ' + CONFIG.contact.hours + '</li>';
  $('#fSocials').innerHTML = CONFIG.socials.map(s => '<a href="#" aria-label="' + s.label + '">' + I(s.icon, 18) + '</a>').join('');
  $('#fPays').innerHTML = CONFIG.payBadges.map(p => '<span>' + p + '</span>').join('');
  $('#tfab').innerHTML = I('droplet', 23);
  $('#tp1').innerHTML = I('droplet', 15) + ' رنگ سازمانی'; $('#tp2').innerHTML = I('sun', 15) + ' حالت نمایش';
  $('#tp3').innerHTML = I('grid', 15) + ' گوشه‌ها'; $('#tp4').innerHTML = I('edit', 15) + ' رنگ دلخواه برند';
  $('#tpNote').textContent = 'قالب داده‌محور است: برند، رنگ و محصولات از config.js و data.js تغییر می‌کنند.';
  $('#tSwatches').innerHTML = Object.keys(THEMES).map(k => '<button class="tsw" data-preset="' + k + '" style="background:' + THEMES[k].light + '" aria-label="' + THEMES[k].name + '">' + I('check', 16) + '</button>').join('');
  $$('.tsw').forEach(b => b.onclick = () => { state.theme.preset = b.getAttribute('data-preset'); state.theme.custom = null; applyTheme(); });
  $('#tMode').innerHTML = '<button data-mode="light">' + I('sun', 15) + ' روشن</button><button data-mode="dark">' + I('moon', 15) + ' تیره</button>';
  $$('#tMode button').forEach(b => b.onclick = () => { state.theme.mode = b.getAttribute('data-mode'); applyTheme(); });
  $('#tRadius').innerHTML = '<button data-r="sharp">تیز</button><button data-r="soft">ملایم</button><button data-r="round">گرد</button>';
  $$('#tRadius button').forEach(b => b.onclick = () => { state.theme.radius = b.getAttribute('data-r'); applyTheme(); });
  $('#cmpGo').innerHTML = I('swap', 15) + ' مقایسه کن'; $('#cmpX').innerHTML = I('x', 18);
}

/* منوی موبایل */
function renderMenu() {
  const top = state.user
    ? '<div class="ava">' + esc(state.user.name[0]) + '</div><div><b style="font-size:14px">' + esc(state.user.name) + '</b><br><span style="font-size:12px;color:var(--muted)">' + esc(state.user.email) + '</span></div>'
    : '<div class="ava">ک</div><div><b style="font-size:14px">مهمان عزیز</b><br><a href="#/auth/login" data-act="menu-close" style="font-size:12.5px;color:var(--accent);font-weight:800">ورود / ثبت‌نام</a></div>';
  $('#menuBody').innerHTML = '<div style="display:flex;gap:12px;align-items:center;padding:6px 2px 16px;border-bottom:1px dashed var(--line);margin-bottom:8px">' + top + '</div>' +
    CONFIG.nav.filter(n => !n.dd).map(n => '<a class="mm-link" href="' + n.href + '" data-act="menu-close">' + n.label + '</a>').join('') +
    '<div style="font-size:12px;font-weight:800;color:var(--muted);margin-top:18px">دسته‌بندی‌ها</div><div class="mm-cat">' +
    categories.map(c => '<a class="chip" href="#/shop?cat=' + c.id + '" data-act="menu-close">' + I(c.icon, 15) + ' ' + c.name + '</a>').join('') + '</div>';
}

/* ---------------- شمارش‌معکوس ---------------- */
function startCountdown() {
  setInterval(() => {
    const ms = Math.max(0, SALE_END - Date.now());
    const h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4), s = Math.floor(ms % 6e4 / 1e3);
    const pad = n => { const f = fa(n); return f.length < 2 ? '۰' + f : f; };
    $$('[data-cd]').forEach(el => el.innerHTML = '<b>' + pad(h) + '</b><i>:</i><b>' + pad(m) + '</b><i>:</i><b>' + pad(s) + '</b>');
  }, 1000);
}

/* ---------------- رویدادهای سراسری ---------------- */
function bindGlobalEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    switch (act) {
      case 'fg': el.parentElement.classList.toggle('closed'); break;
      case 'add-cart': { const p = byId(id); if (p.stock === 0) { toast('کالای ' + p.name + ' ناموجود است', 'warn'); } else if (addToCart(id).ok) { toast('به سبد خرید اضافه شد'); renderCartDrawer(); openDrawer('#cartDrawer'); } else toast('مشکل در افزودن', 'err'); break; }
      case 'add-cart-pdp': { const inp = document.querySelector('[data-ctx="pdp"] input'); const qty = inp ? +inp.value : 1; const sw = $('.sw.on'); const sz = $('[data-s].on'); const r = addToCart(id, qty, sw ? sw.getAttribute('data-c') : '', sz ? sz.getAttribute('data-s') : ''); if (r.ok) { toast('به سبد خرید اضافه شد'); renderCartDrawer(); openDrawer('#cartDrawer'); } else toast(r.reason === 'max' ? 'بیش از موجودی انبار' : 'ناموجود', 'warn'); break; }
      case 'wish': { const added = toggleWish(id); toast(added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد', added ? 'ok' : 'warn'); if (location.hash.indexOf('#/wishlist') === 0) route(); break; }
      case 'cmp': { const r = toggleCmp(id); if (r.full) toast('حداکثر ۴ کالا قابل مقایسه است', 'warn'); else { renderCmpBar(); if (location.hash.indexOf('#/compare') === 0) route(); } break; }
      case 'cart-open': renderCartDrawer(); openDrawer('#cartDrawer'); break;
      case 'cart-close': closeDrawers(); break;
      case 'menu-open': renderMenu(); openDrawer('#menuDrawer'); break;
      case 'menu-close': closeDrawers(); break;
      case 'filter-open': openDrawer('#filterDrawer'); break;
      case 'filter-close': closeDrawers(); break;
      case 'search-open': openSearch(); break;
      case 'search-close': closeSearch(); break;
      case 'modal-close': closeModal(); break;
      case 'theme-open': $('#tpanel').classList.toggle('open'); break;
      case 'theme-custom': state.theme.custom = $('#tCustom').value; applyTheme(); toast('رنگ سازمانی اعمال شد'); break;
      case 'theme-reset': state.theme.custom = null; applyTheme(); toast('به پوستهٔ پیش‌فرض بازگشت', 'warn'); break;
      case 'view': state.view = el.getAttribute('data-v') === 'l' ? 'list' : 'grid'; save(); route(); break;
      case 'reset-filters': location.hash = '#/shop'; break;
      case 'cart-rm': removeFromCart(el.getAttribute('data-key')); renderCartDrawer(); toast('از سبد حذف شد', 'warn'); if (location.hash === '#/cart') route(); break;
      case 'q-inc': { const st = el.closest('.stepper'); if (!st) break; const inp = st.querySelector('input'); const d = el.getAttribute('data-d') ? 1 : -1; const key = st.getAttribute('data-ctx'); if (key === 'pdp') { let v = +inp.value + d; v = Math.max(+inp.min, Math.min(+inp.max, v)); inp.value = v; } else { let v = +inp.value + d; setQty(key, v); renderCartDrawer(); if (location.hash === '#/cart') route(); } break; }
      case 'tab': { $$('.tab-b').forEach(b => b.classList.remove('on')); el.classList.add('on'); ['desc', 'specs', 'rev'].forEach(t => { const el2 = $('#tab' + t[0].toUpperCase() + t.slice(1)); if (el2) el2.style.display = t === el.getAttribute('data-t') ? 'block' : 'none'; }); break; }
      case 'addr-new': window.__addrModal && window.__addrModal(); break;
      case 'addr-edit': window.__addrModal && window.__addrModal(state.addrs.find(a => a.id === el.getAttribute('data-id'))); break;
      case 'addr-del': { const did = el.getAttribute('data-id'); confirmBox('حذف آدرس', 'این آدرس برای همیشه حذف می‌شود.', async () => { await api.removeAddress(did); toast('آدرس حذف شد', 'warn'); route(); }); break; }
      case 'addr-def': { const fid = el.getAttribute('data-id'); state.addrs.forEach(a => a.def = a.id === fid); save(); route(); break; }
      case 'notif-read': api.markNotificationsRead().then(() => route()); break;
      case 'logout': confirmBox('خروج از حساب', 'از حساب کاربری خارج می‌شوید.', () => { state.user = null; save(); toast('از حساب خارج شدید', 'warn'); location.hash = '#/'; }); break;
      case 'demo-login': loginUser('نگین کریمی', 'demo@vian.shop'); break;
      case 'otp-verify': { const code = $$('#otpRow input').map(i => i.value).join(''); if (code === OTP.code) { toast('کد تأیید درست است'); if (OTP.mode === 'forgot') location.hash = '#/auth/login'; else loginUser(OTP.name, OTP.email); } else toast('کد واردشده صحیح نیست', 'err'); break; }
      case 'otp-resend': { OTP.code = String(Math.floor(10000 + Math.random() * 89999)); const dc = $('.demo-code'); if (dc) dc.innerHTML = I('info', 14) + ' نسخهٔ دمو — کد تأیید: <b class="ltr">' + OTP.code + '</b>'; OTP.sec = 90; window.__startOtpTimer && window.__startOtpTimer(); toast('کد جدید ارسال شد'); break; }
      case 'place-order': placeOrder(); break;
      case 'co-back': window.__coBack && window.__coBack(); break;
      case 'cmp-clear': state.cmp = []; save(); syncBadges(); renderCmpBar(); route(); break;
      case 'recent': { const qq = el.getAttribute('data-q'); $('#sovInput').value = qq; renderSuggestions(qq); break; }
      case 'clear-recent': state.recent = []; save(); renderSuggestions(''); break;
    }
  }, true);

  document.addEventListener('click', e => {
    if (!e.target.closest('#tpanel,.tfab')) $('#tpanel').classList.remove('open');
    if (!e.target.closest('.dd,[data-dd]')) $$('.dd').forEach(d => d.classList.remove('open'));
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'sovInput') { clearTimeout(searchTimer); searchTimer = setTimeout(() => renderSuggestions(e.target.value), 180); }
    const spb = e.target.closest && e.target.closest('#starPick button');
    if (spb) { const v = +spb.getAttribute('data-star'); $$('#starPick button').forEach((x, i) => x.classList.toggle('on', i < v)); const f = $('#starPick').closest('form'); if (f) f.querySelector('[name=rating]').value = v; }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDrawers(); closeSearch(); closeModal(); $('#tpanel').classList.remove('open'); }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  document.addEventListener('submit', onSubmit);
  window.addEventListener('scroll', () => { const h = $('#hdr'); if (h) h.classList.toggle('sc', window.scrollY > 8); }, { passive: true });
  window.addEventListener('resize', () => { const mb = $('#menuBtn'); if (mb) mb.style.display = window.innerWidth <= 920 ? 'grid' : 'none'; });
  window.addEventListener('hashchange', () => route());
}

/* ---------------- فرم‌ها ---------------- */
async function onSubmit(e) {
  const f = e.target; if (!f.getAttribute('data-form')) return; e.preventDefault();
  const fd = new FormData(f); let valid = true;
  Array.prototype.slice.call(f.querySelectorAll('[required]')).forEach(inp => {
    const ok = inp.type === 'checkbox' ? inp.checked : String(inp.value).trim().length > 0;
    let extra = true;
    if (inp.name === 'email' && inp.value) extra = inp.value.indexOf('@') > -1;
    if (inp.name === 'phone' && inp.value) { const dv = String(inp.value).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); extra = /^09\d{9}$/.test(dv); }
    const fld = inp.closest('.field'); if (fld) fld.classList.toggle('err', !(ok && extra));
    if (!(ok && extra)) valid = false;
  });
  if (!valid) { toast('لطفاً خطاهای فرم را برطرف کنید', 'err'); return; }
  const kind = f.getAttribute('data-form');
  if (kind === 'newsletter') { toast('عضویت شما در خبرنامه ثبت شد'); f.reset(); }
  else if (kind === 'login') { const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> در حال ورود...'; try { await api.login(fd.get('email'), fd.get('pass')); loginUser(state.user.name, state.user.email); } catch (err) { toast('ورود ناموفق بود', 'err'); btn.disabled = false; btn.textContent = 'ورود به حساب'; } }
  else if (kind === 'register') { OTP.email = fd.get('email'); OTP.name = fd.get('name'); OTP.pass = fd.get('pass'); OTP.mode = 'reg'; location.hash = '#/auth/otp'; }
  else if (kind === 'forgot') { OTP.email = fd.get('email'); OTP.mode = 'forgot'; location.hash = '#/auth/otp'; }
  else if (kind === 'profile') { await api.updateProfile({ name: fd.get('name'), phone: fd.get('phone') }); toast('پروفایل به‌روزرسانی شد'); route(); }
  else if (kind === 'pass') { toast('رمز عبور تغییر کرد'); f.reset(); }
  else if (kind === 'address') { const a = { title: fd.get('title'), name: fd.get('name'), phone: fd.get('phone'), city: fd.get('city'), postal: fd.get('postal'), address: fd.get('address') }; await api.addAddress(a); closeModal(); toast('آدرس ذخیره شد'); route(); }
  else if (kind === 'contact') { toast('پیام شما ارسال شد'); f.reset(); }
  else if (kind === 'review') { const pid = f.getAttribute('data-pid'); const r = +f.querySelector('[name=rating]').value; if (!r) { toast('لطفاً امتیاز ستاره‌ای بدهید', 'err'); return; } try { await api.addReview(pid, r, fd.get('txt')); const nm = state.user ? state.user.name : (fd.get('name') || 'کاربر'); const rl = $('#revList'); if (rl) rl.insertAdjacentHTML('afterbegin', revItemHtml({ n: nm, d: 'لحظاتی پیش', r: r, t: fd.get('txt'), v: !!state.user })); toast('دیدگاه شما ثبت شد'); f.reset(); $$('#starPick button').forEach(b => b.classList.remove('on')); } catch (err) { toast('ثبت دیدگاه ناموفق بود', 'err'); } }
  else if (kind === 'co1' || kind === 'co2') { window.__coNext && window.__coNext(kind, fd); }
}
function revItemHtml(r) {
  return '<div class="rev-item"><div class="rh"><span class="ava">' + esc(r.n[0]) + '</span><div><b style="font-size:13.5px">' + esc(r.n) + (r.v ? ' <span class="bdg bdg-ok">خرید تأییدشده</span>' : '') + '</b><div class="rd">' + r.d + '</div></div><span style="margin-inline-start:auto;color:var(--warn)">★ ' + fa(r.r) + '</span></div><p>' + esc(r.t) + '</p></div>';
}

/* ---------------- راه‌اندازی ---------------- */
async function loadCatalog() {
  if (api.mode === 'demo') { window.__byId = byId; return; }
  try {
    const [prods, cats] = await Promise.all([api.getProducts({ per: 200 }), api.getCategories()]);
    setCatalog(prods.items, cats);
  } catch (e) { console.warn('API در دسترس نیست؛ از دادهٔ دمو استفاده می‌شود.', e); }
}
async function init() {
  try {
    await loadCatalog();
    buildChrome(); applyTheme(); syncBadges(); renderCmpBar();
    startCountdown(); bindGlobalEvents();
    await route();
    hideSplash();
    setTimeout(hideSplash, 2500);
  } catch (err) { showFatal(err.message, err.stack || ''); }
}
init();