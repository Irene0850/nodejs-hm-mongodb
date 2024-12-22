import createHttpError from 'http-errors';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../services/auth.js';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcryptjs';

export const registerUserController = async (req, res, next) => {
  try {
    const existingUser = await UsersCollection.findOne({
      email: req.body.email,
    });

    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: 'User already exists with this email',
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const payload = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };

    const user = await registerUser(payload);

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Email and password are required',
      });
    }

    const session = await loginUser(email, password);

    if (!session) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid email or password',
      });
    }

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: session.refreshTokenValidUntil,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken: session.accessToken },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: session.refreshTokenValidUntil,
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
