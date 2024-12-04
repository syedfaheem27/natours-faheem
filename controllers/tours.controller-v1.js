const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8"),
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tours,
    },
  });
};

const addTour = (req, res) => {
  const id = tours.at(-1).id + 1;

  const newTour = Object.assign({ id }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) {
        return res
          .status(500)
          .json("Internal Server Error: Unable to write to file");
      }
      res.status(201).json({
        status: "success",
        data: {
          newTour,
        },
      });
    },
  );
};

const checkId = (req, res, next, id) => {
  const tourId = id * 1;
  const tour = tours.find(t => t.id === tourId);
  if (!tour)
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  req.tour = tour;
  next();
};

const getTour = (req, res) => {
  res.status(200).json({
    status: "success",
    tour: req.tour,
  });
};

const updateTour = (req, res) => {
  const { tour } = req;

  Object.keys(req.body).forEach(key => {
    tour[key] = req.body[key];
  });

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) {
        return res
          .status(500)
          .json("Internal Server Error: Unable to write to file");
      }

      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    },
  );
};

const deleteTour = (req, res) => {
  const { id } = req.params;

  const tourId = id * 1;

  const index = tours.findIndex(t => t.id === tourId);
  tours.splice(index, 1);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) {
        return res
          .status(500)
          .json("Internal Server Error: Unable to write to file");
      }

      res.status(204).end();
    },
  );
};

module.exports = {
  addTour,
  getTour,
  getAllTours,
  updateTour,
  deleteTour,
  checkId,
};
