const multer = require("multer");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/user.model");
const { extractValidFields } = require("../utils/extractValidFields");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./handler.factory");

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const name = `user-${req.user.id}-${Date.now()}.${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload an image file.", 400), false);
  }
};
const upload = multer({
  storage: diskStorage,
  fileFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm)
    return next(
      new AppError(
        "Can't update passwords on this route. Please, use /updatePassword to update your password.",
        400,
      ),
    );

  const toUpdate = extractValidFields(req.body, ["name", "email"]);
  if (req.file) {
    toUpdate.photo = req.file.filename;
  }

  const user = await User.findByIdAndUpdate(req.user._id, toUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

//for admin to get all users
exports.getAllUsers = getAll(User);

exports.getUser = getOne(User);

exports.addUser = (req, res) => {
  res.status(400).json({
    status: "fail",
    message: "Please use /signup to create users",
  });
};

//For user to update the user details
//Don't update passwords using this route
exports.updateUser = updateOne(User, [
  "name",
  "email",
  "password",
  "passwordConfirm",
  "role",
  "photo",
]);

//For admin to permanently delete the user
exports.deleteUser = deleteOne(User);
