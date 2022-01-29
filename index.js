const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { initialiseDBConnection } = require("./db/db.connect.js")

require('dotenv').config();

 
const { authVerify } = require("./middlewares/auth-handler.middleware")
const { errorHandler } = require("./middlewares/error-handler.middleware")
const { routeNotFound } = require("./middlewares/route-not-found.middleware")


const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({origin: "*"}));
app.use(bodyParser.json());

initialiseDBConnection();

app.get("/", (req, res) => {
  res.json({holaaa: "amigooo!"})
})

app.listen(PORT , () => {
  console.log("Listening on Port:", PORT)
})