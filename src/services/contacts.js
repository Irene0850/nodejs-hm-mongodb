import Contact from '../models/contact.js';

export const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.log('Error finding contact be ID:', error);
    throw error;
  }
};

export const getAllContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    throw error;
  }
};

export const createContact = async (contactData) => {
  try {
    const newContact = new Contact(contactData);
    return newContact.save();
  } catch (error) {
    throw new Error('Error saving contact to database');
  }
};

export const updateContactById = async (contactId, updateData) => {
  try {
    return Contact.findByIdAndUpdate(contactId, updateData, { new: true });
  } catch (error) {
    throw new Error('Error updating contact in database');
  }
};

export const deleteContactById = async (contactId) => {
  try {
    return Contact.findByIdAndDelete(contactId);
  } catch (error) {
    throw new Error('Error deleting contact fron database');
  }
};
