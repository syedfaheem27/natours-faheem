const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const ownPromisify = require('../utils/myOwnPromisify');
const sendEmail = require('../utils/email');

function createSendToken(user, statusCode, res, sendUser) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //ensuring that the password is not sent along
  user.password = undefined;

  if (sendUser) {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } else {
    res.status(statusCode).json({
      status: 'success',
      token,
    });
  }
}

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const {
    name,
    password,
    email,
    passwordConfirm,
    photo,
    passwordChangedAt,
    role,
  } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo,
    passwordChangedAt,
    role,
  });

  createSendToken(newUser, 201, res, true);
});

exports.logIn = catchAsync(async (req, res, next) => {
  //1. Check if user and email is there in the payload
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Password or email can't be blank", 400));

  //2. Check in the database if the user exists and if that exists, then match the password
  //of that user with the incoming password
  const user = await User.findOne({ email }).select('+password');
  const isCorrect = (await user?.correctPassword(password)) ?? false;

  //If user is not found or the password is incorrect, return
  if (!user || !isCorrect)
    return next(new AppError('Email or Password is not valid', 401));

  //If everything is correct, generate a token and send it along
  createSendToken(user, 200, res, false);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1.  Check if there is a token in the request headers
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in. Please login to get access', 401),
    );

  //2.  Verify the token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  //3.  Check if the user exists - user can delete the account after the token
  //was generated initially

  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new AppError(
        'The user registered for this token no longer exists. Kindly signup again.',
        401,
      ),
    );

  //4.  Check if the user didn't change password after the token was issued
  if (freshUser.hasChangedPassword(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401),
    );
  }
  //5.  Grant access to protected route
  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You are not authorized to perform this access', 403),
      );

    next();
  };

//Adding the password reset functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Check if there is a username
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError('The username for that email does not exist.', 404),
    );
  //2.  Generate a token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    //3. Send the token to the mail id of the user
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password. Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}
     If you didn't forget your password, please igonore this email!`;

    await sendEmail({
      email: user.email,
      subject: 'Password reset token (valid for 10 mins.)',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was a problem sending the email! Try again after sometime.',
        500,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'The reset token was sent to your email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.  Get the token and encrypt it so that we can compare it with the token stored in the DB
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //2.  Check if the token is valid - either the user for that token exists or the token has not expired
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(
      new AppError('The token is either invalid or has expired.', 400),
    );

  //3.  Reset the password for that user and save the document
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //4.  Log the user in, create and send JWt
  createSendToken(user, 200, res, false);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get user from the collection
  const user = await User.findById(req.user._id).select('+password');

  //2.  Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent)))
    return next(new AppError('The current password is not a valid one.', 401));

  //3.  Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4.Log in the user - send JWT
  createSendToken(user, 200, res, false);
});
