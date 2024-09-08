import User from "../models/UserModel.js";
import expressAsyncHandler from "express-async-handler";

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
      email: user.email,
    });
    return next();
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const uploadProfilePic = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }
  const url = req.file.path;
  user.profilePic = url;
  await user.save();
  res.status(200).json({
    message: "Profile picture uploaded successfully",
  });
  return next();
});
