import User from "../models/UserModel.js";
import expressAsyncHandler from "express-async-handler";
import { getUserSocketId, io } from "../server.js";
import Notification from "../models/NotificationModel.js";
import Post from "../models/PostModel.js";

export const getProfile = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);
  if (user) {
    res.json({
      name: user.name,
      email: user.email,
    });
    return next();
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const editProfile = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req?.user?._id, req.body, {
    new: true,
    runValidators: false,
  });
  if (user) {
    res.json({
      name: user.name,
      bio: user.bio,
    });
    return next();
  } else {
    res.status(401).json({ message: "You'er not authorized" });
    throw new Error("User not found");
  }
});

export const uploadProfilePic = expressAsyncHandler(async (req, res, next) => {
  console.log(req?.user);
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }
  const url = req.file.path; //by cloudinary
  const user = await User.findByIdAndUpdate(req?.user?._id, {
    profilePic: url,
    new: true,
    runValidators: false,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "Profile picture uploaded successfully",
  });
  return next();
});

export const getUserById = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
    return next();
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
export const getAllUsers = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find();
  if (users) {
    res.json(users);
    return next();
  } else {
    res.status(404);
    throw new Error("Users not found");
  }
});

export const followUser = expressAsyncHandler(async (req, res, next) => {
  const authUserId = req.user._id;
  const authUser = await User.findByIdAndUpdate(authUserId, {
    $push: { following: req.params.id }, //appends a value to an array
  });
  const followedUser = await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: authUserId },
  });
  const notification = await Notification.create({
    user: req.params.id,
    message: `${authUser.name} started following you`,
    type: "follow",
  });

  if (authUser && followedUser) {
    const followedUserSocketId = getUserSocketId(req.params.id);
    console.log("followedUserSocketId", followedUserSocketId);
    if (followedUserSocketId) {
      io.to(followedUserSocketId).emit("followNotification", {
        senderId: authUserId,
        message: `${authUser.name} started following you`,
      });
    }
  } else {
    res.status(404).message("User not found");
    throw new Error("User not found");
  }

  return next();
});

export const unFollowUser = expressAsyncHandler(async (req, res, next) => {
  const authUserId = req.user._id;
  const authUser = await User.findByIdAndUpdate(authUserId, {
    $pull: { following: req.params.id },
  });
  const followedUser = await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: authUserId },
  });

  if (authUser && followedUser) {
    res.status(200).json({ message: "User unfollowed successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }

  return next();
});

export const getUserNotifications = expressAsyncHandler(
  async (req, res, next) => {
    const notifications = await Notification.find({
      user: req.user._id,
    });
    if (notifications) {
      res.json(notifications);
      return next();
    } else {
      res.status(404);
      throw new Error("Notifications not found");
    }
  }
);

export const clearNotifications = expressAsyncHandler(
  async (req, res, next) => {
    const notifications = await Notification.deleteMany({
      user: req.user._id,
    });
    if (notifications) {
      res.json({ message: "Notifications cleared successfully" });
      return next();
    } else {
      res.status(404);
      throw new Error("Notifications not found");
    }
  }
);

export const getExplorePeople = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find({
    followers: { $ne: req.user._id },
  });
  if (users) {
    res.json(users);
    return next();
  } else {
    res.status(404);
    throw new Error("Users not found");
  }
});

export const getFriends = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find({
    _id: { $in: req.user.following }, //ids that are in the followings of the auth user
    following: { $in: [req.user._id] },
  });
  if (users) {
    res.json(users);
    return next();
  } else {
    res.status(404);
    throw new Error("Users not found");
  }
});


