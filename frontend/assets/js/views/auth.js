import { I, IF } from '../icons.js';
import { esc, fa } from '../utils.js';
import { CONFIG } from '../config.js';
import { state } from '../store.js';
import { OTP } from '../session.js';

export function authView(mode) {
  if (state.user && mode !== 'otp') { location.hash = '#/account'; return; }
  const shell = inner => '<div class="wrap" style="padding-block:46px"><div class="auth-g rv on">' +
    '<div class="auth-side"><div><span class="logo" style="color:var(--bg)"><span class="mark">' + CONFIG.brand.first + '</span>' + CONFIG.brand.name + '</span>' +
    '<h3 style="margin-top:22px">به ' + CONFIG.brand.name + ' خوش آمدید</h3></div>' +
    '<ul>' + ['پیگیری لحظه‌ای سفارش‌ها', 'ذخیرهٔ علاقه‌مندی‌ها و سبد', 'تخفیف‌های اختصاصی اعضا', 'پرداخت سریع‌تر با آدرس‌های ذخیره‌شده'].map(x => '<li>' + I('checkC', 16) + ' ' + x + '</li>').join('') + '</ul></div>' +
    '<div class="auth-form">' + inner + '</div></div></div>';
  const tabs = cur => '<div class="auth-tabs"><button class="' + (cur === 'login' ? 'on' : '') + '" onclick="location.hash=\'#/auth/login\'">ورود</button><button class="' + (cur === 'register' ? 'on' : '') + '" onclick="location.hash=\'#/auth/register\'">ثبت‌نام</button></div>';

  if (mode === 'login') document.querySelector('#view').innerHTML = shell(tabs('login') +
    '<form data-form="login">' +
    '<div class="field"><label>ایمیل یا موبایل <em>*</em></label><input class="inp" name="email" required placeholder="you@email.com"><span class="fmsg">ایمیل یا موبایل را وارد کنید</span></div>' +
    '<div class="field"><label>رمز عبور <em>*</em></label><input class="inp" type="password" name="pass" required placeholder="••••••••"><span class="fmsg">رمز عبور حداقل ۶ کاراکتر</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:18px;font-size:13px"><label class="check" style="padding:0"><input type="checkbox" checked><span class="cbx">' + IF('check', 11) + '</span> مرا به خاطر بسپار</label><a href="#/auth/forgot" style="color:var(--accent);font-weight:700">فراموشی رمز؟</a></div>' +
    '<button class="btn btn-p btn-lg" style="width:100%" type="submit">ورود به حساب</button>' +
    '<button class="btn btn-o btn-lg" style="width:100%;margin-top:10px" type="button" data-act="demo-login">' + I('zap', 16) + ' ورود سریع دمو</button></form>');
  else if (mode === 'register') document.querySelector('#view').innerHTML = shell(tabs('register') +
    '<form data-form="register">' +
    '<div class="field"><label>نام و نام خانوادگی <em>*</em></label><input class="inp" name="name" required placeholder="مثلاً: نگین کریمی"><span class="fmsg">نام را وارد کنید</span></div>' +
    '<div class="field"><label>ایمیل <em>*</em></label><input class="inp ltr" style="text-align:right" type="email" name="email" required placeholder="you@email.com"><span class="fmsg">ایمیل معتبر وارد کنید</span></div>' +
    '<div class="field"><label>رمز عبور <em>*</em></label><input class="inp" type="password" name="pass" required placeholder="حداقل ۶ کاراکتر"><span class="fmsg">رمز عبور حداقل ۶ کاراکتر</span></div>' +
    '<label class="check" style="margin-bottom:16px"><input type="checkbox" name="terms" required><span class="cbx">' + IF('check', 12) + '</span> <span><a href="#/terms" style="color:var(--accent)">شرایط و قوانین</a> را می‌پذیرم</span></label>' +
    '<button class="btn btn-p btn-lg" style="width:100%" type="submit">ایجاد حساب و دریافت کد تأیید</button></form>');
  else if (mode === 'forgot') document.querySelector('#view').innerHTML = shell(
    '<h3 style="font-size:20px;margin-bottom:8px">' + I('lock', 22) + ' بازیابی رمز عبور</h3>' +
    '<p style="color:var(--muted);font-size:13.5px;margin-bottom:22px">ایمیل خود را وارد کنید تا کد تأیید ارسال شود.</p>' +
    '<form data-form="forgot"><div class="field"><label>ایمیل <em>*</em></label><input class="inp ltr" style="text-align:right" type="email" name="email" required placeholder="you@email.com"><span class="fmsg">ایمیل معتبر وارد کنید</span></div>' +
    '<button class="btn btn-p btn-lg" style="width:100%" type="submit">ارسال کد تأیید</button>' +
    '<a class="btn btn-g" style="width:100%;margin-top:8px" href="#/auth/login">بازگشت به ورود</a></form>');
  else if (mode === 'otp') {
    OTP.code = String(Math.floor(10000 + Math.random() * 89999)); OTP.sec = 90; startOtpTimer();
    document.querySelector('#view').innerHTML = shell(
      '<h3 style="font-size:20px;margin-bottom:8px">' + I('msg', 22) + ' کد تأیید را وارد کنید</h3>' +
      '<p style="color:var(--muted);font-size:13.5px">کد ۵ رقمی به <b>' + esc(OTP.email || 'ایمیل شما') + '</b> ارسال شد.</p>' +
      '<div class="demo-code">' + I('info', 14) + ' نسخهٔ دمو — کد تأیید: <b class="ltr">' + OTP.code + '</b></div>' +
      '<div class="otp-row" id="otpRow">' + [0, 1, 2, 3, 4].map(i => '<input maxlength="1" inputmode="numeric" aria-label="رقم ' + fa(i + 1) + '">').join('') + '</div>' +
      '<button class="btn btn-p btn-lg" style="width:100%" data-act="otp-verify">تأیید کد</button>' +
      '<div style="text-align:center;margin-top:16px;font-size:13px;color:var(--muted)"><span id="otpTimer">ارسال مجدد کد تا <b>' + fa(90) + '</b> ثانیه دیگر</span></div>');
    const arr = Array.prototype.slice.call(document.querySelectorAll('#otpRow input'));
    arr.forEach((inp, i) => {
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, ''); if (inp.value && i < 4) arr[i + 1].focus(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && i > 0) arr[i - 1].focus(); });
    });
  }
}
function startOtpTimer() {
  clearInterval(OTP.timer);
  OTP.timer = setInterval(() => {
    OTP.sec--; const el = document.getElementById('otpTimer');
    if (!el) { clearInterval(OTP.timer); return; }
    if (OTP.sec <= 0) { el.innerHTML = '<button style="color:var(--accent);font-weight:800" data-act="otp-resend">ارسال مجدد کد</button>'; clearInterval(OTP.timer); }
    else el.innerHTML = 'ارسال مجدد کد تا <b>' + fa(OTP.sec) + '</b> ثانیه دیگر';
  }, 1000);
}
window.__startOtpTimer = startOtpTimer;