import {
  createContact,
  deleteContactById,
  getAllContacts,
  getContactsById,
  updateContactById,
} from '../services/contacts.js';

import createHttpError from 'http-errors';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { env } from '../utils/env.js';

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortOrder, sortBy } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);
    const userId = req.user._id;
    const contacts = await getAllContacts({
      page,
      perPage,
      sortOrder,
      sortBy,
      filter,
      userId,
    });

    res.json({
      status: 200,
      message: `Successfully found contacts for ${req.user.name}!`,
      data: contacts,
    });
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};

export const getContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await getContactsById(contactId, userId);

    if (!contact) {
      return next(createHttpError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}`,
      data: contact,
    });
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};

export const createContactController = async (req, res, next) => {
  const userId = req.user._id;
  const photo = req.file;
  let photoUrl;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const createdContact = await createContact({
    ...req.body,
    userId,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created new contact',
    data: createdContact,
  });
};

export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;
    const photo = req.file;

    let photoUrl;

    if (photo) {
      if (env('ENABLE_CLOUDINARY') === 'true') {
        photoUrl = await saveFileToCloudinary(photo);
      } else {
        photoUrl = await saveFileToUploadDir(photo);
      }
    }

    const updatePayload = {
      ...req.body,
      ...(photoUrl && { photo: photoUrl }),
    };

    const result = await updateContactById(contactId, userId, updatePayload);

    if (!result) {
      throw createHttpError(404, 'Contact not found');
    }

    res.json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: result,
    });
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await deleteContactById(contactId, userId);

    if (!contact) {
      return next(createHttpError(404, 'Contact not found!'));
    }
    res
      .status(204)
      .json({
        status: 204,
        message: 'Successfully deleted contact!',
      })
      .end();
  } catch (error) {
    next(createHttpError(500, error.message));
  }
};
