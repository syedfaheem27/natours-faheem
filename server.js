const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

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

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
