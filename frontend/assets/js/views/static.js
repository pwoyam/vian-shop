import { CONFIG } from '../config.js';
import { FAQS, JOURNAL } from '../data.js';
import { I } from '../icons.js';
import { art } from '../art.js';
import { fa, esc } from '../utils.js';
import { products } from '../catalog.js';
import { secHead, emptySt } from '../components.js';

export function aboutView() {
  const stats = [['۴۸', 'هزار', 'سفارش موفق', 48000, '+'], ['٪', '۹۸', 'رضایت مشتریان', 98, '٪'], ['۵', 'هزار', 'کالای فعال', 5200, '+'], ['۱۲', 'شهر', 'ارسال اکسپرس', 12, '']];
  const feat = products.find(p => p.feat) || products[0];
  document.querySelector('#view').innerHTML =
    '<div class="page-head"><h1>داستان ' + CONFIG.brand.name + '</h1><p>ما باور داریم خرید آنلاین باید ساده، مطمئن و لذت‌بخش باشد.</p></div>' +
    '<section class="sec"><div class="wrap about-g">' +
    '<div class="rv"><div class="kicker">از ۱۴۰۰ تا امروز</div><h2 class="sec-title" style="margin-bottom:14px">کوچک شروع کردیم، بزرگ فکر کردیم</h2>' +
    '<p style="color:var(--muted);line-height:2.3;font-size:14.5px">' + CONFIG.brand.name + ' با یک انبار کوچک و سه نفر شروع شد. امروز با شبکه‌ای از تأمین‌کنندگان معتبر و هزاران سفارش موفق، در کنار شما هستیم.</p></div>' +
    '<div class="about-art rv" style="transition-delay:80ms">' + art(feat, 1) + '</div></div></section>' +
    '<section class="sec" style="padding-top:0"><div class="wrap"><div class="stat-band rv">' +
    stats.map(s => '<div class="stat"><b data-count="' + s[3] + '" data-suf="' + (s[4] === '+' ? '+' : s[4]) + '">۰</b><span>' + s[1] + ' ' + s[2] + '</span></div>').join('') +
    '</div></div></section>' +
    '<section class="sec" style="padding-top:0"><div class="wrap"><div class="news rv"><div><h3>سوالی دارید؟</h3><p>تیم پشتیبانی هر روز هفته پاسخگوی شماست.</p></div><a class="btn btn-p btn-lg" href="#/contact" style="justify-self:end">' + I('phone', 18) + ' تماس با ما</a></div></div></section>';
}

export function contactView() {
  document.querySelector('#view').innerHTML =
    '<div class="page-head"><h1>تماس با ما</h1><p>پیشنهاد، انتقاد یا سوال؛ خوشحال می‌شویم بشنویم.</p></div>' +
    '<section class="sec"><div class="wrap contact-g"><div class="rv on">' +
    '<div class="cinfo">' + [['phone', 'تلفن پشتیبانی', CONFIG.contact.phone], ['mail', 'ایمیل', CONFIG.contact.email], ['clock', 'ساعات کاری', CONFIG.contact.hours], ['pin', 'نشانی', CONFIG.contact.addr]].map(c => '<div class="cci">' + I(c[0], 22) + '<b>' + c[1] + '</b><span>' + c[2] + '</span></div>').join('') + '</div>' +
    '<div class="mapbox"><svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true"><g stroke="var(--line)" stroke-width="10"><path d="M0 60H600M0 150H600M120 0v220M320 0v220M480 0v220"/></g></svg><span class="pin">' + I('pin', 40) + '</span></div>' +
    '</div>' +
    '<form class="co-card rv on" style="max-width:none;margin:0" data-form="contact">' +
    '<h3 style="margin-bottom:20px">' + I('send', 20) + ' ارسال پیام</h3>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 14px">' +
    '<div class="field"><label>نام <em>*</em></label><input class="inp" name="name" required><span class="fmsg">نام لازم است</span></div>' +
    '<div class="field"><label>ایمیل <em>*</em></label><input class="inp ltr" style="text-align:right" type="email" name="email" required><span class="fmsg">ایمیل معتبر نیست</span></div></div>' +
    '<div class="field"><label>موضوع</label><select class="inp" name="subj"><option>پیش از خرید</option><option>پیگیری سفارش</option><option>بازگشت کالا</option><option>همکاری</option><option>سایر</option></select></div>' +
    '<div class="field"><label>متن پیام <em>*</em></label><textarea class="inp" name="msg" required></textarea><span class="fmsg">متن پیام را بنویسید</span></div>' +
    '<button class="btn btn-p btn-lg" type="submit">' + I('send', 17) + ' ارسال پیام</button></form></div></section>';
}

