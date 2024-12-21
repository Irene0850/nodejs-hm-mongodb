import { Router } from 'express';
import express from 'express';

import {
  createContactController,
  deleteContactController,
  getContact,
  getContactsController,
  updateContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';

import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contactValidation.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authorization } from '../middlewares/authorization.js';

const router = Router();

const jsonParser = express.json();

router.use(authorization);

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', authorization, isValidId, ctrlWrapper(getContact));

router.post(
  '/',
  authorization,
  jsonParser,
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);

router.patch(
  '/:contactId',
  authorization,
  isValidId,
  jsonParser,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContactController),
);

router.delete(
  '/:contactId',
  authorization,
  isValidId,
  ctrlWrapper(deleteContactController),
);

export default router;
