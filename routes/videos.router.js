const express = require("express");
const router = express.Router();
const { Video } = require("../models/video.model");
const { extend } = require("lodash")

router.route("/")
.get( async (req, res) => {
  try {
    const videos = await Video.find({});  
      res.json({ videos, success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: "unable to get videos", errMessage: err.message})
  }
})
// .post(async (req, res) => {
//   try {
//     const video = req.body
//     const NewVideo = new Video(video);
//     const savedVideo = await NewVideo.save();
//     res.status(201).json({ success: true, video: savedVideo })
//   } catch(err) {
//     res.status(500).json({ success: false, message: "unable to add videos", errMessage: err.message})
//   }
// })



// router.param('videoId', async (req, res, next, videoId) => {
//   try {
//     const video = await Video.findById(videoId);
//     if (!video) {
//       return res.status(400).json({success: false , message: "Video not found"})
//     }
//     req.video = video;
//     next();
//   } catch {
//     res.status(400).json({success: false, message: "Could not retrieve video"})
//   }  
// })



router.route("/:id")
.get(async(req, res) => {
  // const { video } = req
  const { id } = req.params;

  try {
    let video = await Video.findById(id);
    video.__v = undefined;
    if (video) {
      return res.status(200).json({ video, success: true, message: "Successful" })
    } res.status(404).json({ success: false, errMessage: "The video ID sent has no video associated with it. Check and try again" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong", errMessage: error.message })
  }

})
// .post( async(req, res) => {
//   let { video } = req;
//   const videoUpdate = req.body;

//   video = extend(video, videoUpdate);
//   video.updated = Date.now();
//   console.log("date: ", video.updated);
//   video = await video.save();

//   res.json({success: true, video})
 
// })
// .delete( async (req, res) =>  {
//   let { video } = req;
//   await video.remove();
//   res.json({success: true, video})
// })


module.exports = router



