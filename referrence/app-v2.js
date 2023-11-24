const fs = require('fs');
const express = require('express');

const app = express();

//express.json() returns a function which acts as a middleware
//with a structure like this - (req,res,next)=>{}
app.use(express.json());

//Defining our own middleware - where they are placed in the code matters

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

//Adding a property on the request object
app.use((req, res, next) => {
  req.createdAt = new Date().toISOString();
  next();
});

const port = 3000;

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

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
  // console.log(req.params);
  const id = req.params.id * 1;

  const tour = tours.find(tour => tour.id === id);

  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
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

// app.get('/api/v1/tours', getTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getTours).post(createTour);

///////////

/*
Requests on the route - api/v1/tours - route handlers defined for these routes
act as middleware and thus close the request-response cycle due to which the
middleware functions below it won't get executed. So, when there are requests on
the route -/api/v1/tours , the middleware below won't ever get executed as then route 
handlers are defined above this middleware and thus they will close the request response 
cycle before it reaches the below middleware
*/

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
