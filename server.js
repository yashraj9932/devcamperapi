//Config folder is made to store all environment variables
const express = require("express");
const path = require("path");

//Dotenv used for environment variables
const dotenv = require("dotenv");
const helmet = require("helmet");
const app = express();
const connectDB = require("./config/db");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

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
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

//This is body parser the middleware so that we can access things in the req.body without which we will always get
app.use(express.json());
app.use(mongoSanitize());

//Cookie parser
app.use(cookieParser());

// //This middleware will now be accesible to all the routes below it
// //This means the helllo of req will be available in the req of middleware ,this req is the req of the function of route that we called.
// app.use(logger);
//Dev logging middleware(morgan) instead of the one that we built
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

//Set security headers
app.use(helmet());

//Prevent xss attacks
app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10mins
  max: 100,
});

//Prevent http pollution
app.use(hpp());

//Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount Routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
