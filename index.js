const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { initialiseDBConnection } = require("./db/db.connect.js")

require('dotenv').config();

 
const { authVerify } = require("./middlewares/auth-handler.middleware")
const { errorHandler } = require("./middlewares/error-handler.middleware")
const { routeNotFound } = require("./middlewares/route-not-found.middleware")

const { addVideosToDB } = require("./models/video.model");
const { addAuthToDB } = require("./models/auth.model");
const { addUserToDB } = require("./models/user.model");

const auth = require("./routes/auth.router");
const user = require("./routes/user.router");
const videos = require("./routes/videos.router");


const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({origin: "*"}));
app.use(bodyParser.json());

initialiseDBConnection();

app.use('/video', videos);
app.use('/auth', auth);
app.use('/user', authVerify, user);

app.get("/", (req, res) => {
  res.json({hello: "Welcome to coral-watch!"})
})

app.use(errorHandler);
app.use(routeNotFound);

app.listen(PORT , () => {
  console.log("Listening on Port:", PORT)
})