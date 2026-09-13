import { db } from './database.js';

const cats = [
  ['digital','دیجیتال','cpu',200], ['fashion','مد و پوشاک','shirt',265],
  ['home','خانه و دکور','home',36], ['beauty','زیبایی و سلامت','spark',330],
  ['sport','ورزش و سفر','activity',150]
];
const insCat = db.prepare('INSERT OR REPLACE INTO categories (id,name,icon,hue) VALUES (?,?,?,?)');
cats.forEach(c => insCat.run(...c));

const P = (id,name,cat,art,hue,price,old,stock,rating,rc,brand,o={}) =>
  [id,name,cat,art,hue,price,old,stock,rating,rc,brand,o.isNew?1:0,o.feat?1:0,o.best?1:0,
   o.desc||'', JSON.stringify(o.specs||[]), JSON.stringify(o.sizes||[])];

const products = [
  P('p1','هدفون بی‌سیم ویان‌پاد پرو','digital','headphones',168,2490000,2980000,12,4.6,128,'ویان‌تک',{feat:1,best:1,desc:'هدفون بی‌سیم با حذف نویز فعال و ۴۰ ساعت شارژدهی.',specs:[['اتصال','بلوتوث ۵.۳'],['باتری','۴۰ ساعت'],['نویزگیری','فعال']]}),
  P('p2','ساعت هوشمند آرمان ۲','digital','watch',210,3850000,0,8,4.4,86,'آریام',{feat:1,isNew:1,desc:'نمایشگر آمولد و پایش ضربان قلب.',specs:[['نمایشگر','آمولد'],['باتری','۱۰ روز']]}),
  P('p3','اسپیکر بلوتوثی نوا','digital','speaker',26,1290000,1590000,25,4.2,210,'نوآوران',{best:1,desc:'صدای ۳۶۰ درجه با باس عمیق.',specs:[['توان','۳۰ وات'],['باتری','۱۲ ساعت']]}),
  P('p4','کیبورد مکانیکال تایپو','digital','keyboard',338,2150000,0,0,4.8,64,'کارن',{desc:'سوییچ قابل تعویض و فریم آلومینیومی.',specs:[['چیدمان','75٪']]}),
  P('p5','دوربین چاپ فوری رترو','digital','camera',46,5900000,0,5,4.7,41,'هیلدا',{feat:1,isNew:1,desc:'چاپ لحظه‌ای خاطرات.',specs:[['فلاش','خودکار']]}),
  P('p7','تی‌شرت آرتین','fashion','tshirt',262,590000,720000,40,4.0,95,'رُزا',{sizes:['S','M','L','XL'],desc:'پنبه ۱۰۰٪ با برش آزاد.',specs:[['جنس','پنبه']]}),
  P('p9','عینک آفتابی سایه','fashion','sunglasses',22,880000,0,14,4.4,58,'هیلدا',{isNew:1,feat:1,desc:'لنز پلاریزه و UV400.',specs:[['لنز','پلاریزه']]}),
  P('p11','چراغ پایه لوپ','home','lamp',44,980000,0,9,4.6,112,'نوآوران',{feat:1,desc:'نور گرم برای گوشه مطالعه.',specs:[['ارتفاع','۱۲۰ سانتی‌متر']]}),
  P('p12','صندلی راحتی دِن','home','chair',16,4200000,4900000,3,4.9,27,'آریام',{best:1,desc:'چوب راش و روکش مخمل.',specs:[['بدنه','چوب راش']]}),
  P('p13','ماگ سرامیکی سپید','home','mug',30,240000,0,80,4.2,230,'رُزا',{desc:'ماگ دست‌ساز ۳۵۰ میلی‌لیتر.',specs:[['حجم','۳۵۰ میلی‌لیتر']]}),
  P('p15','ادوپرفیوم شب‌بو','beauty','perfume',278,1750000,0,16,4.7,143,'هیلدا',{feat:1,best:1,desc:'رایحه گرم شرقی.',specs:[['حجم','۱۰۰ میلی‌لیتر']]}),
  P('p16','سرم روشن‌کننده ویتامین‌سی','beauty','bottle',330,690000,850000,30,4.5,188,'آریام',{isNew:1,desc:'۱۵٪ ویتامین سی.',specs:[['حجم','۳۰ میلی‌لیتر']]}),
  P('p18','کتانی شهری گام','sport','sneaker',12,1980000,2400000,18,4.5,301,'کارن',{best:1,feat:1,sizes:['۳۸','۳۹','۴۰','۴۱','۴۲','۴۳'],desc:'زیره فوم سبک.',specs:[['زیره','EVA']]}),
  P('p20','کوله‌پشتی روزمره دشت','sport','backpack',96,1450000,0,22,4.3,77,'نوآوران',{desc:'۲۲ لیتر، جای لپ‌تاپ.',specs:[['گنجایش','۲۲ لیتر']]}),
  P('p21','قمقمه ورزشی هیدرا','sport','bottle',190,390000,460000,60,4.1,150,'ویان‌تک',{desc:'تریتان بدون BPA.',specs:[['حجم','۷۵۰ میلی‌لیتر']]})
];

const insP = db.prepare(`INSERT OR REPLACE INTO products
  (id,name,category_id,art,hue,price,old_price,stock,rating,rating_count,brand,is_new,is_featured,is_bestseller,description,specs,sizes)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
products.forEach(p => insP.run(...p));

const insR = db.prepare('INSERT INTO reviews (product_id,name,rating,body,verified) VALUES (?,?,?,?,?)');
if (db.prepare('SELECT COUNT(*) c FROM reviews').get().c === 0) {
  insR.run('p1','سارا محمدی',5,'کیفیت ساخت و صدا عالیه؛ باتری دو روز دووم میاره.',1);
  insR.run('p1','امیر رضایی',4,'نویزگیری خوبه ولی کابل اضافه نداشت.',1);
  insR.run('p18','حسین تهرانی',5,'بعد یک ماه هنوز مثل روز اوله.',1);
}

console.log('✓ Seed complete:', products.length, 'products,', cats.length, 'categories');