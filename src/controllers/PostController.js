import expressAsyncHandler from "express-async-handler";
import Post from "../models/PostModel";

export const createPost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    author: req.user._id,
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
  const posts = await Post.find();
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
  const post = await Post.findById(req.params.id);
  if (post) {
    await post.remove();
    res.json({ message: "Post deleted" });
    return next();
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});
export const editPost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      content: req.body.content,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (post) {
    res.json(post);
    return next();
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});
