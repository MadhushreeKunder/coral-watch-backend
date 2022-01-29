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
  } catch {
    res.status(401).json({ success: false, message: "Could not retrieve user" })
  }
})

router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, errorMessage: "User not found" });
    } else {
      const { playlists } = await user.populate('playlists.videos.videoId');
      const { liked } = await user.populate('liked.videoId');
      const { watchLater } = await user.populate('watchLater.videoId');
      const { history } = await user.populate('history.videoId');

      const populatedUser = { ...user, playlists, liked, watchLater, history };

      return res.status(200).json({ userActivity: populatedUser.toJSON(), success: true, message: "User Activity retrieved successfully" })
    }
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: "Error while retrieving userDetails", errorMessage: error.message })
  }
})

router.route("/playlists")
  .get(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        return res.json({ playlists: user.playlists, success: true })
      }

    } catch (error) {
      res.status(500).json({ success: false, message: "Error while retrieving playlists", errMessage: error.message })
    }
  })
  .post(async (req, res) => {
    try {
      const { userId } = req.user;
      const { name } = req.body;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.playlists.push({ name: name, videos: [] });
        await user.save();
        const newPlaylist = user.playlists.find((item) => item.name === name);
        return res.status(201).json({ playlist: newPlaylist, success: true, message: "Playlist added succesfully" })
      }

    } catch (error) {
      res.status(500).json({ success: false, message: "Error while adding playlists", errMessage: error.message })
    }
  })


router.route("/playlists/:playlistId")
  .post(async (req, res) => {
    try {
      const { userId } = req.user;
      const { playlistId } = req.params;
      const updatePlaylist = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const playlist = user.playlists.find(item => item._id === playlistId)
        if (playlist) {
          const updatedPlaylist = extend(playlist, updatedPlaylist);
          await user.save();
          const { playlists } = await user.populate('playlists.video.videoId');
          const updatedPlaylistNew = playlists.find(item => item._id === playlistId);
          return res.status(201).json({ playlist: updatedPlaylistNew, success: true, message: "successfully updated playlist" })
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while updating playlist" })
    }
  })
  .delete(async (req, res) => {
    try {
      const { userId } = req.user;
      const { playlistId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {

        const playlist = user.playlists.find(item => item._id === playlistId)
        if (playlist) {
          user.playlists.pull({ _id: playlist._id });
          await user.save();
          return res.status(200).json({ playlist: playlist, success: true, message: "Succesfully deleted playlist" })
        } else {
          return res.status(404).json({ success: false, message: "No video associated with provided videoId" })
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while deleting playlist" })
    }
  })



router.route("/playlists/:playlistId/:videoId")
  .delete(async (req, res) => {
    try {
      const { playlistId, videoId } = req.params;
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      }
      else {
        const playlist = user.playlists.find(item => item._id === playlistId);
        if (playlist) {
          const updatedPlaylist = playlist.videos.filter((item) => item.videoId !== videoId);
          const updatedPlaylistNew = extend(playlist, { videos: updatedPlaylist })
          await user.save();
          return res.status(200).json({ playlists: updatedPlaylistNew, success: true, message: "Successfully deleted video from playlist" })
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
        const updatedLiked = await user.populate('liked.videoId');
        return res.json({ liked: updatedLiked.liked, success: true })
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
      const user = await User.find(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.liked.push({ videoId: videoId });
        await user.save();
        const updatedLiked = await user.populate('liked.videoId');
        const newVideo = updatedLiked.liked.find(item => item.videoId._id === videoId);
        return res.status(201).json({ addedLiked: newVideo, success: true, message: "Successfully liked video" })
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
      const user = await User.find(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const video = user.liked.find(item => item.videoId === videoId)
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
        const updatedHistory = await user.populate('history.videoId');
        return res.json({ history: updatedHistory.history, success: true })
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
      const user = await User.find(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.history.push({ videoId: videoId });
        await user.save();
        const updatedHistory = await user.populate('history.videoId');
        const newVideo = updatedHistory.history.find(item => item.videoId._id === videoId);
        return res.status(201).json({ addedHistory: newVideo, success: true, message: "Successfully history video" })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Error while adding history video", errMessage: error.message })
    }
  })
  .delete(async (req, res) => {
    try {
      const { userId} = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found"})
      } else {
        user.history = [];
        await user.save();
        return res.status(200).json( {history: user.history, succes: true, message: "Successfully deleted history"})
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
      const user = await User.find(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const video = user.history.find(item => item.videoId === videoId)
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


  
router.route("/watchLater")
  .get(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const updatedWatchLater = await user.populate('watchLater.videoId');
        return res.json({ watchLater: updatedWatchLater.watchLater, success: true })
      }
    }
    catch{
      res.status(500).json({ success: false, errorMessage: "Error while retrieving watchLater videos", errorMessage: error.message })
    }
  })
  .post(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.body;
      const user = await User.find(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        user.watchLater.push({ videoId: videoId });
        await user.save();
        const updatedWatchLater = await user.populate('watchLater.videoId');
        const newVideo = updatedWatchLater.watchLater.find(item => item.videoId._id === videoId);
        return res.status(201).json({ addedWatchLater: newVideo, success: true, message: "Successfully watchLater video" })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Error while adding watchLater video", errMessage: error.message })
    }
  })

router.route("/watchLater/:videoId")
  .delete(async (req, res) => {
    try {
      const { userId } = req.user;
      const { videoId } = req.params;
      const user = await User.find(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" })
      } else {
        const video = user.watchLater.find(item => item.videoId === videoId)
        if (video) {
          user.watchLater.pull({ _id: video._id });
          await user.save();
          return res.status(200).json({ deletedVideo: video, success: true, message: "Successfully unwatchLater video" });
        } else {
          return res.status(404).json({ sucess: false, message: "No Video associated with provided video Id" })
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error while removing watchLater video", errMessage: error.message })
    }
  })






module.exports = router;