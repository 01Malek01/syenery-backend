import express from "express";
import passport from "../controllers/AuthController.js";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  dislike,
  editPost,
  getPost,
  getPostComments,
  getPosts,
  getUserPosts,
  like,
} from "../controllers/PostController.js";
const router = express.Router();

router.use(passport.authenticate("session"));
router.post("/create", createPost);
router.get("/", getPosts);
router.get("/user-posts", getUserPosts);
router.route("/:id").put(editPost).get(getPost).delete(deletePost);
router.patch("/:postId/like", like);
router.patch("/:postId/dislike", dislike);
router.patch("/:postId/comment", createComment);
router.get("/:postId/comment", getPostComments);
router.delete("/:postId/comment/:commentId", deleteComment);
export default router;
