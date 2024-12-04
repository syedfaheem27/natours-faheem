const AppError = require("../utils/appError");

exports.filterPassAndPassConf = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError("Please use /updatePassword to update passwords.", 400),
    );

  next();
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
