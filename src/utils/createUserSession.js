import { randomBytes } from 'crypto';

export const createUserSession = (userId) => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = Date.now() + 60 * 15 * 1000;
  const refreshTokenValidUntil = Date.now() + 60 * 60 * 24 * 30 * 1000;

  return {
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};
