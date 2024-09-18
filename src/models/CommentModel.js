import mongoose from "mongoose";
import User from "./UserModel.js";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    authorName: {
      type: String,
    },
  },
  { timestamps: true }
);

commentSchema.pre("save", async function (next) {
  const user = await User.findById(this.author);
  this.authorName = user.name;
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
