import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { Session } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  TEMPLATES_DIR,
  THIRTY_DAYS,
} from '../contacts/index.js';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { env } from '../utils/env.js';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import { sendEmail } from '../utils/sendMail.js';
import { SMTP } from '../contacts/index.js';

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

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newAccessSession = createUserSession();

  return await Session.create({
    userId: session.userId,
    ...newAccessSession,
  });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'Used not found');

  const resetToken = jwt.sign({ sub: user._id, email }, env('JWT_SECRET'), {
    expiresIn: '5m',
  });

  const templatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');
  const templateSource = await fs.readFile(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password&token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (err) {
    throw createHttpError(500, `Failed to send the email: ${err.message}`);
  }
};

export const resetPassword = async (payload) => {
  let decodedToken;

  try {
    decodedToken = jwt.verify(payload.token, env('JWT_SECRET'));
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw createHttpError(401, 'Token is expired or invalid');
    }
    throw error;
  }

  const user = await UsersCollection.findOne({
    email: decodedToken.email,
    _id: decodedToken.sub,
  });

  if (!user) throw createHttpError(404, 'User not found');

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  await UsersCollection.updateOne(
    { _id: user._id },
    { password: hashedPassword },
  );
};
