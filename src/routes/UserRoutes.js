import express from "express";
import passport from "../controllers/AuthController.js";
import {
  editProfile,
  getProfile,
  uploadProfilePic,
  getUserById,
  getAllUsers,
} from "../controllers/UserController.js";
import { upload } from "../../config/multer.js";
const router = express.Router();

router.get("/all-users", passport.authenticate("session"), getAllUsers);
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

export default router;
