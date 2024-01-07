const Tour = require('../models/tourModel');

module.exports = async function tourUpdateReview(obj, id) {
  const stats = await obj.calcAverageRatings(id);

  if (stats.length !== 0) {
    await Tour.findByIdAndUpdate(id, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(id, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
