import express from 'express';

import cors from 'cors';
import { allContacts, getContact } from './controllers/contacts.js';
import { pinoHttp } from 'pino-http';
import pino from 'pino';

export const setupServer = () => {
  const app = express();

  const logger = pino();

  app.use(express.json());
  app.use(cors());
  app.use(pinoHttp({ logger }));

  app.get('/contacts/:contactId', getContact);
  app.get('/contacts', allContacts);

  app.use((req, res, next) => {
    res.status(404).json({ message: 'NOT FOUND' });
  });
  console.log('SERVER SETUP COMPLETE');

  return app;
};
