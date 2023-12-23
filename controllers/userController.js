const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function filterUserData(data, ...dataInclude) {
  const userData = {};
  Object.keys(data).forEach(key => {
    if (dataInclude.includes(key)) userData[key] = data[key];
  });

  return userData;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //In this handler, we can use findByIdAndUpdate as we don't need the middlewares
  //to run as they were only for handling passwords

  //1. Check if there is any data related to password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Use /updateMyPassword',
        400,
      ),
    );

  //2. Update user data

  //before that filter data - user can specify a role
  //so make sure you only update certain fields - email and name
  const filteredData = filterUserData(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate(req.user._id, filteredData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
