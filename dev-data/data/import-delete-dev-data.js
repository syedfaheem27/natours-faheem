const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tour.model");
const Review = require("../../models/review.model");
const User = require("../../models/user.model");

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB_Conn = process.env.DATABASE_CONN.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB_Conn)
  .then(() => {
    console.log("Database connected");
  })
  .catch(err => {
    console.log(err);
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"),
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users-copy.json`, "utf-8"),
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);

    console.log("Data succesfully written");
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log("Tour data successfully deleted");
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === "--import") importData();
else if (process.argv[2] === "--delete") deleteData();
