const fs = require('fs');

const express = require('express');
const morgan = require('morgan');

const app = express();

//MIDDLEWARE

app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.createdAt = new Date().toISOString();
  next();
});

const port = 3000;

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//ROUTE HANDLER FUNCTIONS

//1.  Tours

const getTours = (req, res) => {
  console.log(req.createdAt);
  res.status(200).json({
    status: 'success',
    createdAt: req.createdAt,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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

const getTour = (req, res) => {
  const id = req.params.id * 1;

  const tour = tours.find(tour => tour.id === id);

  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours[tours.length - 1].id) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
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

const deleteTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tours[tours.length - 1].id) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

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

//2.  Users
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'server not responding',
  });
};

//ROUTES

const tourRouter = express.Router();
const userRouter = express.Router();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//1.  Tours
tourRouter.route('/').get(getTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

//2.  Users
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//START SERVER

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

//Now, after we have mounted routers on different routes, it's time for refactoring our code and
//putting code in their respective places
