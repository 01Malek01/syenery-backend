import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    googleId: {
      type: String,
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profilePic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function async(next) {
  //new acc or update password
  if (this.password) {
    if (this.isModified("password") || this.isNew) {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    }
  }
});
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password); //true or false
};

const User = mongoose.model("User", userSchema);
export default User;
