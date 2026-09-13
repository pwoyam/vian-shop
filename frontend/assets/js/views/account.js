import { I } from '../icons.js';
import { art } from '../art.js';
import { fa, toman, esc, openModal } from '../utils.js';
import { state } from '../store.js';
import { api } from '../api.js';
import { byId } from '../catalog.js';
import { cardP, emptySt } from '../components.js';

function statusChip(s) { return ['<span class="bdg bdg-warn">در حال پردازش</span>', '<span class="bdg bdg-acc">آمادهٔ ارسال</span>', '<span class="bdg bdg-acc">در حال ارسال</span>', '<span class="bdg bdg-ok">تحویل شده</span>'][s]; }
function orderCard(o) {
  const th = o.items.slice(0, 4).map(it => byId(it.id)).filter(Boolean);
  return '<div class="ocard"><div class="oh"><b class="ltr" style="font-family:var(--fd)">' + o.id + '</b><span style="color:var(--muted)">' + o.date + '</span>' + statusChip(o.status) + '<span style="margin-inline-start:auto;font-weight:900">' + toman(o.total) + '</span></div>' +
    '<div class="ob"><div class="thumbs">' + th.map(p => '<span class="th">' + art(p) + '</span>').join('') + '</div>' +
    '<a class="btn btn-o btn-sm" href="#/account?tab=order&id=' + o.id + '">جزئیات ' + I('arrowL', 13) + '</a></div></div>';
}
function addrModal(a) {
  const e = a || {};
  openModal('<h4>' + I('pin', 20) + ' ' + (a ? 'ویرایش' : 'افزودن') + ' آدرس</h4>' +
    '<form data-form="address" data-aid="' + (e.id || '') + '">' +
    '<div class="field"><label>عنوان (خانه، محل کار...)</label><input class="inp" name="title" value="' + esc(e.title || '') + '" required><span class="fmsg">عنوان لازم است</span></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">' +
    '<div class="field"><label>نام گیرنده</label><input class="inp" name="name" value="' + esc(e.name || state.user.name) + '" required><span class="fmsg">الزامی</span></div>' +
    '<div class="field"><label>موبایل</label><input class="inp ltr" style="text-align:right" name="phone" value="' + esc(e.phone || '') + '" required><span class="fmsg">الزامی</span></div>' +
    '<div class="field"><label>شهر</label><input class="inp" name="city" value="' + esc(e.city || '') + '" required><span class="fmsg">الزامی</span></div>' +
    '<div class="field"><label>کد پستی</label><input class="inp ltr" style="text-align:right" name="postal" value="' + esc(e.postal || '') + '"><span class="fmsg">۱۰ رقم</span></div></div>' +
    '<div class="field"><label>نشانی کامل</label><textarea class="inp" name="address" required>' + esc(e.address || '') + '</textarea><span class="fmsg">الزامی</span></div>' +
    '<button class="btn btn-p" style="width:100%" type="submit">' + I('check', 15) + ' ذخیرهٔ آدرس</button></form>');
}
window.__addrModal = addrModal;

