const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

//HANDLING UNCAUGHT EXCEPTIONS
//ERRORS THAT OCCUR IN OUR SYNCHRONOUS CODE

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥');

  console.log(err.name, err.message);
  //our node application is in an unclean state, so need to
  //shutdown immediately
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('Connection successfull!');
});

const port = process.env.PORT || 8000;

//START SERVER

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

//HANDLING UNHANDLED REJECTIONS IN A GLOBAL PLACE
//INSTEAD OF USING A CATCH BLOCK EVERYWHERE

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥');

  console.log(err.name, err.message);
  server.close(() => {
    console.log('Shutting down...');
    process.exit(1);
  });
});
