import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { sign, authRequired } from '../middleware/auth.js';

const r = Router();

r.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });
  if (String(password).length < 6) return res.status(400).json({ error: 'password_too_short' });
  if (db.prepare('SELECT id FROM users WHERE email=?').get(email))
    return res.status(409).json({ error: 'email_exists' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)').run(name, email, hash);
  const user = { id: info.lastInsertRowid, name, email };
  res.json({ token: sign(user), user });
});

r.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email || '');
  if (!user || !bcrypt.compareSync(password || '', user.password_hash))
    return res.status(401).json({ error: 'invalid_credentials' });
  res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

r.get('/me', authRequired, (req, res) => {
  const u = db.prepare('SELECT id,name,email,phone,created_at FROM users WHERE id=?').get(req.user.id);
  if (!u) return res.status(404).json({ error: 'not_found' });
  res.json(u);
});

export default r;