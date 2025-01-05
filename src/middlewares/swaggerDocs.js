import { SWAGGER_PATH } from '../contacts/index.js';
import swaggerUI from 'swagger-ui-express';
import fs from 'node:fs';
import createHttpError from 'http-errors';

export const swaggerDocs = () => {
  try {
    const swaggerDocument = JSON.parse(
      fs.readFileSync(SWAGGER_PATH).toString(),
    );
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDocument)];
  } catch (err) {
    return (req, res, next) =>
      next(createHttpError(500, 'Can`t load swagger docs'));
  }
};
