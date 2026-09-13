import { Router } from 'express';
import { db } from '../db/database.js';
const r = Router();

r.get('/', (req, res) => {
  const { cat, q, sort='pop', min, max, off, avail, brand, page=1, per=9 } = req.query;
  let where = [], params = [];
  if (cat) { where.push('category_id=?'); params.push(cat); }
  if (q) { where.push('(name LIKE ? OR brand LIKE ? OR description LIKE ?)'); const s=`%${q}%`; params.push(s,s,s); }
  if (off==='1') where.push('old_price>0');
  if (avail==='1') where.push('stock>0');
  if (brand) { where.push('brand=?'); params.push(brand); }
  if (min) { where.push('price>=?'); params.push(+min); }
  if (max) { where.push('price<=?'); params.push(+max); }
  const w = where.length ? 'WHERE '+where.join(' AND ') : '';
  const sorts = { new:'is_new DESC', cheap:'price ASC', exp:'price DESC', pop:'rating_count DESC', rate:'rating DESC' };
  const order = sorts[sort] || 'is_featured DESC, rating DESC';
  const total = db.prepare(`SELECT COUNT(*) c FROM products ${w}`).get(...params).c;
  const items = db.prepare(`SELECT * FROM products ${w} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...params, +per, (+page-1)*+per);
  res.json({ items: items.map(hydrate), total, page:+page, per:+per });
});

r.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json(hydrate(p));
});

r.get('/:id/related', (req, res) => {
  const p = db.prepare('SELECT category_id FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.json([]);
  const items = db.prepare('SELECT * FROM products WHERE category_id=? AND id!=? LIMIT 4')
    .all(p.category_id, req.params.id);
  res.json(items.map(hydrate));
});

function hydrate(p){ return { ...p, specs: JSON.parse(p.specs||'[]'), sizes: JSON.parse(p.sizes||'[]') }; }
export default r;