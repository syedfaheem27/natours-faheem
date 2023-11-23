const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`The route param is ${val}`);

  if (val > tours[tours.length - 1].id) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'The Body is missing name or price',
    });
  }

  next();
};

exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    createdAt: req.createdAt,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;

  const tour = tours.find(tour => tour.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;

  const updatedTours = tours.map(tour =>
    tour.id === id ? { ...tour, ...req.body } : tour
  );

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    err => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: updatedTours.find(tour => tour.id === id),
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;

  const updatedTours = tours.filter(tour => tour.id !== id);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    err => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
