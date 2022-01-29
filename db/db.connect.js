const mongoose = require("mongoose");
var mongo = require('mongodb');
const mySecret = process.env['MONGO_PASSWORD']


const URL =
  `mongodb+srv://MadhushreeKunder:${mySecret}@cluster0.5ibu9.mongodb.net/video-library?retryWrites=true&w=majority`;

async function initialiseDBConnection(){
  try {
    const connection = await mongoose.connect(URL, {
     useUnifiedTopology: true,
     useNewUrlParser: true,
        })
        if(connection){
          console.log("successfully connected")
        }
      }
catch(error){
  (error => console.error("mongoose connection failed", error))
  }
}


module.exports = {initialiseDBConnection};