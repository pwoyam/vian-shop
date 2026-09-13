import { Router } from 'express';
import { db } from '../db/database.js';
import { authRequired } from '../middleware/auth.js';
const r = Router();

r.get('/product/:id', (req, res) => {
  res.json(db.prepare('SELECT * FROM reviews WHERE product_id=? ORDER BY created_at DESC').all(req.params.id));
});

r.post('/product/:id', authRequired, (req, res) => {
  const { rating, body } = req.body || {};
  if (!rating || !body) return res.status(400).json({ error: 'missing_fields' });
  db.prepare('INSERT INTO reviews (product_id,user_id,name,rating,body,verified) VALUES (?,?,?,?,?,1)')
    .run(req.params.id, req.user.id, req.user.name, +rating, body);
  res.json({ ok: true });
});
export default r;