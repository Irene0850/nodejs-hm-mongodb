import express from 'express';
import pino from 'pino';
import { pinoHttp } from 'pino-http';
import cors from 'cors';

const logger = pino();

const pinoMiddleware = pinoHttp({ logger });

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(pinoMiddleware());

  app.use((req, res, next) => {
    res.status(404).json({ message: 'NOT FOUND' });
  });
  console.log('SERVER SETUP COMPLETE');
  return app;
};
