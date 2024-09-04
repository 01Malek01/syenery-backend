import express from "express";
// import passport from "passport";
import passport, {
  getProfile,
  register,
} from "../controllers/AuthController.js";
import expressAsyncHandler from "express-async-handler";

const router = express.Router();



router.get("/profile", passport.authenticate("session"), getProfile);
export default router;
