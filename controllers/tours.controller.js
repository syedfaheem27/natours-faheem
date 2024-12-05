const Tour = require("../models/tour.model");
const catchAsync = require("../utils/catchAsync");
const {
  deleteOne,
  updateOne,
  getOne,
  getAll,
  createOne,
} = require("./handler.factory");

const AppError = require("../utils/appError");

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    // {
    //   $match: {
    //     ratingsAverage: { $gte: 4.5 },
    //   },
    // },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgRating: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMonthlyTourPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $addFields: {
        startDate: "$startDates",
      },
    },
    {
      $project: {
        startDates: 0,
      },
    },
    {
      $match: {
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDate" },
        numTours: { $sum: 1 },
        tourNames: {
          $push: "$name",
        },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: plan.length,
    data: {
      plan,
    },
  });
});

//supported units - mi,km
//"/tours-within/:distance/center/:latlng/unit/:unit"
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!distance || !lat || !lng)
    return next(
      new AppError(
        "Please provide the distance, lat and lng in the format - /tours-within/:distance/center/:latlng/unit/:unit",
        400,
      ),
    );

  const radius =
    unit.toLowerCase() === "mi" ? distance / 3963.1 : distance / 6378;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }).sort({ ratingsAverage: -1, price: 1 });

  res.status(200).json({
    status: "sucess",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

///center/:latlng/unit/:unit"
exports.getTourDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide the lat and lng in the format - /center/:latlng/unit/:unit",
        400,
      ),
    );

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  const tourDistances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng * 1, lat * 1] },
        distanceField: "distance",
        distanceMultiplier: multiplier,
        // includeLocs: "dist.location",
        spherical: true,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
        startLocation: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: tourDistances,
    },
  });
});

//restricted to admin,guide and lead-guide
exports.addTour = createOne(Tour);

exports.getTour = getOne(Tour, [
  {
    path: "reviews",
  },
]);

exports.getAllTours = getAll(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);
