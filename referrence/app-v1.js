const fs = require('fs');
const express = require('express');

const app = express();

//Using the express middleware - express.json() to make sure that the data sent
//with a post request gets added to the request object
app.use(express.json());

const port = 3000;

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'hello from the server side!!!', app: 'Hey' });
// });

// app.post('/', (req, res) => {
//   res.send('You can now post at this url!!!');
// });

//1.  Getting tours
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

//Defining routes and actions for our API

//Get tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//2.  Creating a tour

/*
data that is sent - you're expecting it to be on
the request object, but express doesn't put it 
there by default. To do so, we have to use the 
express middleware
*/
app.post('/api/v1/tours', (req, res) => {
  // console.log(req.body);
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
    },
  );
});

//3.  Getting a single tour by id
//Optional /api/v1/tours/:id/:x?
app.get('/api/v1/tours/:id', (req, res) => {
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
});

//4.  Handling a patch request
app.patch('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  if (id > tours[tours.length - 1].id) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  const updatedTours = tours.map(tour =>
    tour.id === id ? { ...tour, ...req.body } : tour,
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
    },
  );
});

//5.  Deleting a tour
app.delete('/api/v1/tours/:id', (req, res) => {
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
    },
  );
});
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
