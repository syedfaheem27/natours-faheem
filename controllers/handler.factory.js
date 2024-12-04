const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { extractValidFields } = require("../utils/extractValidFields");

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model, validFields) =>
  catchAsync(async (req, res, next) => {
    let body;
    if (validFields?.length > 0) {
      body = extractValidFields(req.body, [...validFields]);
    } else body = { ...req.body };

    const doc = await Model.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptionsArr) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptionsArr?.length > 0)
      query = popOptionsArr.reduce((acc, curr) => {
        return acc.populate({ ...curr });
      }, query);

    const doc = await query;

    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, initialFilter) =>
  catchAsync(async (req, res) => {
    console.log(initialFilter);
    let initQuery;
    if (initialFilter) initQuery = Model.find(initialFilter);
    else initQuery = Model.find();

    const features = new APIFeatures(initQuery, req.query)
      .filter()
      .sort()
      .select()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.createOne = (Model, validFields) =>
  catchAsync(async (req, res) => {
    let body;
    if (validFields?.length > 0)
      body = extractValidFields(req.body, [...validFields]);
    else body = { ...req.body };

    const doc = await Model.create(body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
