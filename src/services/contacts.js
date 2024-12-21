import { SORT_ORDER } from '../contacts/index.js';
import Contact from '../models/Contact.js';
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

  const [contactCount, contacts] = await Promise.all([
    Contact.find().merge(contactQuery).countDocuments(),
    contactQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const formattedContacts = contacts.map((contact) => ({
    _id: contact._id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    contactType: contact.contactType,
    isFavourite: contact.isFavourite,
  }));

  const paginationData = calculatePaginationData(contactCount, perPage, page);

  return {
    data: formattedContacts,
    ...paginationData,
  };
};

export const createContact = async (contactData) => {
  try {
    const newContact = new Contact(contactData);
    return newContact.save();
  } catch (error) {
    console.error('Error saving new contact:', error);
    throw new Error('Error saving contact to database');
  }
};

export const updateContactById = async (contactId, updateData) => {
  try {
    return Contact.findByIdAndUpdate(contactId, updateData, { new: true });
  } catch (error) {
    console.error('Error updating contact:', error);
    throw new Error('Error updating contact in database');
  }
};

export const deleteContactById = async (contactId) => {
  try {
    return Contact.findByIdAndDelete(contactId);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw new Error('Error deleting contact from database');
  }
};
