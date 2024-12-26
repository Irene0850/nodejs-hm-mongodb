import createHttpError from 'http-errors';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetToken,
} from '../services/auth.js';

export const registerUserController = async (req, res, next) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const user = await registerUser(payload);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const session = await loginUser(email, password);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res, next) => {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const refreshUserSessionController = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      throw createHttpError(400, 'Missing session or refresh token');
    }

    const session = await refreshUserSession({ sessionId, refreshToken });

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      expires: session.refreshTokenValidUntil,
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      sameSite: 'strict',
      expires: session.refreshTokenValidUntil,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken: session.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const requestResetEmailController = async (req, res) => {
  try {
    await requestResetToken(req.body.email);
    res.json({
      message: 'Reset password email has been successfully sent',
      status: 200,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to send reset password email',
      error: error.message,
    });
  }
};
