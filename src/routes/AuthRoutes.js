import express from "express";
// import passport from "passport";
import passport, { register } from "../controllers/AuthController.js";
import expressAsyncHandler from "express-async-handler";

const router = express.Router();

router.post("/register", register);
router.get(
  "/login/federated/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/federated/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/auth`, // Redirect here on failure
    session: true, // If you want to maintain session, set to true
  }),
  (req, res, next) => {
    // Log if authentication was successful
    // console.log("Authentication successful:", req.isAuthenticated());

    // Log the user object to check if the user was correctly authenticated
    // console.log("User object:", req.user);

    if (req.isAuthenticated()) {
      // Attempt to save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return next(err); // Pass the error to the next middleware
        }

        // Log the session ID if it exists
        // console.log("Session ID:", req.sessionID);

        // Successful authentication, redirect to your frontend
        res.redirect(process.env.FRONTEND_URL);
      });
    } else {
      // If not authenticated, log and redirect to the failure URL
      console.log("User not authenticated, redirecting to failure URL.");
      res.redirect(`${process.env.FRONTEND_URL}/auth`);
    }
  }
);

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.send({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});
router.post(
  "/logout",
  expressAsyncHandler(async (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
    });

    res.clearCookie("connect.sid", { path: "/" });
    res.send("Logged out successfully");
    return next();
  })
);

router.get("/check-auth", passport.authenticate("session"), (req, res) => {
  if (req.isAuthenticated()) {
    res.send({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAuthenticated: req.isAuthenticated(),
    });
  } else {
    res.send({
      _id: null,
      name: null,
      email: null,
      isAuthenticated: req.isAuthenticated(),
    });
  }
});

export default router;
