import express from "express";
import passport from "../controllers/AuthController.js";
import {
  editProfile,
  getProfile,
  uploadProfilePic,
  getUserById,
  getAllUsers,
  followUser,
  unFollowUser,
  getUserNotifications,
  clearNotifications,
  getExplorePeople,
  getFriends,
} from "../controllers/UserController.js";
import { upload } from "../../config/multer.js";
const router = express.Router();

router.get("/all-users", passport.authenticate("session"), getAllUsers);
router.get(
  "/explore-people",
  passport.authenticate("session"),
  getExplorePeople
);
router.get("/friends", passport.authenticate("session"), getFriends);
router.get(
  "/profile",
  passport.authenticate("session"),
  (req, res) => {
    res.send("authenticated", req.user);
  },
  getProfile
);

router.put(
  "/profile/uploadProfilePic",
  passport.authenticate("session"),

  upload.single("profilePic"),
  uploadProfilePic
);
router.put(
  "/profile",
  passport.authenticate("session"),
  (req, res, next) => {
    console.log(req?.user);
    next();
  },
  editProfile
);

router.get("/:id/profile", getUserById);

router.patch("/:id/follow", passport.authenticate("session"), followUser);
router.patch("/:id/unfollow", passport.authenticate("session"), unFollowUser);
router
  .route("/notifications")
  .get(passport.authenticate("session"), getUserNotifications)
  .delete(passport.authenticate("session"), clearNotifications);
export default router;
