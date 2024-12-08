import { Router } from 'express';

import {
  allContacts,
  createContactController,
  deleteContactController,
  getContact,
  updateContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidid.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contactValidation.js';

const router = Router();

router.get('/', ctrlWrapper(allContacts));

router.get('/:contactId', isValidId, ctrlWrapper(getContact));

router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);

router.patch(
  '/:contactId',
  validateBody(updateContactSchema),
  ctrlWrapper(updateContactController),
);

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));

export default router;
