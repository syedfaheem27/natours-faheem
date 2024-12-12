const Tour = require("../models/tour.model");
const User = require("../models/user.model");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTourDetail = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    select: "review rating user",
  });

  if (!tour) return next(new AppError("No tour found with that name", 404));

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginPage = (req, res) => {
  res.status(200).render("login");
};

exports.getSignUpPage = (req, res) => {
  res.status(200).render("signup");
};

exports.getUserDetail = (req, res) => {
  res.status(200).render("account", {
    title: "Your account details",
  });
};

exports.updateUserDetail = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(201).render("account", {
    title: "Your account details",
    user: updatedUser,
  });
});
