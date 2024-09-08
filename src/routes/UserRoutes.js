import express from "express";
import passport from "passport";
import {
  editProfile,
  getProfile,
  uploadProfilePic,
} from "../controllers/UserController.js";
import { upload } from "../../config/multer.js";
const router = express.Router();

router.get(
  "/profile",
  passport.authenticate("session"),
  (req, res) => {
    res.send("authenticated", req.user);
  },
  getProfile
);
router.put("/profile", passport.authenticate("session"), editProfile);

router.post(
  "/profile/uploadProfilePic",
  passport.authenticate("session"),
  upload.single("profilePic"),
  uploadProfilePic
);
export default router;
