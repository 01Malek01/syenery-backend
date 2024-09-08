import express from "express";
import passport from "../controllers/AuthController.js";
import {
  createPost,
  deletePost,
  editPost,
  getPost,
  getPosts,
} from "../controllers/PostController.js";
const router = express.Router();

router.post("/posts/create", passport.authenticate("session"), createPost);
router.get("/posts", passport.authenticate("session"), getPosts);
router.get("/posts/:id", passport.authenticate("session"), getPost);
router.delete("/posts/:id", passport.authenticate("session"), deletePost);
router.put("/posts/:id", passport.authenticate("session"), editPost);

export default router;
