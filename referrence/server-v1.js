const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('../app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('Connection successfull!');
});

// console.log(app.get('env'));
// console.log(process.env);
// console.log(process.env.NODE_ENV);

const port = process.env.PORT || 8000;

//Defining schema without schema options
// const tourSchema = mongoose.Schema({
//   name: String,
//   price: Number,
//   rating: Number,
// });

//Defining schema with schema options
const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Tour must have a name'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'A Tour must have a price'],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});

//Creating a model for the defined schema
const Tour = mongoose.model('Tour', tourSchema);

//Creating a tour instance
const testTour = new Tour({
  name: 'The Park Camper',
  price: 497,
});

/*
Note that no tanks will be created/removed until the
connection your model uses is open. Every model has an 
associated connection. When you use mongoose.model(), 
your model will use the default mongoose connection.
*/

//Saving the test tour
testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => {
    console.log('An Error occurred 🔥', err);
  });

//START SERVER

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

//In the next file we are going to restructure our code according to the mvc architecture
