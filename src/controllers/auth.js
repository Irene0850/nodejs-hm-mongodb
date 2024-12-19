import { loginUser, registerUser } from '../services/auth';

export const registerUserController = async (req, res) => {
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

export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const session = await loginUser(email, password);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: session.refreshTokenValidUntil,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken: session.accessToken },
    });
  } catch (error) {
    next(error);
  }
};
