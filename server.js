//Config folder is made to store all environment variables
const express = require("express");
const dotenv = require("dotenv");
const app = express();

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
