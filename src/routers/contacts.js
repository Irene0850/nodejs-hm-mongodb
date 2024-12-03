import { Router } from 'express';

import {
  allContacts,
  createContactController,
  deleteContactController,
  getContact,
  updateContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/', ctrlWrapper(allContacts));

router.get('/:contactId', ctrlWrapper(getContact));

router.post('/', ctrlWrapper(createContactController));

router.patch('/:contactId', ctrlWrapper(updateContactController));

router.delete('/:contactId', ctrlWrapper(deleteContactController));

export default router;
