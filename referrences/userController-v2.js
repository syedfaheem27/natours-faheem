const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    let ext = file.mimetype.split('/')[1];

    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else
    cb(new AppError('Not an image. Please upload images only.', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

function filterUserData(data, ...dataInclude) {
  const userData = {};
  Object.keys(data).forEach(key => {
    if (dataInclude.includes(key)) userData[key] = data[key];
  });

  return userData;
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//This is for the admin - don't update passwords
//with this as pre save hooks won't get executed

//Admin can change the role of a user
exports.updateUser = factory.updateOne(User);

//Only the admin can permanenlty delete the user
//The user himself just turns the active flag false
exports.deleteUser = factory.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);

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
  if (req.file) filteredData.photo = req.file.filename;

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
