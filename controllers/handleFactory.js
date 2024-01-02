const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// A factory function is a function that returns a new function

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `Could not find a document with the id - ${req.params.id}`,
          404,
        ),
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          `Could not find the document with the id - ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
