import expressAsyncHandler from "express-async-handler";
import Post from "../models/PostModel.js";
import Comment from "../models/CommentModel.js";

export const createPost = expressAsyncHandler(async (req, res, next) => {
  if (!req?.user?._id) {
    res.status(401).json({ message: "You're not authorized" });
  }
  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    author: req.user._id, //from the req obj
  });
  if (post) {
    res.status(201).json({
      _id: post._id,
      title: post.title,
      content: post.content,
      author: post.author,
    });
    return next();
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

export const getPosts = expressAsyncHandler(async (req, res, next) => {
  const posts = await Post.find({ private: false })
    .sort({ createdAt: -1 })
    .populate("author sharedFrom");

  if (posts) {
    res.json(posts);
    return next();
  } else {
    res.status(404);
    throw new Error("Posts not found");
  }
});

export const getPost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.json(post);
    return next();
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

export const deletePost = expressAsyncHandler(async (req, res, next) => {
  if (!req?.user?._id) {
    return res.status(401).json({ message: "You're not authorized" });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this post" });
  }

  await Post.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Post deleted successfully" });
});

export const editPost = expressAsyncHandler(async (req, res, next) => {
  console.log("Editing post with ID:", req.params.id);
  console.log("Request body:", req.body);

  if (!req.user?._id) {
    console.log("Unauthorized");
    res.status(401);
    throw new Error("Unauthorized");
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    console.log("Post not found");
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    console.log("Unauthorized to edit this post");
    res.status(403);
    throw new Error("You are not authorized to edit this post");
  }

  post.content = req.body.content; // Update the content

  try {
    const updatedPost = await post.save(); // Persist the changes to the database
    res.status(200).json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post" });
  }
});

export const getUserPosts = expressAsyncHandler(async (req, res, next) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }
  const posts = await Post.find({ author: req.user._id }).sort({
    createdAt: -1,
  });
  if (!posts) {
    res.send("No posts found");
  }

  res.send(posts);
  return next();
});

export const like = expressAsyncHandler(async (req, res, next) => {
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Prevent duplicate likes
  if (post.likes.includes(req?.user?._id)) {
    res.status(400);
    throw new Error("You have already liked this post");
  }

  post.likes.push(req?.user?._id);
  await post.save();

  res.status(200).json({ message: "Post liked successfully" });
});

export const dislike = expressAsyncHandler(async (req, res, next) => {
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const likeIndex = post.likes.indexOf(req?.user?._id);
  if (likeIndex === -1) {
    res.status(400);
    throw new Error("You have not liked this post yet");
  }

  post.likes.splice(likeIndex, 1);
  await post.save();

  res.status(200).json({ message: "Post disliked successfully" });
});

export const createComment = expressAsyncHandler(async (req, res, next) => {
  const postId = req.params.postId;

  // Check if the post exists
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Create the comment
  const comment = await Comment.create({
    content: req.body.content,
    author: req.user._id, // Assuming req.user is populated from authentication middleware
    post: postId,
  });

  // Push the comment into the post's comments array and save
  post.comments.push(comment._id);
  await post.save();

  res.status(200).json({ message: "Comment created successfully", comment });
});

export const getPostComments = expressAsyncHandler(async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const comments = await post.populate("comments author");
  res.send(comments);
});

export const deleteComment = expressAsyncHandler(async (req, res, next) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  console.log(
    "Deleting comment with ID:",
    commentId,
    "from post with ID:",
    postId
  );

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  // Remove the comment from the post's comments array
  post.comments = post.comments.filter(
    (comment) => comment.toString() !== commentId.toString()
  );
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    post: postId,
    author: req.user._id,
  });
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  await post.save();

  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to delete this comment");
  }

  res.status(200).json({ message: "Comment deleted successfully" });
});

export const getPostsByUser = expressAsyncHandler(async (req, res, next) => {
  const posts = await Post.find({ author: req.params.userId });

  if (posts) {
    res.json(posts);
    return next();
  } else {
    res.status(404);
    throw new Error("Posts not found");
  }
});

export const sharePost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const postAuthor = post?.author;
  console.log("req.user", req.user);
  if (post) {
    const newPost = await Post.create({
      title: post.title,
      content: post.content,
      author: req?.user?._id,
      sharedFrom: postAuthor,
      isShared: true,
    });
    res.status(201).json(newPost);
    return next();
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});
