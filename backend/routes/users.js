import { Router } from 'express';
import { db } from '../db/database.js';
import { authRequired } from '../middleware/auth.js';
const r = Router();

r.put('/me', authRequired, (req, res) => {
  const { name, phone } = req.body || {};
  db.prepare('UPDATE users SET name=COALESCE(?,name), phone=COALESCE(?,phone) WHERE id=?')
    .run(name, phone, req.user.id);
  res.json(db.prepare('SELECT id,name,email,phone FROM users WHERE id=?').get(req.user.id));
});

r.get('/addresses', authRequired, (req, res) =>
  res.json(db.prepare('SELECT * FROM addresses WHERE user_id=?').all(req.user.id)));

r.post('/addresses', authRequired, (req, res) => {
  const a = req.body || {};
  const info = db.prepare('INSERT INTO addresses (user_id,title,name,phone,city,postal,address,is_default) VALUES (?,?,?,?,?,?,?,?)')
    .run(req.user.id, a.title, a.name, a.phone, a.city, a.postal, a.address, a.is_default?1:0);
  res.json({ id: info.lastInsertRowid });
});

r.delete('/addresses/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM addresses WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

r.get('/notifications', authRequired, (req, res) =>
  res.json(db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC').all(req.user.id)));

r.post('/notifications/read', authRequired, (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
  res.json({ ok: true });
});
export default r;