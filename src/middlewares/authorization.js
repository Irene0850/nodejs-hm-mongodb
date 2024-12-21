import createHttpError from 'http-errors';
import { Session } from '../models/Session.js';
import { UsersCollection } from '../models/User.js';

export const authorization = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      next(createHttpError(401, 'Please provide Authorization header'));
      return;
    }
    const [bearer, token] = authHeader.split(' ');

    if (bearer.toLowerCase() !== 'bearer' || !token) {
      return next(createHttpError(401, 'Auth header should be of type Bearer'));
    }

    const session = await Session.findOne({
      accessToken: token,
    });

    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);

    if (isAccessTokenExpired) {
      return next(createHttpError(401, 'Access token expired'));
    }

    const user = await UsersCollection.findById(session.userId);

    if (!user) {
      return next(createHttpError(401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(createHttpError(500, 'Internal server error', { cause: error }));
  }
};
