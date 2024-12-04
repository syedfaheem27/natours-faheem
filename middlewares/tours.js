exports.top5Cheap = (req, res, next) => {
  //page=1&limit=5&sort=-ratingsAverage,price
  const queryObj = {
    page: 1,
    limit: 5,
    sort: "-ratingsAverage,price",
  };

  req.query = { ...queryObj, ...req.query };

  next();
};
