import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/User.js';
import createHttpError from 'http-errors';
import { Session } from '../db/models/Session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../contacts/index.js';
import { randomBytes } from 'crypto';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (user !== null) {
    throw createHttpError(409, 'Email already in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);

  return UsersCollection.create(payload);
};

export const loginUser = async (email, password) => {
  const user = await UsersCollection.findOne({ email });

  if (user === null) throw createHttpError(404, 'User not found');

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) throw createHttpError(401, 'Unauthorized');

  await Session.deleteOne({ userId: user._id });

  const accessToken = randomBytes(15).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

const createUserSession = () => {
  const accessToken = randomBytes(15).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(401, 'Invalid session or refresh token');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    await Session.deleteOne({ _id: sessionId });
    throw createHttpError(401, 'Refresh token expired');
  }

  const newAccessSession = createUserSession();

  return await Session.create({
    userId: session.userId,
    ...newAccessSession,
  });
};
