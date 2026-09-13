import { Router } from 'express';
import { db } from '../db/database.js';
import { authRequired } from '../middleware/auth.js';
const r = Router();

r.post('/', authRequired, (req, res) => {
  const { items, total, shipping, ship_method, pay_method, address } = req.body || {};
  if (!items || !total) return res.status(400).json({ error: 'missing_fields' });
  const id = 'VN-' + Math.floor(1000 + Math.random()*9000);
  db.prepare(`INSERT INTO orders (id,user_id,items,total,shipping,ship_method,pay_method,address)
              VALUES (?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, JSON.stringify(items), total, shipping||0, ship_method, pay_method, JSON.stringify(address||{}));
  db.prepare('INSERT INTO notifications (user_id,icon,title,body) VALUES (?,?,?,?)')
    .run(req.user.id, 'package', 'سفارش شما ثبت شد', 'سفارش '+id+' در حال پردازش است.');
  res.json({ id });
});

r.get('/', authRequired, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address||'{}') })));
});

r.get('/:id', authRequired, (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!o) return res.status(404).json({ error: 'not_found' });
  res.json({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address||'{}') });
});
export default r;