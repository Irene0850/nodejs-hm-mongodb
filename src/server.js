import express from 'express';

import cors from 'cors';
import { pinoHttp } from 'pino-http';
import pino from 'pino';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import contactsRouter from './routers/contacts.js';

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

  app.use('/contacts', contactsRouter);
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};
