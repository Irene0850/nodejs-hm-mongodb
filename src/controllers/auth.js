import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';
import { THIRTY_DAYS } from '../contacts/index.js';

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
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

const setupUserSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUserSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupUserSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken
    },
  });
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

export const resetPasswordConrtoller = async (req, res) => {
  try {
    await resetPassword(req.body);
    res.json({
      status: 200,
      message: 'Password has been successfully reset',
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Failed te reset password',
      error: err.message,
    });
  }
};
