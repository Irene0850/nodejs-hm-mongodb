import { SORT_ORDER } from '../contacts/index.js';
import { Contact } from '../db/models/Contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.error('Error finding contact be ID:', error);
    throw error;
  }
};

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactQuery = Contact.find();

  if (typeof filter.type !== 'undefined') {
    contactQuery.where('contactType').equals(filter.type);
  }
  if (typeof filter.isFavourite !== 'undefined') {
    contactQuery.where('isFavourite').equals(filter.isFavourite);
  }

  contactQuery.where('userId').equals(userId);

  const [contactCount, contacts] = await Promise.all([
    Contact.find().merge(contactQuery).countDocuments(),
    contactQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactsById = (contactId, userId) =>
  Contact.findOne({ _id: contactId, userId });

export const createContact = (payload) => {
  return Contact.create(payload);
};

export const updateContactById = async (contactId, payload, userId) => {
  return Contact.findOneAndUpdate({ _id: contactId, userId }, payload, {
    new: true,
  });
};

export const deleteContactById = async (contactId, userId) => {
  return Contact.findOneAndDelete({
    _id: contactId,
    userId,
  });
};
