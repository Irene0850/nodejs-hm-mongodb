import {
  createContact,
  deleteContactById,
  getAllContacts,
  getContactById,
  updateContactById,
} from '../services/contacts.js';

import createHttpError from 'http-errors';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);
  const { type, isFavourite } = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortOrder,
    sortBy,
    filter: { type, isFavourite },
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContact = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await getContactById(contactId);
    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const allContacts = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortOrder, sortBy } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const { data, totalItems, totalPages, hasNextPage, hasPreviousPage } =
      await getAllContacts({
        page,
        perPage,
        sortBy,
        sortOrder,
        filter,
      });

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data,
        page,
        perPage,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    const newContact = await createContact(req.body);
    const contactWithoutVersion = newContact.toObject();
    delete contactWithoutVersion._v;

    res.status(201).json({
      status: 201,
      message: 'Contact created successfully',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const updateData = req.body;

  try {
    const updateContact = await updateContactById(contactId, updateData);

    if (!updateContact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact',
      data: updateContact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    next(createHttpError(500, 'Internal Server Error'));
  }
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const deletedContact = await deleteContactById(contactId);
    if (!deletedContact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
