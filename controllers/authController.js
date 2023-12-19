const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ownPromisify = require('../utils/myOwnPromisify');
// const myOwnPromisify = require('../utils/myOwnPromisify');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  //problem with this as a user can enter his/her role as an admin
  //and get access to protected routes
  // const newUser = await User.create(req.body);

  const { name, password, email, passwordConfirm, photo, passwordChangedAt } =
    req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo,
    passwordChangedAt,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
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

  //own promisify
  // const verifyFn = myOwnPromisify(jwt.verify);
  // const decoded = await verifyFn(token, process.env.JWT_SECRET_KEY);

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  //3.  Check if the user exists - user can delete the account after the token
  //was generated initially

  const freshUser = await User.findById(decoded.id);

  //4.  Check if the user didn't change password after the token was issued
  if (!freshUser.hasChangedPassword(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401),
    );
  }
  //5.
  req.user = freshUser;
  next();
});
