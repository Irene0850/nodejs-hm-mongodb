import {
  createContact,
  deleteContactById,
  getAllContacts,
  getContactById,
  updateContactById,
} from '../services/contacts.js';

import createHttpError from 'http-errors';

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
    const contact = await getAllContacts();

    res.status(200).json({
      status: 200,
      message: 'Successfully retrieved all contacts!',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;
    if (!name || !phoneNumber || !contactType) {
      throw createHttpError(
        400,
        'Name, phoneNumber and contactType are required',
      );
    }

    const newContact = await createContact({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
    });

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
    next(error);
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
