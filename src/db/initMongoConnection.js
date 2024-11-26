import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } = process.env;

const mongoURI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority&appName=contact`;

export const initMongoConnection = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MONGO CONNECTION SUCCESSFULLY ESTABLISHED!');
  } catch (error) {
    console.error('MONGO CONNECTION FAILED:', error.message);
    throw error;
  }
};
