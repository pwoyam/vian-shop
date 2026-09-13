import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import products from './routes/products.js';
import categories from './routes/categories.js';
import reviews from './routes/reviews.js';
import orders from './routes/orders.js';
import users from './routes/users.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/reviews', reviews);
app.use('/api/orders', orders);
app.use('/api/users', users);

app.use((req, res) => res.status(404).json({ error: 'not_found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'server_error' }); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✓ Vian API running on http://localhost:${PORT}`));