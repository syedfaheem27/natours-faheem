const mongoose = require("mongoose");

const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

process.on("uncaughtException", err => {
  console.log("Uncaught exception 🔥");
  console.log("Shutting down...");

  console.log(err.name, err.message);
  process.exit(1);
});

const DB_Conn = process.env.DATABASE_CONN.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
const app = require("./app");

mongoose.connect(DB_Conn).then(() => {
  console.log("DB Connection established");
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// console.log(app.get("env"));

process.on("unhandledRejection", err => {
  console.log("Unhandled Rejection 🔥");
  console.log("Shutting down...");

  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//SIGTERM Signal emitted by render as well
process.on("SIGTERM", () => {
  console.log("Shutting down...");

  server.close(() => {
    console.log("Terminating all the processes...");
  });
});
