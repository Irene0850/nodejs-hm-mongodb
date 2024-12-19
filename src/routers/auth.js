import express from 'express';
import { Router } from 'express';
import { registerUserSchema } from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserController } from '../controllers/auth.js';

const router = Router();
const jsonParser = express.json();

router.post(
  './register',
  jsonParser,
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