export async function accountView(params) {
  if (!state.user) { location.hash = '#/auth/login?next=account'; return; }
  const tab = params.get('tab') || 'profile', u = state.user;
  const tabs = [['profile', 'پروفایل', 'user'], ['orders', 'سفارش‌ها', 'package'], ['addresses', 'آدرس‌ها', 'pin'], ['wishlist', 'علاقه‌مندی‌ها', 'heart'], ['notifications', 'اعلان‌ها', 'bell'], ['settings', 'تنظیمات', 'sliders']];
  const unread = state.notifs.filter(n => !n.read).length;
  let panel = '';

  if (tab === 'profile') panel = '<h3>' + I('user', 20) + ' اطلاعات حساب</h3>' +
    '<form data-form="profile" style="max-width:520px">' +
    '<div class="field"><label>نام و نام خانوادگی</label><input class="inp" name="name" value="' + esc(u.name) + '" required><span class="fmsg">نام نمی‌تواند خالی باشد</span></div>' +
    '<div class="field"><label>ایمیل</label><input class="inp ltr" style="text-align:right" type="email" name="email" value="' + esc(u.email) + '" required><span class="fmsg">ایمیل معتبر نیست</span></div>' +
    '<div class="field"><label>شماره موبایل</label><input class="inp ltr" style="text-align:right" name="phone" value="' + esc(u.phone || '') + '" placeholder="09xxxxxxxxx"><span class="fmsg">شماره معتبر نیست</span></div>' +
    '<button class="btn btn-p" type="submit">' + I('check', 16) + ' ذخیرهٔ تغییرات</button></form>';
  else if (tab === 'orders') {
    let orders = []; try { orders = await api.getOrders(); } catch (e) { orders = state.orders; }
    panel = '<h3>' + I('package', 20) + ' سفارش‌های من (' + fa(orders.length) + ')</h3>' +
      (orders.length ? orders.map(o => orderCard(o)).join('') : emptySt('package', 'هنوز سفارشی ندارید', 'اولین خرید خود را انجام دهید.', '#/shop', 'شروع خرید'));
  }
  else if (tab === 'order') {
    const o = state.orders.find(x => x.id === params.get('id'));
    if (!o) panel = emptySt('package', 'سفارش پیدا نشد', '', '#/account?tab=orders', 'بازگشت');
    else {
      const steps = ['ثبت سفارش', 'پردازش', 'ارسال', 'تحویل'];
      panel = '<h3><a class="btn btn-g btn-sm" href="#/account?tab=orders">' + I('chevR', 15) + ' بازگشت</a> جزئیات سفارش <span class="ltr" style="font-family:var(--fd);font-size:20px">' + o.id + '</span> ' + statusChip(o.status) + '</h3>' +
        '<div class="timeline" style="--tl:' + (o.status / 3 * 100) + '%">' + steps.map((s, i) => '<div class="tl-s ' + (i <= o.status ? 'done' : '') + '"><i>' + (i <= o.status ? I('check', 15) : fa(i + 1)) + '</i>' + s + '</div>').join('') + '</div>' +
        '<div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px">' +
        '<div>' + o.items.map(it => { const p = byId(it.id); return p ? '<div style="display:flex;gap:13px;align-items:center;padding-block:12px;border-bottom:1px dashed var(--line)"><span style="width:66px;height:66px;border-radius:13px;overflow:hidden;border:1px solid var(--line)">' + art(p) + '</span><div style="flex:1"><b style="font-size:13.5px">' + p.name + '</b><div style="font-size:12px;color:var(--muted)">' + fa(it.qty) + ' عدد</div></div><span class="price">' + toman(p.price * it.qty) + '</span></div>' : ''; }).join('') + '</div>' +
        '<div style="background:var(--surface2);border-radius:16px;padding:20px;font-size:13px"><b style="display:block;margin-bottom:10px">خلاصه پرداخت</b>' +
        '<div class="sum-row tot"><span>پرداخت‌شده</span><span>' + toman(o.total) + '</span></div>' +
        '<div style="margin-top:14px;color:var(--muted)">' + I('pin', 14) + ' ' + esc(o.addr.city) + ' — ' + esc(o.addr.addr) + '</div></div></div>';
    }
  }
  else if (tab === 'addresses') {
    let addrs = []; try { addrs = await api.getAddresses(); } catch (e) { addrs = state.addrs; }
    panel = '<h3>' + I('pin', 20) + ' آدرس‌های من <button class="btn btn-p btn-sm" style="margin-inline-start:auto" data-act="addr-new">' + I('plus', 15) + ' آدرس جدید</button></h3>' +
      (addrs.length ? '<div class="addr-g">' + addrs.map(a => '<div class="acard ' + (a.def ? 'def' : '') + '">' +
        '<b>' + I('pin', 16) + ' ' + esc(a.title) + (a.def ? ' <span class="bdg bdg-soft" style="margin-inline-start:auto">پیش‌فرض</span>' : '') + '</b>' +
        '<p>' + esc(a.name) + ' — <span class="ltr">' + a.phone + '</span><br>' + esc(a.city) + '، ' + esc(a.address) + '<br>کد پستی: <span class="ltr">' + (a.postal || '—') + '</span></p>' +
        '<div class="acts"><button class="btn btn-o btn-sm" data-act="addr-edit" data-id="' + a.id + '">' + I('edit', 13) + ' ویرایش</button><button class="btn btn-g btn-sm" style="color:var(--danger)" data-act="addr-del" data-id="' + a.id + '">' + I('trash', 13) + ' حذف</button>' + (a.def ? '' : '<button class="btn btn-g btn-sm" data-act="addr-def" data-id="' + a.id + '">پیش‌فرض</button>') + '</div></div>').join('') + '</div>' : emptySt('pin', 'آدرسی ثبت نشده', 'برای خرید سریع‌تر آدرس خود را ذخیره کنید.'));
  }
  else if (tab === 'wishlist') {
    const ps = state.wish.map(byId).filter(Boolean);
    panel = '<h3>' + I('heart', 20) + ' علاقه‌مندی‌ها (' + fa(ps.length) + ')</h3>' + (ps.length ? '<div class="pgrid compact">' + ps.map(p => cardP(p, 'g', '')).join('') + '</div>' : emptySt('heart', 'لیست خالی است', 'از آیکون قلب روی محصولات استفاده کنید.', '#/shop'));
  }
  else if (tab === 'notifications') {
    let notifs = []; try { notifs = await api.getNotifications(); } catch (e) { notifs = state.notifs; }
    panel = '<h3>' + I('bell', 20) + ' اعلان‌ها ' + (unread ? '<span class="bdg bdg-acc">' + fa(unread) + ' جدید</span> <button class="btn btn-o btn-sm" data-act="notif-read">' + I('check', 13) + ' خواندن همه</button>' : '') + '</h3>' +
      (notifs.length ? notifs.map(n => '<div class="notif ' + (n.read || n.is_read ? '' : 'unread') + '"><span class="ni">' + I(n.icon, 19) + '</span><div><b>' + n.title + '</b><p>' + (n.body || n.desc || '') + '</p></div><time>' + (n.date || '') + '</time></div>').join('') : emptySt('bell', 'اعلانی ندارید', ''));
  }
  else if (tab === 'settings') panel = '<h3>' + I('sliders', 20) + ' تنظیمات حساب</h3>' +
    '<div style="max-width:520px">' +
    '<div style="border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:16px"><b style="display:block;margin-bottom:6px">پوستهٔ فروشگاه</b><span style="font-size:12.5px;color:var(--muted)">رنگ و حالت نمایش را از دکمهٔ شناور پایین صفحه تغییر دهید.</span></div>' +
    '<form data-form="pass" style="border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:16px">' +
    '<b style="display:block;margin-bottom:14px">تغییر رمز عبور</b>' +
    '<div class="field"><label>رمز فعلی</label><input class="inp" type="password" name="cur" required><span class="fmsg">الزامی است</span></div>' +
    '<div class="field"><label>رمز جدید</label><input class="inp" type="password" name="nw" required><span class="fmsg">حداقل ۶ کاراکتر</span></div>' +
    '<button class="btn btn-p btn-sm" type="submit">به‌روزرسانی رمز</button></form>' +
    '<button class="btn btn-d" style="margin-top:20px" data-act="logout">' + I('logout', 16) + ' خروج از حساب</button></div>';

  document.querySelector('#view').innerHTML = '<div class="wrap" style="padding-top:30px"><div class="acc-g">' +
    '<aside class="acc-side rv on"><div class="acc-user"><span class="ava">' + esc(u.name[0]) + '</span><div><b>' + esc(u.name) + '</b><span>' + esc(u.email) + '</span></div></div>' +
    '<nav class="acc-nav">' + tabs.map(t => '<a href="#/account?tab=' + t[0] + '" class="' + ((tab === t[0] || (tab === 'order' && t[0] === 'orders')) ? 'on' : '') + '">' + I(t[2], 17) + ' ' + t[1] + ((t[0] === 'notifications' && unread) ? '<span class="cnt2">' + fa(unread) + '</span>' : '') + '</a>').join('') +
    '<a href="#" data-act="logout" style="color:var(--danger)">' + I('logout', 17) + ' خروج</a></nav></aside>' +
    '<section class="acc-panel">' + panel + '</section></div></div>';
}