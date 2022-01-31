const mongoose = require('mongoose');
const { users } = require("../utils.js");
const { Schema } = mongoose;

const UserSchema = new Schema({
  
  _id: { type: Schema.Types.ObjectId, ref: 'Auth' },
  
  liked: [
    {videoId : {type: String, ref: 'Video'}}
  ], 

  history: [
     {videoId : {type: String, ref: 'Video'}}
  ],

  watchlater: [
    {videoId : {type: String, ref: 'Video'}}
  ],

  playlists: [
    {
      name : {type: String},
      videos: [
        { videoId: { type: String, ref: 'Video' }}]
    }
  ],
}, {
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
   
  });

const User = mongoose.model('User', UserSchema);

// const addUserToDB = () => {
//   users.forEach(async (user) => {
//     const NewUser = new User(user);
//     const savedUser = await NewUser.save();
//     console.log(savedUser);
//   })
// }


module.exports = { User };