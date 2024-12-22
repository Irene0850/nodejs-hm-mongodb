import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { Session } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../contacts/index.js';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

export const registerUser = async (payload) => {
  try {
    const user = await UsersCollection.findOne({ email: payload.email });

    console.log(user);

    if (user) {
      throw createHttpError(409, 'Email already in use');
    }

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    } else {
      throw createHttpError(400, 'Password is required');
    }

    const newUser = await UsersCollection.create(payload);

    return newUser;
  } catch (error) {
    console.log(error);
    throw createHttpError(500, 'Failed to register user', { cause: error });
  }
};

export const loginUser = async (email, password) => {
  const user = await UsersCollection.findOne({ email });

  if (user === null) throw createHttpError(404, 'User not found');

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) throw createHttpError(401, 'Unauthorized');

  await Session.deleteOne({ userId: user._id });

  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' },
  );

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    refreshTokenValidUntil: session.refreshTokenValidUntil,
  };
};

export const logoutUser = async (sessionId) => {
  const session = await Session.findOne({ _id: sessionId });
  if (!session) {
    throw createHttpError(404, 'Session not found');
  }
  await Session.deleteOne({ _id: sessionId });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) throw createHttpError(401, 'Invalid session or refresh token');

  if (new Date() > session.refreshTokenValidUntil) {
    await Session.deleteOne({ _id: sessionId });
    throw createHttpError(401, 'Refresh token expired');
  }

  await Session.deleteOne({ _id: sessionId });

  const newAccessToken = randomBytes(15).toString('base64');
  const newRefreshToken = randomBytes(30).toString('base64');

  const newSession = await Session.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
    refreshTokenValidUntil: newSession.refreshTokenValidUntil,
    _id: newSession._id,
  };
};
