const multer = require("multer");
const sharp = require("sharp");

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

const memoryStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload an image file.", 400), false);
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
});

exports.uploadTourPics = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

exports.resizeTourPhotos = catchAsync(async (req, res, next) => {
  if (!req.files?.imageCover && !req.files?.images) return next();

  req.body.imageCover = `tour-${req.user.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (img, i) => {
      const fileName = `tour-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;
      req.body.images.push(fileName);
      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
    }),
  );

  next();
});

exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);
