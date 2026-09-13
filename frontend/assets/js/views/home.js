import { CONFIG } from '../config.js';
import { BRANDS, JOURNAL } from '../data.js';
import { I } from '../icons.js';
import { art } from '../art.js';
import { fa, faD, pctOff } from '../utils.js';
import { products, categories, catOf } from '../catalog.js';
import { cardP, secHead, stars } from '../components.js';

export function homeView() {
  const heroP = products.find(p => p.old && p.feat) || products[0];
  const heroP2 = products.find(p => p.feat && p.id !== heroP.id) || products[1];
  const flash = products.filter(p => p.old).slice(0, 8);
  const feats = products.filter(p => p.feat).slice(0, 4);
  const newsArr = products.filter(p => p.isNew).concat(products.slice(0, 4));
  const news = [], seen = {};
  newsArr.forEach(p => { if (!seen[p.id]) { seen[p.id] = 1; news.push(p); } });
  const newsSlice = news.slice(0, 4);
  const vals = [['truck', 'ارسال سریع', 'تحویل اکسپرس همان روز'], ['shield', 'ضمانت اصالت', 'کالای اصل با فاکتور رسمی'], ['refresh', 'بازگشت آسان', '۷ روز مهلت بدون قید و شرط'], ['phone', 'پشتیبانی واقعی', 'پاسخگویی ۷ روز هفته']];

  const cname = id => catOf(id).name;
  const card = p => cardP(p, 'g', cname(p.cat));

  document.querySelector('#view').innerHTML =
    '<div class="ticker" aria-hidden="true"><div class="ticker-track">' + CONFIG.announcements.concat(CONFIG.announcements).map(a => '<span>' + I('zap', 14) + ' ' + a + '</span>').join('') + '</div></div>' +

    '<section class="hero-sec"><div class="wrap hero">' +
    '<div><span class="h-kick"><span class="dot"></span> کالکشن پاییز ۱۴۰۴ رسید</span>' +
    '<h1>خریدِ خوب، از <span class="hl">' + CONFIG.brand.name + '</span> شروع می‌شود</h1>' +
    '<p class="sub">از کالای دیجیتال تا دکور خانه؛ اصل، با ضمانت و ارسال سریع. ' + CONFIG.brand.desc + '</p>' +
    '<div class="h-ctas"><a class="btn btn-p btn-lg" href="#/shop">' + I('bag', 18) + ' شروع خرید</a><a class="btn btn-o btn-lg" href="#/shop?off=1">' + I('zap', 18) + ' پیشنهادهای ویژه</a></div>' +
    '<div class="h-trust"><span>' + I('truck', 18) + ' ارسال رایگان +۹۰۰ هزار تومان</span><span>' + I('shield', 18) + ' ضمانت اصالت کالا</span><span>' + I('refresh', 18) + ' ۷ روز مهلت بازگشت</span></div></div>' +
    '<div class="hv rv on"><div class="hv-panel"></div><div class="hv-main">' +
    '<span class="hv-chip c1">' + I('percent', 15) + ' ' + fa(pctOff(heroP)) + '٪ تخفیف ویژه</span>' +
    '<a class="hv-art" href="#/product/' + heroP.id + '">' + art(heroP) + '</a>' +
    '<div class="hv-meta"><div><b>' + heroP.name + '</b><div class="prate" style="margin-top:3px">' + stars(heroP.rating, 13) + ' <span>' + faD(heroP.rating) + '</span></div></div>' +
    '<div style="text-align:left"><div class="oldp">' + fa(heroP.old) + '</div><div class="pr" style="font-weight:900">' + fa(heroP.price) + ' <small>تومان</small></div></div></div>' +
    '<button class="btn btn-ink" style="width:100%;margin-top:12px" data-act="add-cart" data-id="' + heroP.id + '">' + I('bag', 17) + ' افزودن به سبد خرید</button>' +
    '</div><span class="hv-chip c2">' + I('shield', 15) + ' ضمانت اصالت و گارانتی رسمی</span>' +
    '<a class="hv-mini" href="#/product/' + heroP2.id + '"><div class="m-art">' + art(heroP2) + '</div><b>' + heroP2.name + '</b><span>' + fa(heroP2.price) + ' تومان</span></a></div>' +
    '</div></section>' +

    '<section class="sec"><div class="wrap">' + secHead('دسته‌بندی‌ها', 'خرید بر اساس دسته', '#/shop') +
    '<div class="cats">' + categories.map((c, i) => '<a class="cat rv" style="transition-delay:' + (i * 60) + 'ms" href="#/shop?cat=' + c.id + '"><span class="ci">' + I(c.icon, 26) + '</span><b>' + c.name + '</b><span>' + fa(c.count) + ' کالا</span></a>').join('') + '</div></div></section>' +

    '<section class="sec flash"><div class="wrap"><div class="flash-head">' +
    '<div class="rt"><span class="zap-ic">' + I('zap', 24) + '</span><div><div class="kicker" style="margin:0">' + CONFIG.saleTitle + '</div><h2 class="sec-title">فقط تا پایان امروز</h2></div></div>' +
    '<div style="display:flex;align-items:center;gap:16px"><div class="cd" data-cd></div><a class="sec-link" href="#/shop?off=1">همه ' + I('arrowL', 15) + '</a></div></div>' +
    '<div class="rail">' + flash.map(p => card(p)).join('') + '</div></div></section>' +

    '<section class="sec"><div class="wrap">' + secHead('منتخب ' + CONFIG.brand.name, 'پیشنهادهای ما برای شما', '#/shop?sort=pop', 'مشاهده همه') +
    '<div class="pgrid">' + feats.map(p => card(p)).join('') + '</div></div></section>' +

    '<section class="sec" style="padding-top:0"><div class="wrap duo">' +
    '<div class="tile dark rv"><div class="kicker" style="color:var(--accent)">تا ۴۰٪ تخفیف</div><h3>فستیوال کالای دیجیتال</h3><p>هدفون، ساعت هوشمند و اسپیکر با گارانتی رسمی.</p><a class="btn btn-o" href="#/shop?cat=digital">خرید دیجیتال ' + I('arrowL', 15) + '</a><div class="t-art">' + art(products[0], 3) + '</div></div>' +
    '<div class="tile soft rv" style="transition-delay:80ms"><div class="kicker">تازه رسیده‌ها</div><h3>خانه‌ای که دوستش دارید</h3><p>دکور، نور و جزئیات کوچک با طراحی ماندگار.</p><a class="btn btn-p" href="#/shop?cat=home">خرید خانه و دکور ' + I('arrowL', 15) + '</a><div class="t-art">' + art(products.find(p => p.cat === 'home'), 2) + '</div></div>' +
    '</div></section>' +

    '<section class="sec" style="padding-top:0"><div class="wrap">' + secHead('تازه‌ها', 'جدیدترین محصولات', '#/shop?sort=new') +
    '<div class="pgrid">' + newsSlice.map(p => card(p)).join('') + '</div></div></section>' +

    '<section class="marq" aria-hidden="true"><div class="marq-track">' + BRANDS.concat(BRANDS).map(b => '<b>' + I('spark', 16) + ' ' + b + '</b>').join('') + '</div></section>' +

    '<section class="sec"><div class="wrap"><div class="vals rv">' + vals.map((v, i) => '<div class="val"><span class="vi">' + I(v[0], 24) + '</span><div><b>' + v[1] + '</b><span>' + v[2] + '</span></div></div>').join('') + '</div></div></section>' +

    '<section class="sec" style="padding-top:0"><div class="wrap">' + secHead('مجله ' + CONFIG.brand.name, 'خواندنی‌های پیش از خرید', '#/about') +
    '<div class="jgrid">' + JOURNAL.map(j => '<article class="jcard rv"><div class="jart" style="background:hsl(' + j.hue + ',42%,88%)">' + I(j.ic, 54) + '</div><div class="jb"><span class="bdg bdg-soft">' + j.c + '</span><h4 style="margin-top:10px"><a href="#/about">' + j.t + '</a></h4><div class="jm"><span>' + I('calendar', 13) + ' ' + j.d + '</span></div></div></article>').join('') + '</div></div></section>' +

    '<section class="sec" style="padding-top:0"><div class="wrap"><div class="news rv">' +
    '<div><h3>از تخفیف‌ها جا نمانید</h3><p>با عضویت در خبرنامه، اولین نفری باشید که از فروش‌های ویژه باخبر می‌شود.</p></div>' +
    '<form data-form="newsletter"><input class="inp" type="email" name="email" placeholder="ایمیل شما" required aria-label="ایمیل"><button class="btn btn-p" type="submit">عضویت</button></form>' +
    '</div></div></section>';
}