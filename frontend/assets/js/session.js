import { state, save } from './store.js';
import { syncBadges } from './store.js';
import { toast } from './utils.js';

export const OTP = { code: '', email: '', name: '', pass: '', timer: null, sec: 0, mode: 'reg' };

export function loginUser(name, email) {
  state.user = { name: name || 'کاربر مهمان', email: email || 'demo@vian.shop', phone: '09120000000' };
  if (!state.orders.length) seedAccount();
  save(); syncBadges();
  toast('خوش آمدید' + (name ? '، ' + name : '') + '!');
  const idx = location.hash.indexOf('?');
  const next = idx > -1 ? new URLSearchParams(location.hash.slice(idx + 1)).get('next') : null;
  location.hash = next ? '#/' + next : '#/account';
}

export function seedAccount() {
  state.orders = [
    { id: 'VN-۲۴۸۱', date: '۲۵ مهر ۱۴۰۴', status: 3, items: [{ id: 'p1', qty: 1, color: 'مشکی' }, { id: 'p21', qty: 2, color: '' }], total: 3270000, ship: 0, addr: { name: 'نگین کریمی', city: 'تهران', addr: 'ولیعصر، برج نمونه' }, shipM: 'پست پیشتاز', pay: 'درگاه آنلاین' },
    { id: 'VN-۲۵۱۷', date: '۱۲ آبان ۱۴۰۴', status: 1, items: [{ id: 'p18', qty: 1, color: '', size: '۴۲' }], total: 2025000, ship: 45000, addr: { name: 'نگین کریمی', city: 'تهران', addr: 'ولیعصر، برج نمونه' }, shipM: 'پست پیشتاز', pay: 'درگاه آنلاین' }
  ];
  state.addrs = [
    { id: 'a1', title: 'خانه', name: 'نگین کریمی', phone: '09120000000', city: 'تهران', postal: '1435856781', address: 'خیابان ولیعصر، برج نمونه، طبقهٔ ۱۲، واحد ۴', def: true },
    { id: 'a2', title: 'محل کار', name: 'نگین کریمی', phone: '09120000000', city: 'تهران', postal: '1587943210', address: 'خیابان آزادی، مجتمع اداری پارس، بلوک B', def: false }
  ];
  state.notifs = [
    { id: 'n1', icon: 'truck', title: 'سفارش در حال ارسال', desc: 'محمولهٔ سفارش VN-۲۵۱۷ به پست تحویل شد.', date: '۲ روز پیش', read: false },
    { id: 'n2', icon: 'gift', title: 'تخفیف اختصاصی شما', desc: '۱۵٪ تخفیف دستهٔ زیبایی فعال شد.', date: '۴ روز پیش', read: false },
    { id: 'n3', icon: 'package', title: 'سفارش تحویل شد', desc: 'سفارش VN-۲۴۸۱ تحویل گردید.', date: '۳ هفته پیش', read: true }
  ];
}