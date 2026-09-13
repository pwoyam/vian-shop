import { I, IF } from '../icons.js';
import { art } from '../art.js';
import { fa, faD, toman, pctOff, esc } from '../utils.js';
import { state } from '../store.js';
import { api } from '../api.js';
import { byId, catOf, products } from '../catalog.js';
import { stars, priceBlock, crumb, stepper, secHead, cardP } from '../components.js';

function revItem(r) {
  return '<div class="rev-item"><div class="rh"><span class="ava">' + esc(r.n[0]) + '</span><div><b style="font-size:13.5px">' + esc(r.n) + (r.v ? ' <span class="bdg bdg-ok" style="margin-inline-start:6px">' + I('check', 10) + ' خرید تأییدشده</span>' : '') + '</b><div class="rd">' + r.d + '</div></div><span style="margin-inline-start:auto;color:var(--warn)">★ ' + fa(r.r) + '</span></div><p>' + esc(r.t) + '</p></div>';
}

export async function productView(id) {
  const p = byId(id);
  if (!p) { document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:40px">محصول پیدا نشد.</div>'; return; }
  const cat = catOf(p.cat);
  let reviews = []; try { reviews = await api.getReviews(id); } catch (e) { reviews = []; }
  const related = products.filter(x => x.cat === p.cat && x.id !== id).slice(0, 4);
  const stockState = p.stock === 0 ? ['ناموجود — به‌زودی شارژ می‌شود', 'var(--danger)'] : p.stock <= 5 ? [('فقط ' + fa(p.stock) + ' عدد در انبار مانده'), 'var(--warn)'] : ['موجود در انبار — ارسال از فردا', 'var(--ok)'];
  const dist = [62, 24, 9, 3, 2];
  const colors = [['مشکی', '#2b2d27'], ['طوسی', '#9aa0a6'], ['رنگ اختصاصی', 'hsl(' + p.hue + ',55%,45%)']];

  document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:26px">' +
    crumb([{ t: 'خانه', h: '#/' }, { t: 'فروشگاه', h: '#/shop' }, { t: cat.name, h: '#/shop?cat=' + cat.id }, { t: p.name }]) +
    '<div class="pd"><div class="rv on">' +
    '<div class="gal-main" id="galMain">' + art(p, 0) + '</div>' +
    '<div class="gal-th">' + [0, 1, 2, 3].map(i => '<button class="' + (i === 0 ? 'on' : '') + '" data-gal="' + i + '" aria-label="تصویر ' + fa(i + 1) + '">' + art(p, i) + '</button>').join('') + '</div></div>' +
    '<div class="pd-info rv on" style="transition-delay:80ms">' +
    '<div class="pcat-row"><a href="#/shop?cat=' + cat.id + '" class="bdg bdg-soft">' + cat.name + '</a><span>برند: <a href="#/shop?b=' + encodeURIComponent(p.brand) + '" style="color:var(--accent);font-weight:800">' + p.brand + '</a></span></div>' +
    '<h1>' + p.name + '</h1>' +
    '<div class="pd-rate"><span class="stars">' + stars(p.rating, 16) + '</span><span>' + faD(p.rating) + ' از ۵ (' + fa(p.rc) + ' دیدگاه)</span></div>' +
    priceBlock(p, true) +
    '<div class="opt-row"><span class="lbl">رنگ:</span>' + colors.map((c, i) => '<button class="sw ' + (i === 0 ? 'on' : '') + '" style="background:' + c[1] + '" data-c="' + c[0] + '" aria-label="' + c[0] + '"></button>').join('') + '<span id="colorName" style="font-size:13px;color:var(--muted)">مشکی</span></div>' +
    (p.sizes && p.sizes.length ? '<div class="opt-row"><span class="lbl">سایز:</span>' + p.sizes.map((s, i) => '<button class="chip ' + (i === 0 ? 'on' : '') + '" data-s="' + s + '">' + s + '</button>').join('') + '</div>' : '') +
    '<div class="buy-row">' + stepper(1, 1, Math.max(p.stock, 1), 'pdp') +
    '<button class="btn btn-p btn-lg" style="flex:1;min-width:180px" data-act="add-cart-pdp" data-id="' + p.id + '" ' + (p.stock === 0 ? 'disabled' : '') + '>' + (p.stock === 0 ? I('bell', 18) + ' اطلاع از موجودی' : I('bag', 18) + ' افزودن به سبد') + '</button>' +
    '<button class="ibtn" style="width:52px;height:52px;border:1px solid var(--line);border-radius:var(--r-s);' + (state.wish.indexOf(p.id) > -1 ? 'color:var(--accent);border-color:var(--accent)' : '') + '" data-act="wish" data-id="' + p.id + '" aria-label="علاقه‌مندی">' + IF('heart', 20) + '</button>' +
    '<button class="ibtn" style="width:52px;height:52px;border:1px solid var(--line);border-radius:var(--r-s)" data-act="cmp" data-id="' + p.id + '" aria-label="مقایسه">' + I('swap', 19) + '</button></div>' +
    '<div class="stock-line"><span style="width:9px;height:9px;border-radius:50%;background:' + stockState[1] + '"></span><span style="color:' + stockState[1] + '">' + stockState[0] + '</span></div>' +
    '<ul class="ship-mini"><li>' + I('truck', 19) + ' ارسال با پست پیشتاز — ۳ تا ۵ روز کاری</li><li>' + I('shield', 19) + ' ضمانت اصالت کالا و گارانتی رسمی</li><li>' + I('refresh', 19) + ' ۷ روز مهلت بازگشت</li></ul>' +
    '</div></div>' +

    '<div class="pd-tabs"><div class="tabs" role="tablist">' +
    '<button class="tab-b on" data-act="tab" data-t="desc">توضیحات</button>' +
    '<button class="tab-b" data-act="tab" data-t="specs">مشخصات فنی</button>' +
    '<button class="tab-b" data-act="tab" data-t="rev">دیدگاه‌ها (' + fa(reviews.length) + ')</button></div>' +
    '<div class="tab-p" id="tabDesc"><p>' + (p.desc || 'توضیحات تکمیلی این محصول به‌زودی اضافه می‌شود.') + '</p><ul class="feat">' + ['ضمانت اصالت و سلامت فیزیکی کالا', 'امکان پرداخت در محل برای تهران و کرج', 'مشاورهٔ رایگان پیش از خرید'].map(f => '<li>' + I('checkC', 16) + ' ' + f + '</li>').join('') + '</ul></div>' +
    '<div class="tab-p" id="tabSpecs" style="display:none"><table class="spec-t">' + (p.specs && p.specs.length ? p.specs : [['دسته‌بندی', cat.name], ['برند', p.brand]]).map(s => '<tr><td>' + s[0] + '</td><td>' + s[1] + '</td></tr>').join('') + '</table></div>' +
    '<div class="tab-p" id="tabRev" style="display:none">' +
    '<div class="rev-sum"><div class="avg"><b>' + faD(p.rating) + '</b>' + stars(p.rating, 17) + '<div style="font-size:12px;color:var(--muted);margin-top:6px">از ' + fa(p.rc) + ' دیدگاه</div></div>' +
    '<div class="rev-bars">' + [5, 4, 3, 2, 1].map((s, i) => '<div class="rb"><span>' + fa(s) + ' ستاره</span><div class="bar"><i data-w="' + dist[i] + '"></i></div><span>٪' + fa(dist[i]) + '</span></div>').join('') + '</div></div>' +
    '<div id="revList">' + (reviews.map(r => revItem(r)).join('') || '<p style="color:var(--muted)">هنوز دیدگاهی ثبت نشده؛ اولین نفر باشید.</p>') + '</div>' +
    '<div class="co-card" style="max-width:none;margin-top:26px"><h4 style="margin-bottom:16px">' + I('edit', 18) + ' ثبت دیدگاه شما</h4>' +
    '<form data-form="review" data-pid="' + p.id + '">' +
    '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><span style="font-size:13px;font-weight:700">امتیاز شما:</span><div class="starpick" id="starPick">' + [1, 2, 3, 4, 5].map(i => '<button type="button" data-star="' + i + '">' + IF('star', 24) + '</button>').join('') + '</div><input type="hidden" name="rating" value="0"></div>' +
    (state.user ? '' : '<div class="field"><label>نام شما</label><input class="inp" name="name" required placeholder="مثلاً: سارا محمدی"><span class="fmsg">نام را وارد کنید</span></div>') +
    '<div class="field"><label>متن دیدگاه <em>*</em></label><textarea class="inp" name="txt" required placeholder="تجربهٔ خود را بنویسید..."></textarea><span class="fmsg">متن دیدگاه نمی‌تواند خالی باشد</span></div>' +
    '<button class="btn btn-p" type="submit">' + I('send', 16) + ' ثبت دیدگاه</button></form></div></div></div>' +
    (related.length ? '<div class="sec" style="padding-bottom:10px">' + secHead('شاید بپسندید', 'محصولات مشابه', '#/shop?cat=' + cat.id) + '<div class="rail">' + related.map(r => cardP(r, 'g', cat.name)).join('') + '</div></div>' : '') +
    '</div>';

  document.querySelectorAll('.gal-th button').forEach(b => b.onclick = () => { document.querySelectorAll('.gal-th button').forEach(x => x.classList.remove('on')); b.classList.add('on'); const gm = document.getElementById('galMain'); if (gm) gm.innerHTML = art(p, +b.getAttribute('data-gal')); });
  document.querySelectorAll('.sw').forEach(b => b.onclick = () => { document.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); b.classList.add('on'); const cn = document.getElementById('colorName'); if (cn) cn.textContent = b.getAttribute('data-c'); });
  if (p.sizes && p.sizes.length) document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { document.querySelectorAll('[data-s]').forEach(x => x.classList.remove('on')); b.classList.add('on'); });
  setTimeout(() => { document.querySelectorAll('#tabRev .bar i').forEach(b => b.style.width = b.getAttribute('data-w') + '%'); }, 350);
}