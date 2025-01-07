import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Something went wrong',
  });
};
