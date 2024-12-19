import bcrypt from 'bcrypt';
import { UsersCollection } from '../models/User.js';
import createHttpError from 'http-errors';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });

  if (user !== null) {
    throw createHttpError(409, 'Email already in use');
  }
  payload.password = await bcrypt.hash(payload.password, 10);

  return UsersCollection.create(payload);
};
