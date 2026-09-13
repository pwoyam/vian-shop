import { I } from '../icons.js';
import { art } from '../art.js';
import { fa, toman } from '../utils.js';
import { state, cartTotal, notifAdd } from '../store.js';
import { api } from '../api.js';
import { CONFIG } from '../config.js';
import { byId } from '../catalog.js';

const CO = { step: 1, ship: 'post', pay: 'online', info: {} };
export function __installCheckoutHelpers() { /* در app وصل می‌شود */ }

export function checkoutView(params) {
  if (!Object.keys(state.cart).length && !params.get('done')) { location.hash = '#/cart'; return; }
  CO.step = parseInt(params.get('step')) || 1;
  renderCheckout();
}

function renderCheckout() {
  const t = cartTotal();
  const stepsH = '<div class="steps">' + [['۱', 'اطلاعات ارسال'], ['۲', 'روش پرداخت'], ['۳', 'بازبینی و ثبت']].map((s, i) => '<div class="stp ' + (CO.step === i + 1 ? 'on' : '') + ' ' + (CO.step > i + 1 ? 'done' : '') + '"><i>' + (CO.step > i + 1 ? I('check', 15) : s[0]) + '</i><span>' + s[1] + '</span></div>' + (i < 2 ? '<div class="stp-line ' + (CO.step > i + 1 ? 'done' : '') + '"></div>' : '')).join('') + '</div>';
  let body = '';
  if (CO.step === 1) {
    const u = state.user || {}, last = state.addrs[0] || {};
    body = '<div class="co-card"><h3 style="margin-bottom:20px">' + I('pin', 20) + ' اطلاعات گیرنده و ارسال</h3>' +
      '<form data-form="co1"><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">' +
      '<div class="field"><label>نام و نام خانوادگی <em>*</em></label><input class="inp" name="name" value="' + escAttr(u.name || last.name || '') + '" required><span class="fmsg">نام را کامل وارد کنید</span></div>' +
      '<div class="field"><label>شماره موبایل <em>*</em></label><input class="inp ltr" style="text-align:right" name="phone" value="' + escAttr(u.phone || last.phone || '') + '" placeholder="09xxxxxxxxx" required><span class="fmsg">شماره موبایل معتبر نیست</span></div>' +
      '<div class="field"><label>استان / شهر <em>*</em></label><input class="inp" name="city" value="' + escAttr(last.city || '') + '" required><span class="fmsg">شهر را وارد کنید</span></div>' +
      '<div class="field"><label>کد پستی</label><input class="inp ltr" style="text-align:right" name="postal" value="' + escAttr(last.postal || '') + '" placeholder="۱۰ رقم"><span class="fmsg">کد پستی ۱۰ رقمی است</span></div></div>' +
      '<div class="field"><label>نشانی کامل <em>*</em></label><textarea class="inp" name="addr" required placeholder="خیابان، کوچه، پلاک، واحد...">' + escAttr(last.address || '') + '</textarea><span class="fmsg">نشانی را وارد کنید</span></div>' +
      '<h4 style="margin:20px 0 12px;font-size:14.5px">روش ارسال</h4>' +
      CONFIG.shippings.map(s => '<label class="radiocard ' + (CO.ship === s.id ? 'on' : '') + '"><input type="radio" name="ship" value="' + s.id + '" ' + (CO.ship === s.id ? 'checked' : '') + ' style="display:none"><span class="rdot"></span><span><b>' + s.name + '</b><span>' + s.desc + '</span></span><span class="ric" style="font-weight:800;font-size:13px">' + (s.price === 0 ? 'رایگان' : fa(s.price) + ' تومان') + '</span></label>').join('') +
      '<div class="co-nav"><button type="button" class="btn btn-g" onclick="location.hash=\'#/cart\'">' + I('chevR', 15) + ' بازگشت به سبد</button><button class="btn btn-p" type="submit">ادامه ' + I('arrowL', 15) + '</button></div></form></div>';
  } else if (CO.step === 2) {
    body = '<div class="co-card"><h3 style="margin-bottom:20px">' + I('card', 20) + ' روش پرداخت</h3><form data-form="co2">' +
      CONFIG.payments.map(pm => '<label class="radiocard ' + (CO.pay === pm.id ? 'on' : '') + '"><input type="radio" name="pay" value="' + pm.id + '" ' + (CO.pay === pm.id ? 'checked' : '') + ' style="display:none"><span class="rdot"></span><span><b>' + pm.name + '</b><span>' + pm.desc + '</span></span><span class="ric">' + I(pm.icon, 22) + '</span></label>').join('') +
      '<div style="background:var(--surface2);border-radius:14px;padding:16px;margin-top:16px;font-size:13px;display:flex;gap:10px;align-items:center">' + I('info', 18) + ' نسخهٔ نمایشی — هیچ تراکنش واقعی انجام نمی‌شود.</div>' +
      '<div class="co-nav"><button type="button" class="btn btn-g" data-act="co-back">' + I('chevR', 15) + ' مرحله قبل</button><button class="btn btn-p" type="submit">ادامه ' + I('arrowL', 15) + '</button></div></form></div>';
  } else {
    const items = []; for (const k in state.cart) items.push(state.cart[k]);
    const sc = CONFIG.shippings.find(x => x.id === CO.ship) || CONFIG.shippings[0];
    body = '<div class="co-card"><h3 style="margin-bottom:20px">' + I('clipboard', 20) + ' بازبینی نهایی سفارش</h3>' +
      items.map(it => { const p = byId(it.id); return '<div style="display:flex;gap:13px;align-items:center;padding-block:12px;border-bottom:1px dashed var(--line)"><span style="width:60px;height:60px;border-radius:12px;overflow:hidden;border:1px solid var(--line)">' + art(p) + '</span><div style="flex:1"><b style="font-size:13.5px">' + p.name + '</b><div style="font-size:12px;color:var(--muted)">' + fa(it.qty) + ' عدد</div></div><span class="price">' + toman(p.price * it.qty) + '</span></div>'; }).join('') +
      '<div class="sum-row tot" style="margin-top:16px"><span>مبلغ قابل پرداخت</span><span>' + toman(t + sc.price) + '</span></div>' +
      '<div class="co-nav"><button class="btn btn-g" data-act="co-back">' + I('chevR', 15) + ' مرحله قبل</button><button class="btn btn-p btn-lg" data-act="place-order" id="placeBtn">' + I('checkC', 18) + ' ثبت نهایی سفارش</button></div></div>';
  }
  document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:34px"><h1 class="sec-title" style="text-align:center;margin-bottom:30px">تسویه‌حساب</h1>' + stepsH + body + '</div>';
  document.querySelectorAll('.radiocard input').forEach(r => r.onchange = () => { if (r.name === 'ship') CO.ship = r.value; else CO.pay = r.value; renderCheckout(); });
}
function escAttr(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

window.__coBack = () => { CO.step--; renderCheckout(); };
window.__coNext = (kind, fd) => {
  if (kind === 'co1') { CO.info = { name: fd.get('name'), phone: fd.get('phone'), city: fd.get('city'), postal: fd.get('postal'), addr: fd.get('addr') }; CO.step = 2; renderCheckout(); }
  else { CO.step = 3; renderCheckout(); }
  window.scrollTo(0, 0);
};

export function placeOrder() {
  const btn = document.getElementById('placeBtn'); if (!btn) return;
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> در حال ثبت سفارش...';
  const t = cartTotal();
  const sc = CONFIG.shippings.find(x => x.id === CO.ship) || CONFIG.shippings[0];
  const ship = t >= CONFIG.freeShip ? 0 : sc.price;
  const items = []; for (const k in state.cart) items.push(Object.assign({}, state.cart[k]));
  api.placeOrder({ items, total: t + ship, shipping: ship, ship_method: sc.name, pay_method: (CONFIG.payments.find(x => x.id === CO.pay) || {}).name, address: CO.info })
    .then(res => {
      state.cart = {}; notifAdd('package', 'سفارش شما ثبت شد', 'سفارش ' + res.id + ' در حال پردازش است.');
      document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:60px"><div class="success">' +
        '<div class="okc">' + I('check', 44) + '</div><h2>سفارش شما با موفقیت ثبت شد</h2>' +
        '<p style="color:var(--muted)">از اعتماد شما سپاسگزاریم.</p>' +
        '<div class="ocode ltr">' + res.id + '</div>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn btn-p" href="#/account?tab=orders">' + I('package', 17) + ' پیگیری سفارش</a><a class="btn btn-o" href="#/shop">ادامه خرید</a></div>' +
        '</div></div>';
    })
    .catch(() => { btn.disabled = false; btn.innerHTML = I('checkC', 18) + ' ثبت نهایی سفارش'; });
}