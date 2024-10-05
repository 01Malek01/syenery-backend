import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/UserModel.js";
import expressAsyncHandler from "express-async-handler";
import GoogleStrategy from "passport-google-oauth2";

import dotenv from "dotenv";
dotenv.config();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      if (!password)
        return done(null, false, { message: "Password is required" });
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/federated/google/callback`,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with the Google ID already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new one
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });

          // Save the new user to the database
          await user.save();
        }

        // Pass the user to the done callback
        return done(null, user);
      } catch (error) {
        // Handle errors during the user creation process
        return done(error, null);
      }
    }
  )
);

export const register = expressAsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const existigUser = await User.findOne({ email });
  if (existigUser) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({ name, email, password });
  if (user) {
    req.login(user, (err) => {
      if (err) {
        return next(err);
      } else {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      }
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export default passport;
