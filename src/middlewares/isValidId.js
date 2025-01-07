import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';

export const isValidId =
  (idName = 'id') =>
  (req, res, next) => {
    const id = req.params[idName];

    if (!id) {
      throw createHttpError(400, `Id parameter ${idName} is required`);
    }
    if (!isValidObjectId(id)) {
      return next(createHttpError(400, 'Invalid contact ID'));
    }
    return next();
  };
