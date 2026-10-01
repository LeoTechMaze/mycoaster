import 'express-async-errors';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import env from './config/env';
import './config/firebase';

import db from './config/database';
import redis from './config/redis';
import errorHandler from './middlewares/errorHandler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/v1', routes);

app.get('/health', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', postgres: 'up', redis: 'up' });
  } catch (err: any) {
    res.status(503).json({ status: 'degraded', error: err.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export = app;
