const express = require('express');
const router = express.Router();
const { extend } = require("lodash");
const { User } = require("../models/user.model");
// const { populateData } = require("../utils") 


router.param('userId', async (req, res, next, userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "user not found" })
    }
    req.user = user;
    next();
  } catch (error) {

    res.status(401).json({ success: false, message: "Could not retrieve user", errmessage: error.message })
  }
})

router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, errorMessage: "User not found" });
    } else {
      const { playlists } = await user.populate('playlists.videos.videoId').execPopulate();
      const { liked } = await user.populate('liked.videoId').execPopulate();
      const { watchlater } = await user.populate('watchlater.videoId').execPopulate();
      const { history } = await user.populate('history.videoId').execPopulate();

      const populatedUser = { ...user, playlists, liked, watchlater, history };

      return res.status(200).json({ user: populatedUser._doc, success: true, message: "User Activity retrieved successfully" })
    }
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: "Error while retrieving userDetails", errorMessage: error.message })
  }
})

router.route("/playlists")
  .get(async (req, res) => {
    // try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    } else {
      return res.json({ playlists: user.playlists, success: true })
    }

    // } catch (error) {
    //   res.status(500).json({ success: false, message: "Error while retrieving playlists", errMessage: error.message })
    // }
  })
  .post(async (req, res) => {
    // try {
    const { name } = req.body;
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    } else {
      user.playlists.push({ name: name, videos: [] });
      await user.save();
      const newPlaylist = user.playlists.find((item) => item.name === name);
      return res.status(201).json({ playlist: newPlaylist, success: true, message: "Playlist added succesfully" })
    }

    // } catch (error) {
    //   res.status(500).json({ success: false, message: "Error while adding playlists", errMessage: error.message })
    // }
  })


router.route("/playlists/:playlistId")
  .post(async (req, res) => {
    // try {
    const { playlistId } = req.params;
    const updatePlaylist = req.body;

    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    } else {
      const playlist = user.playlists.find(item => item._id == playlistId)

      if (playlist) {
        const updatedPlaylist = extend(playlist, updatePlaylist);
        await user.save();

        const { playlists } = await user.populate('playlists.videos.videoId').execPopulate();
        const populatedPlaylist = playlists.find(item => item._id == playlistId);  
        return res.status(201).json({ playlist: populatedPlaylist, success: true, message: "successfully updated playlist" })
      }
    }
    // } catch (error) {
    //   res.status(500).json({ success: false, message: "Error while updating playlist" })
    // }
  })
  .delete(async (req, res) => {
    // try {
    const { userId } = req.user;
    const { playlistId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    } else {

      const playlist = user.playlists.find(item => item._id == playlistId)
      if (playlist) {
        user.playlists.pull({ _id: playlist._id });
        await user.save();
        return res.status(200).json({ playlist: playlist, success: true, message: "Succesfully deleted playlist" })
      } else {
        return res.status(404).json({ success: false, message: "No video associated with provided videoId" })
      }
    }
    // } catch (error) {
    //   res.status(500).json({ success: false, message: "Error while deleting playlist" })
    // }
  })



router.route('/playlists/:playlistId/:videoId')
  .delete(async (req, res) => {
    try {
    const { playlistId, videoId } = req.params;
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }
    else {
      const playlist = user.playlists.find(item => item._id == playlistId);
      if (playlist) {
        const updatedVideoPlaylist = playlist.videos.filter((item) => item.videoId !== videoId);
        const updatedPlaylist = extend(playlist, { videos: updatedVideoPlaylist })
        await user.save();
        return res.status(200).json({ playlists: updatedPlaylist, success: true, message: "Successfully deleted video from playlist" })
      }
    }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Error while deleting video from playlist" })
    }
  })



router.route("/liked")
  .get(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const updatedObj = await user.populate('liked.videoId').execPopulate();
        return res.json({ liked: updatedObj.liked, success: true })
      }
    }
    catch{
      res.status(500).json({ success: false, errorMessage: "Error while retrieving liked videos", errorMessage: error.message })
    }
  })
  .post(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.liked.push({ videoId: videoId });
        await user.save();
        const updatedObj = await user.populate('liked.videoId').execPopulate();
        const newVideo = updatedObj.liked.find(item => item.videoId._id === videoId);
        return res.status(201).json({ addedVideo: newVideo, success: true, message: "Successfully liked video" })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Error while adding liked video", errMessage: error.message })
    }
  })

router.route("/liked/:videoId")
  .delete(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const video = user.liked.find(item => item.videoId == videoId)
        if (video) {
          user.liked.pull({ _id: video._id });
          await user.save();
          return res.status(200).json({ deletedVideo: video, success: true, message: "Successfully unliked video" });
        } else {
          return res.status(404).json({ sucess: false, message: "No Video associated with provided video Id" })
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while removing liked video", errMessage: error.message })
    }
  })




router.route("/history")
  .get(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const updatedObj = await user.populate('history.videoId').execPopulate();
        return res.json({ history: updatedObj.history, success: true })
      }
    }
    catch{
      res.status(500).json({ success: false, errorMessage: "Error while retrieving history videos", errorMessage: error.message })
    }
  })
  .post(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.history.push({ videoId: videoId });
        await user.save();
        const updatedObj = await user.populate('history.videoId').execPopulate();
        const newVideo = updatedObj.history.find(item => item.videoId._id === videoId);
        return res.status(201).json({ addedVideo: newVideo, success: true, message: "Successfully history video" })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Error while adding history video", errMessage: error.message })
    }
  })
  .delete(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.history = [];
        await user.save();
        return res.status(200).json({ history: user.history, succes: true, message: "Successfully deleted history" })
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while deleting history", errMessage: error.message })
    }
  })

router.route("/history/:videoId")
  .delete(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const video = user.history.find(item => item.videoId == videoId)
        if (video) {
          user.history.pull({ _id: video._id });
          await user.save();
          return res.status(200).json({ deletedVideo: video, success: true, message: "Successfully removed video from hisotry" });
        } else {
          return res.status(404).json({ sucess: false, message: "No Video associated with provided video Id" })
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while removing history video", errMessage: error.message })
    }
  })



router.route("/watchlater")
  .get(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const updatedObj = await user.populate('watchlater.videoId').execPopulate();
        return res.json({ watchlater: updatedObj.watchlater, success: true })
      }
    }
    catch{
      res.status(500).json({ success: false, errorMessage: "Error while retrieving watchlater videos", errorMessage: error.message })
    }
  })
  .post(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.watchlater.push({ videoId: videoId });
        await user.save();
        const updatedObj = await user.populate('watchlater.videoId').execPopulate();
        const newVideo = updatedObj.watchlater.find(item => item.videoId._id === videoId);
        return res.status(201).json({ addedVideo: newVideo, success: true, message: "Successfully watchlater video" })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Error while adding watchlater video", errMessage: error.message })
    }
  })

router.route("/watchlater/:videoId")
  .delete(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const video = user.watchlater.find(item => item.videoId === videoId)
        if (video) {
          user.watchlater.pull({ _id: video._id });
          await user.save();
          return res.status(200).json({ deletedVideo: video, success: true, message: "Successfully unwatchlater video" });
        } else {
          return res.status(404).json({ sucess: false, message: "No Video associated with provided video Id" })
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while removing watchlater video", errMessage: error.message })
    }
  })






module.exports = router;