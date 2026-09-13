import { CONFIG } from '../config.js';
import { I, IF } from '../icons.js';
import { fa, esc } from '../utils.js';
import { state } from '../store.js';
import { products, categories, catOf } from '../catalog.js';
import { cardP, crumb, skelCards, emptySt, pager } from '../components.js';

let listToken = 0;
export function listingView(params) {
  const tk = ++listToken;
  const cat = params.get('cat') || '', q = params.get('q') || '', sort = params.get('sort') || 'pop';
  const off = params.get('off') === '1', avail = params.get('avail') === '1';
  const brands = (params.get('b') || '').split(',').filter(Boolean);
  const page = parseInt(params.get('page')) || 1;
  let maxP = 0; products.forEach(p => { if (p.price > maxP) maxP = p.price; });
  const mn = parseInt(params.get('mn')) || 0, mx = parseInt(params.get('mx')) || maxP;

  let list = products.filter(p => (!cat || p.cat === cat) && (!q || (p.name + p.brand + (p.desc || '')).indexOf(q) > -1) && (!off || p.old) && (!avail || p.stock > 0) && (!brands.length || brands.indexOf(p.brand) > -1) && p.price >= mn && p.price <= mx);
  const sorted = { new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0), cheap: (a, b) => a.price - b.price, exp: (a, b) => b.price - a.price, pop: (a, b) => b.rc - a.rc, rate: (a, b) => b.rating - a.rating }[sort] || ((a, b) => (b.feat || 0) - (a.feat || 0) || b.rating - a.rating);
  list = list.slice().sort(sorted);
  const per = 9, total = Math.ceil(list.length / per) || 1, cur = Math.min(page, total), slice = list.slice((cur - 1) * per, cur * per);
  const view = state.view;
  const entries = []; params.forEach((v, k) => { if (k !== 'page') entries.push(k + '=' + encodeURIComponent(v)); });
  const baseQs = entries.join('&');
  const base = '#/shop?' + (baseQs ? baseQs + '&' : '');
  const catObj = cat ? catOf(cat) : null;

  function filtersHtml() {
    return '<div class="fgroup"><button type="button" data-act="fg">دسته‌بندی ' + I('chevD', 16) + '</button><div class="fbox">' +
      '<a class="check" href="#/shop"><span class="cbx">' + (!cat ? IF('check', 12) : '') + '</span> همهٔ محصولات</a>' +
      categories.map(c => '<a class="check" href="#/shop?cat=' + c.id + '"><span class="cbx">' + (cat === c.id ? IF('check', 12) : '') + '</span> ' + c.name + ' <span class="fcnt" style="margin-inline-start:auto">' + fa(products.filter(p => p.cat === c.id).length) + '</span></a>').join('') +
      '</div></div>' +
      '<div class="fgroup"><button type="button" data-act="fg">قیمت ' + I('chevD', 16) + '</button><div class="fbox">' +
      '<div class="range2"><div class="rt"></div><div class="rf" id="rf"></div>' +
      '<input type="range" min="0" max="' + maxP + '" step="50000" value="' + mn + '" id="rgMin" aria-label="حداقل قیمت">' +
      '<input type="range" min="0" max="' + maxP + '" step="50000" value="' + mx + '" id="rgMax" aria-label="حداکثر قیمت"></div>' +
      '<div class="range-lb"><span id="lbMin">از ' + fa(mn) + '</span><span id="lbMax">تا ' + fa(mx) + ' تومان</span></div>' +
      '<button class="btn btn-o btn-sm" style="width:100%;margin-top:10px" data-act="apply-range">اعمال قیمت</button></div></div>' +
      '<div class="fgroup"><button type="button" data-act="fg">برند ' + I('chevD', 16) + '</button><div class="fbox">' +
      ['ویان‌تک', 'آریام', 'نوآوران', 'هیلدا', 'کارن', 'رُزا'].map(b => '<label class="check"><input type="checkbox" data-brand="' + b + '" ' + (brands.indexOf(b) > -1 ? 'checked' : '') + ' data-act-c="brand"><span class="cbx">' + IF('check', 12) + '</span> ' + b + '</label>').join('') +
      '</div></div>' +
      '<div class="fgroup"><button type="button" data-act="fg">وضعیت ' + I('chevD', 16) + '</button><div class="fbox">' +
      '<label class="check"><input type="checkbox" ' + (avail ? 'checked' : '') + ' data-act-c="avail"><span class="cbx">' + IF('check', 12) + '</span> فقط کالاهای موجود</label>' +
      '<label class="check"><input type="checkbox" ' + (off ? 'checked' : '') + ' data-act-c="off"><span class="cbx">' + IF('check', 12) + '</span> فقط تخفیف‌دار</label></div></div>' +
      '<button class="btn btn-g btn-sm" style="width:100%;margin-top:12px;color:var(--danger)" data-act="reset-filters">' + I('x', 14) + ' حذف فیلترها</button>';
  }

  document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:30px">' +
    crumb([{ t: 'خانه', h: '#/' }, { t: 'فروشگاه', h: '#/shop' }].concat(catObj ? [{ t: catObj.name }] : []).concat(q ? [{ t: 'جستجو: ' + q }] : [])) +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:26px;flex-wrap:wrap">' +
    '<h1 class="sec-title" style="font-size:clamp(24px,3vw,34px)">' + (catObj ? catObj.name : q ? ('نتایج «' + esc(q) + '»') : (off ? 'پیشنهادهای ویژه' : 'همهٔ محصولات')) + '</h1>' +
    (q ? '<a class="chip" href="#/shop">' + I('x', 13) + ' ' + esc(q) + '</a>' : '') + '</div>' +
    '<div class="lst"><aside id="lstFilters">' + filtersHtml() + '</aside><div>' +
    '<div class="toolbar"><button class="btn btn-o btn-sm" style="display:none" id="mFilterBtn" data-act="filter-open">' + I('sliders', 15) + ' فیلترها</button>' +
    '<span class="rc"><b>' + fa(list.length) + '</b> کالا</span><span class="sp"></span>' +
    '<div class="selw"><select id="sortSel" aria-label="مرتب‌سازی">' + [['pop', 'پیشنهادی'], ['new', 'جدیدترین'], ['cheap', 'ارزان‌ترین'], ['exp', 'گران‌ترین'], ['rate', 'محبوب‌ترین']].map(s => '<option value="' + s[0] + '" ' + (sort === s[0] ? 'selected' : '') + '>' + s[1] + '</option>').join('') + '</select></div>' +
    '<div class="vtog"><button data-act="view" data-v="g" class="' + (view === 'grid' ? 'on' : '') + '" aria-label="نمایش شبکه‌ای">' + I('grid', 17) + '</button><button data-act="view" data-v="l" class="' + (view === 'list' ? 'on' : '') + '" aria-label="نمایش فهرستی">' + I('list', 17) + '</button></div></div>' +
    '<div class="pgrid" id="lstGrid">' + skelCards(6) + '</div><div id="lstAfter"></div>' +
    '</div></div></div>';

  if (window.innerWidth <= 1080) { const mf = document.getElementById('mFilterBtn'); if (mf) mf.style.display = 'inline-flex'; }
  const sortSel = document.getElementById('sortSel');
  sortSel.onchange = () => { const p = new URLSearchParams(baseQs); p.set('sort', sortSel.value); p.delete('page'); location.hash = '#/shop?' + p.toString(); };

  function setupRange(root) {
    const rgMin = root.querySelector('#rgMin'), rgMax = root.querySelector('#rgMax'); if (!rgMin) return;
    function upd() { const a = +rgMin.value, b = +rgMax.value, lo = Math.min(a, b), hi = Math.max(a, b); const rf = root.querySelector('#rf'); if (rf) { rf.style.insetInlineStart = (lo / maxP * 100) + '%'; rf.style.width = ((hi - lo) / maxP * 100) + '%'; } const l1 = root.querySelector('#lbMin'), l2 = root.querySelector('#lbMax'); if (l1) l1.textContent = 'از ' + fa(lo); if (l2) l2.textContent = 'تا ' + fa(hi) + ' تومان'; }
    rgMin.oninput = upd; rgMax.oninput = upd; upd();
    const apply = root.querySelector('[data-act="apply-range"]');
    if (apply) apply.onclick = () => { const a = +rgMin.value, b = +rgMax.value, p = new URLSearchParams(baseQs); p.set('mn', Math.min(a, b)); p.set('mx', Math.max(a, b)); p.delete('page'); location.hash = '#/shop?' + p.toString(); };
  }
  function setupChecks(root) {
    Array.prototype.slice.call(root.querySelectorAll('[data-act-c]')).forEach(cb => {
      cb.onchange = () => {
        const bs = Array.prototype.slice.call(root.querySelectorAll('[data-brand]:checked')).map(x => x.getAttribute('data-brand'));
        const p = new URLSearchParams(baseQs);
        if (bs.length) p.set('b', bs.join(',')); else p.delete('b');
        const av = root.querySelector('[data-act-c="avail"]'), of = root.querySelector('[data-act-c="off"]');
        if (av && av.checked) p.set('avail', '1'); else p.delete('avail');
        if (of && of.checked) p.set('off', '1'); else p.delete('off');
        p.delete('page'); location.hash = '#/shop?' + p.toString();
      };
    });
  }
  setupRange(document.getElementById('lstFilters'));
  setupChecks(document.getElementById('lstFilters'));

  function fill() {
    if (tk !== listToken) return;
    const grid = document.getElementById('lstGrid'); if (!grid) return;
    if (!slice.length) { grid.outerHTML = emptySt('filter', 'محصولی با این مشخصات پیدا نشد', 'فیلترها را تغییر دهید.', '#/shop', 'حذف فیلترها'); const la = document.getElementById('lstAfter'); if (la) la.innerHTML = ''; return; }
    grid.innerHTML = slice.map(p => cardP(p, view === 'list' ? 'l' : 'g', catOf(p.cat).name)).join('');
    grid.style.cssText = view === 'list' ? 'display:flex;flex-direction:column' : '';
    const la = document.getElementById('lstAfter'); if (la) la.innerHTML = pager(cur, total, base);
    // bindReveals در route صدا زده می‌شود
  }
  setTimeout(fill, 430);
  const fb = document.getElementById('filterBody');
  fb.innerHTML = filtersHtml(); setupRange(fb); setupChecks(fb);
}