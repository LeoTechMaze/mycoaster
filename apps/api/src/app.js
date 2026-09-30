require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
require('./config/firebase');

const db = require('./config/database');
const redis = require('./config/redis');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/v1', require('./routes'));

app.get('/health', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', postgres: 'up', redis: 'up' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', error: err.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
