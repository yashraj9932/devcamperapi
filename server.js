//Config folder is made to store all environment variables
const express = require("express");

//Dotenv used for environment variables
const dotenv = require("dotenv");
const app = express();
const connectDB = require("./config/db");

//Morgan is a third party logger that we can use
const morgan = require("morgan");

//A pacakge just for aesthetics
const colors = require("colors");
// const logger = require("./middlewares/logger");

//We import the errorHandler
const errorHandler = require("./middlewares/error");

//Load environment Variables and also specify that path to the config file
dotenv.config({ path: "./config/config.env" });

connectDB();

//Route files
const bootcamps = require("./routes/bootcamps");

//This is body parser the middleware so that we can access things in the req.body without which we will always get
app.use(express.json());

// //This middleware will now be accesible to all the routes below it
// //This means the helllo of req will be available in the req of middleware ,this req is the req of the function of route that we called.
// app.use(logger);
//Dev logging middleware(morgan) instead of the one that we built
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Mount Routers
app.use("/api/v1/bootcamps", bootcamps);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close the server and exit the process
  server.close(() => process.exit(1));
});
