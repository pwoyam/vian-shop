import { I } from '../icons.js';
import { art } from '../art.js';
import { fa, toman } from '../utils.js';
import { state, cartCount, cartTotal } from '../store.js';
import { CONFIG } from '../config.js';
import { byId } from '../catalog.js';
import { stepper, emptySt } from '../components.js';

export function cartView() {
  const keys = Object.keys(state.cart);
  if (!keys.length) { document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:40px">' + emptySt('bag', 'سبد خرید شما خالی است', 'هنوز کالایی انتخاب نکرده‌اید.', '#/shop?off=1', 'مشاهده پیشنهادها') + '</div>'; return; }
  const t = cartTotal(), ship = t >= CONFIG.freeShip ? 0 : 45000;
  document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:30px">' +
    '<h1 class="sec-title" style="margin-bottom:26px">سبد خرید <span style="font-family:var(--fb);font-size:14px;color:var(--muted)">(' + fa(cartCount()) + ' کالا)</span></h1>' +
    '<div class="cart-g"><div id="cartItems">' + keys.map(k => { const it = state.cart[k], p = byId(it.id); return '<div class="cart-it" data-key="' + k + '">' +
      '<a class="cm" href="#/product/' + p.id + '">' + art(p) + '</a>' +
      '<div class="cb"><a href="#/product/' + p.id + '"><b>' + p.name + '</b></a>' +
      '<div class="meta">' + p.brand + ' • ' + (it.color ? 'رنگ: ' + it.color : '') + (it.size ? ' • سایز: ' + it.size : '') + '</div>' +
      '<div class="cr">' + stepper(it.qty, 1, p.stock, k) +
      '<div style="display:flex;align-items:center;gap:14px"><span class="price">' + toman(p.price * it.qty) + '</span>' +
      '<button class="ibtn" style="width:36px;height:36px;color:var(--danger)" data-act="cart-rm" data-key="' + k + '" aria-label="حذف">' + I('trash', 17) + '</button></div></div></div></div>'; }).join('') + '</div>' +
    '<div class="summary rv on"><h4>خلاصهٔ سفارش</h4>' +
    '<div class="sum-row"><span>جمع کالاها</span><span>' + toman(t) + '</span></div>' +
    '<div class="sum-row"><span>هزینه ارسال</span><span>' + (ship ? toman(ship) : '<span style="color:var(--ok);font-weight:800">رایگان</span>') + '</span></div>' +
    (t < CONFIG.freeShip ? '<div style="font-size:12px;background:var(--accent-soft);color:var(--accent);border-radius:10px;padding:9px 12px;margin-top:8px">' + I('truck', 14) + ' تا ارسال رایگان، ' + fa(CONFIG.freeShip - t) + ' تومان مانده</div>' : '') +
    '<div class="sum-row tot"><span>مبلغ قابل پرداخت</span><span>' + toman(t + ship) + '</span></div>' +
    '<a class="btn btn-p btn-lg" style="width:100%;margin-top:16px" href="#/checkout">ادامه فرآیند خرید ' + I('arrowL', 17) + '</a>' +
    '<div class="secure">' + I('lock', 14) + ' پرداخت امن با رمزنگاری TLS</div></div></div></div>';
}