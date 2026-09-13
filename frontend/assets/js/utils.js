import { THEMES } from './config.js';
import { state, save } from './store.js';

export function $(s) { return document.querySelector(s); }
export function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
export function fa(n) { try { return Number(n).toLocaleString('fa-IR'); } catch (e) { return String(n); } }
export function faD(n, d) { try { return Number(n).toLocaleString('fa-IR', { maximumFractionDigits: d == null ? 1 : d }); } catch (e) { return String(n); } }
export function toman(n) { return fa(n) + ' <small>تومان</small>'; }
export function pctOff(p) { return Math.round((1 - p.price / p.old) * 100); }
export function uid() { return Math.random().toString(36).slice(2, 9); }
export function toTop() {
  const h = document.documentElement, old = h.style.scrollBehavior;
  h.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); h.style.scrollBehavior = old;
}
export function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function hideSplash() { const s = $('#splash'); if (s) s.classList.add('off'); }
export function showFatal(msg, src) {
  hideSplash();
  const v = $('#view'); if (!v) return;
  v.innerHTML = '<div class="fatal"><b>خطایی در اجرای قالب رخ داد</b><span>جزئیات فنی:</span><code>' +
    String(msg || 'نامشخص') + (src ? ' — ' + src : '') + '</code></div>';
}

export function toast(msg, type) {
  type = type || 'ok';
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icon = type === 'err' ? 'alert' : type === 'warn' ? 'info' : 'checkC';
  t.innerHTML = iconSvg(icon) + '<span>' + msg + '</span>';
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3400);
}
// برای جلوگیری از وابستگی حلقه‌ای، آیکون را مستقیم می‌سازیم
import { ICONS } from './icons.js';
function iconSvg(n) {
  return '<svg class="ic" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>';
}

export function openModal(html) {
  $('#modalRoot').innerHTML = '<div class="modal"><div class="mbg" data-act="modal-close"></div><div class="mbox">' + html +
    '<button class="ibtn mx" data-act="modal-close" aria-label="بستن">' + iconSvg('x') + '</button></div></div>';
}
export function closeModal() { $('#modalRoot').innerHTML = ''; }
export function confirmBox(title, desc, onOk) {
  openModal('<h4>' + iconSvg('alert') + ' ' + title + '</h4><p style="color:var(--muted);font-size:14px;margin-bottom:22px">' + desc +
    '</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-g" data-act="modal-close">انصراف</button><button class="btn btn-d" id="cfOk">تأیید</button></div>');
  $('#cfOk').onclick = () => { closeModal(); onOk(); };
}

export function applyTheme() {
  const t = state.theme, root = document.documentElement;
  root.setAttribute('data-mode', t.mode);
  const acc = t.custom || THEMES[t.preset][t.mode];
  root.style.setProperty('--accent', acc);
  root.style.setProperty('--r', t.radius === 'soft' ? '12px' : t.radius === 'round' ? '17px' : '5px');
  root.style.setProperty('--r-s', t.radius === 'soft' ? '9px' : t.radius === 'round' ? '13px' : '3px');
  root.style.setProperty('--r-lg', t.radius === 'soft' ? '20px' : t.radius === 'round' ? '26px' : '9px');
  const r = parseInt(acc.slice(1, 3), 16), g = parseInt(acc.slice(3, 5), 16), b = parseInt(acc.slice(5, 7), 16);
  root.style.setProperty('--on-acc', (r * .299 + g * .587 + b * .114) > 165 ? '#1c1d18' : '#ffffff');
  $$('.tsw').forEach(el => el.classList.toggle('on', el.getAttribute('data-preset') === t.preset && !t.custom));
  $$('#tMode button').forEach(el => el.classList.toggle('on', el.getAttribute('data-mode') === t.mode));
  $$('#tRadius button').forEach(el => el.classList.toggle('on', el.getAttribute('data-r') === t.radius));
  save();
}

export const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('on');
    if (e.target.hasAttribute('data-count') && !e.target.classList.contains('cntd')) {
      e.target.classList.add('cntd'); runCount(e.target);
    }
    obs.unobserve(e.target);
  }
}), { threshold: .12 });
export function bindReveals() { $$('.rv:not(.on),[data-count]:not(.cntd)').forEach(el => obs.observe(el)); }
export function runCount(el) {
  const to = +el.getAttribute('data-count'), suf = el.getAttribute('data-suf') || '';
  const st = performance.now();
  function f(n) {
    const p = Math.min(1, (n - st) / 1400);
    el.textContent = fa(Math.round(to * (1 - Math.pow(1 - p, 3)))) + suf;
    if (p < 1) requestAnimationFrame(f);
  }
  requestAnimationFrame(f);
}