export function faqView() {
  const cats = ['همه'].concat(FAQS.map(f => f.c).filter((v, i, a) => a.indexOf(v) === i));
  document.querySelector('#view').innerHTML =
    '<div class="page-head"><h1>سوالات متداول</h1><p>پاسخ پرسش‌های رایج.</p></div>' +
    '<section class="sec"><div class="wrap faq-g">' +
    '<aside class="faq-side rv on">' + cats.map((c, i) => '<button class="chip ' + (i === 0 ? 'on' : '') + '" data-fc="' + c + '">' + c + '</button>').join('') + '</aside>' +
    '<div><div class="field" style="margin-bottom:20px"><input class="inp" id="faqSearch" placeholder="جستجو در سوالات..."></div><div id="faqList">' + faqItems('همه', '') + '</div></div>' +
    '</div></section>';
  document.querySelectorAll('.faq-side .chip').forEach(b => b.onclick = () => { document.querySelectorAll('.faq-side .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); document.getElementById('faqList').innerHTML = faqItems(b.getAttribute('data-fc'), document.getElementById('faqSearch').value); bindFaq(); });
  document.getElementById('faqSearch').oninput = e => { const on = document.querySelector('.faq-side .chip.on'); document.getElementById('faqList').innerHTML = faqItems(on ? on.getAttribute('data-fc') : 'همه', e.target.value); bindFaq(); };
  bindFaq();
}
function faqItems(cat, q) {
  const list = FAQS.filter(f => (cat === 'همه' || f.c === cat) && (!q || (f.q + f.a).indexOf(q) > -1));
  return list.length ? list.map(f => '<div class="acc-i"><button type="button">' + I('help', 18) + ' ' + f.q + ' ' + I('chevD', 17) + '</button><div class="abody"><p>' + f.a + '</p></div></div>').join('') : emptySt('search', 'موردی پیدا نشد', 'عبارت دیگری را امتحان کنید.');
}
function bindFaq() { document.querySelectorAll('.acc-i>button').forEach(b => b.onclick = () => { const it = b.parentElement, was = it.classList.contains('open'); document.querySelectorAll('.acc-i').forEach(x => x.classList.remove('open')); if (!was) it.classList.add('open'); }); }

export function docView(title, secs) {
  document.querySelector('#view').innerHTML = '<div class="page-head"><h1>' + title + '</h1><p>آخرین به‌روزرسانی: آبان ۱۴۰۴</p></div>' +
    '<section class="sec"><div class="wrap doc">' + secs.map((s, i) => '<h2 class="rv">' + I('file', 20) + ' ' + fa(i + 1) + '. ' + s[0] + '</h2><p class="rv">' + s[1] + '</p>').join('') + '</div></section>';
}

export function notFound() {
  return '<div class="wrap err404"><div class="big"><span>۴</span>۰<span>۴</span></div>' +
    '<h2 class="sec-title" style="margin-bottom:8px">این صفحه پیدا نشد</h2>' +
    '<p style="color:var(--muted);max-width:44ch;margin:0 auto 26px">ممکن است نشانی اشتباه باشد.</p>' +
    '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn btn-p btn-lg" href="#/shop">' + I('bag', 17) + ' رفتن به فروشگاه</a><button class="btn btn-o btn-lg" data-act="search-open">' + I('search', 17) + ' جستجوی محصول</button></div></div>';
}