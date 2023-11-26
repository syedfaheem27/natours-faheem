const Tour = require('../models/tourModel');

exports.getTours = async (req, res) => {
  try {
    //2 ways to write database queries in mongoose
    //1.  use the filter object in the find method
    //2.  use special mongoose methods

    //1.
    //Problem with just using the query object(req.query) is that if it contains
    //query parameters like sort,page,limits,fields - it will return nothing.
    //so we need to build the query object and exclude these fields

    // const tours = await Tour.find(req.query);

    const queryObj = { ...req.query };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // console.log(req.query, queryObj);

    const tours = await Tour.find(queryObj);

    //2. Using query methods
    /*
      These methods all return a query which allows us to then chain these methods 
      on them and when we await a query, it is executed and returns with the data.
      So, we should always build a query first and then execute it later

    */
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('medium');

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //findById is an even bigger abstraction over findOne({id:ldlsl});
    res.status(200).json({
      status: 'success',
      tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
