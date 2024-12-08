const crypto = require("crypto");

const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");

const { extractValidFields } = require("../utils/extractValidFields");
const AppError = require("../utils/appError");
const { sendEmail } = require("../utils/email");
const generateJwt = require("../utils/generateJwt");
const createSendToken = require("../utils/createSendToken");

exports.signUp = catchAsync(async (req, res, next) => {
  const body = extractValidFields(req.body, [
    "name",
    "email",
    "photo",
    "password",
    "passwordConfirm",
  ]);

  const user = await User.create(body);

  //Don't send a token upon signup
  // createSendToken(res, user);

  res.status(201).json({
    status: "success",
    message: "Successfully signed in",
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("email and password are required", 400));

  const user = await User.findOne({ email }).select("+password");
  const isCorrect = await user?.isCorrectPassword(password);

  if (!user || !isCorrect)
    return next(new AppError("email or password is wrong", 401));

  createSendToken(res, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  //check if there is a token
  let token;

  if (req.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError(
        "No Authentication token found. Please log in again to get a token.",
        401,
      ),
    );
  //check if token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if there's a user with this token
  const user = await User.findById(decoded.id).select("+password");

  if (!user)
    return next(
      new AppError(
        "The user belonging to this token no longer exists. Please log in again.",
        401,
      ),
    );
  //check if the user hasn't changed password after the token was issued
  if (user.hasChangedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        "The user has changed password recently. Please log in again",
        401,
      ),
    );

  req.user = user;

  //Grant access
  next();
});

//This is for the pages rendered in the browser - to protect them
//Here the idea is not to throw an error and incase the user is not logged in
// just render the overview page without the user data
exports.isLoggedIn = exports.protect = catchAsync(async (req, res, next) => {
  if (req.cookies?.jwt) {
    //check if token is valid
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    //check if there's a user with this token
    const user = await User.findById(decoded.id).select("+password");

    if (!user) return next();

    //check if the user hasn't changed password after the token was issued
    if (user.hasChangedPasswordAfter(decoded.iat)) return next();

    //making the user object accessible to the pug templates
    res.locals.user = user;
    return next();
  }

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You are not authorized to perform this action.", 403),
      );

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Find user
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      new AppError(
        "The user for this email address doesn't exist. Please check the email and try again.",
        404,
      ),
    );
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset token sent to your email.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(
      new AppError(
        "There was a problem while sending the email. Please, try after sometime.",
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or expired ", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Password reset successfully",
  });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
  //Implementation 1
  // const { prevPassword } = req.body;
  // if (!(await req.user?.isCorrectPassword(prevPassword)))
  //   return next(new AppError("The old password is incorrect.", 401));
  // const { password, passwordConfirm } = req.body;
  // req.user.password = password;
  // req.user.passwordConfirm = passwordConfirm;
  // await req.user.save();
  // const token = await generateJwt({ id: req.user._id });
  // res.status(201).json({
  //   status: "success",
  //   token,
  //   message: "Password updated successfully",
  // });

  const user = await User.findById(req.user._id).select("+password");
  const { prevPassword, password, passwordConfirm } = req.body;

  if (!(await req.user?.isCorrectPassword(prevPassword)))
    return next(new AppError("The current password is incorrect.", 401));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(res, user);
});
