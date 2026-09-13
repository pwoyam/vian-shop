<div dir="rtl">

# ویان — قالب فروشگاهی داده‌محور

یک قالب فروشگاه اینترنتی کامل، مدرن و فارسی (RTL) با دو بخش **فرانت‌اند استاتیک** و **بک‌اند REST API**. بدون هیچ فریم‌ورک سنگین؛ فرانت با Vanilla JS + ES Modules و بک‌اند با Node + Express + SQLite.

![demo](docs/screenshot.png)

## دمو زنده
🔗 [مشاهده دمو](https://YOUR-USERNAME.github.io/vian-shop/) *(لینک را بعد از دیپلوی جایگزین کنید)*

## ویژگی‌ها
- طراحی مدرن، مینیمال و کاملاً Responsive (موبایل‌فرست)
- کتابخانه آیکون SVG داخلی (بدون ایموجی)
- صفحهٔ اصلی، لیست محصولات با فیلتر/سورت/صفحه‌بندی، جزئیات محصول، سبد، تسویهٔ چندمرحله‌ای، علاقه‌مندی، مقایسه، ورود/ثبت‌نام + OTP، داشبورد کاربر، درباره/تماس/سوالات/قوانین و ۴۰۴
- **دو حالت داده:** `demo` (کاملاً سمت کلاینت، مناسب دموی GitHub Pages) و `api` (اتصال به بک‌اند)
- شخصی‌سازی پوسته (رنگ سازمانی، حالت روشن/تیره، گوشه‌ها) بدون دست‌زدن به کد
- بک‌اند REST با JWT، SQLite و قابلیت سید دادهٔ نمونه

## ساختار
```
vian-shop/
├── frontend/            # فرانت‌اند استاتیک (بدون بیلد)
│   ├── index.html
│   └── assets/{css,js}
├── backend/             # API با Express + SQLite
│   ├── server.js
│   ├── db/  ·  routes/  ·  middleware/
│   └── package.json
└── docs/CUSTOMIZATION.md
```

## راه‌اندازی سریع

### فرانت‌اند (حالت دمو — بدون بک‌اند)
فقط `frontend/` را روی هر سرور استاتیک بگذارید یا:
```bash
cd frontend
python3 -m http.server 8080
# یا:  npx serve .
```
و `http://localhost:8080` را باز کنید.

### بک‌اند
```bash
cd backend
npm install
npm run seed     # پر کردن دیتابیس با دادهٔ نمونه
npm run dev      # اجرا روی http://localhost:4000
```

### اتصال فرانت به بک‌اند
در `frontend/assets/js/config.js`:
```js
mode: 'api',
apiBase: 'http://localhost:4000/api',
```

## شخصی‌سازی برای مشتری
تمام هویت برند، رنگ‌ها، محصولات و محتوا از دو فایل تغذیه می‌شود:
- `frontend/assets/js/config.js` — برند، تماس، منو، روش‌های ارسال/پرداخت
- `frontend/assets/js/data.js` — دسته‌ها و محصولات (حالت دمو)

راهنمای کامل: [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)

## API
| متد | مسیر | توضیح | نیاز به توکن |
|---|---|---|---|
| POST | `/api/auth/register` | ثبت‌نام | — |
| POST | `/api/auth/login` | ورود | — |
| GET | `/api/auth/me` | کاربر فعلی | ✅ |
| GET | `/api/products` | لیست + فیلتر | — |
| GET | `/api/products/:id` | جزئیات | — |
| GET | `/api/categories` | دسته‌ها | — |
| GET/POST | `/api/reviews/product/:id` | دیدگاه‌ها | ✅ (ثبت) |
| GET/POST | `/api/orders` | سفارش‌ها | ✅ |
| PUT | `/api/users/me` | ویرایش پروفایل | ✅ |

## دیپلوی
- **فرانت:** به‌صورت خودکار با GitHub Actions روی GitHub Pages (فایل `.github/workflows/deploy.yml`).
- **بک‌اند:** روی Railway / Render / Fly.io (یک سرویس Node + یک فایل SQLite).

## لایسنس
MIT — برای استفادهٔ تجاری و شخصی‌سازی برای مشتری آزاد است.

</div>