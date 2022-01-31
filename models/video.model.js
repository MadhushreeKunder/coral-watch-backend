var mongoose = require('mongoose');
require('mongoose-type-url');

const VideoSchema = new mongoose.Schema({

  _id: {
    type: String,
    required: "Cannot enter a video without Video id, please enter id",
    // unique: [true, "Custom unique failed"]
  },

  // videoLinkId : {
  //   type: String,
  //   required: "Cannot enter a video without VideoLinkId, please enter VideoLinkId"
  // },

  videoTitle: {
    type: String,
    required: "Cannot enter a video without Video Title, please enter Title"
  },

  views: {
    type: Number,
    required: "Cannot Enter a video without views, please enter views"
  },

  date: {
    type: String,
    required: "Cannot enter a video without date, please enter date"
  },

  channel: {
    cId: {
      type: Number, 
      required: "Cannot enter channel without Channel Id, please enter channnel id"},

    name : {
      type: String, 
      required: "Cannot enter channel without Channel name, please enter channnel name"},

    logo: {
      type: String,
      required: "Cannot enter channel without channel logo, please enter channel logo"}
  },

}, {
   timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
})

const Video = mongoose.model("Video", VideoSchema);

// add videos to database
const addVideosToDB = () => {
  videos.forEach(async (video) => {
    const NewVideo = new Video(video);
    const savedVideo =  await NewVideo.save();
      })
}

module.exports = { Video, addVideosToDB };