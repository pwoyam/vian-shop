import { Router } from 'express';
import { db } from '../db/database.js';
const r = Router();
r.get('/', (req, res) => {
  const cats = db.prepare(`
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c LEFT JOIN products p ON p.category_id=c.id
    GROUP BY c.id`).all();
  res.json(cats);
});
export default r;