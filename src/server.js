import express from 'express';

import cors from 'cors';
import { pinoHttp } from 'pino-http';
import pino from 'pino';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import contactsRouter from './routers/contacts.js';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth.js';
import router from './routers/index.js';

export const setupServer = () => {
  const app = express();

  const logger = pino();

  app.use(
    express.json({
      type: ['application/json', 'application/vnd.api+json'],
      limit: '1mb',
    }),
  );
  app.use(cors());
  app.use(pinoHttp({ logger }));
  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(router);
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
};
