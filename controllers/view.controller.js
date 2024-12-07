const Tour = require("../models/tour.model");
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

  console.log(tour.reviews);

  res.status(200).render("tour", {
    tour,
  });
});
