import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import morgan from "morgan";
import User from "./models/UserModel.js";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
// Routes
import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import PostRoutes from "./routes/PostRoutes.js";
import GlobalErrorHandler from "./middleware/GlobalErrorHandler.js";
import ChatRoutes from "./routes/ChatRoutes.js";
dotenv.config({ path: "./.env" });
const app = express();

// Middleware
app.use(
  cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL],
  })
);

const clientP = mongoose
  .connect(process.env.MONGO_URI)
  .then((m) => m.connection.getClient());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      // mongoUrl: process.env.MONGO_URI,
      // client: mongoose.connection.getClient(),
      clientPromise: clientP,
      dbName: "social-media",
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: "native", // Default
      crypto: {
        secret: process.env.MONGO_SECRET,
      },
      collection: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user._id); //save user id to the session
});

passport.deserializeUser(async (id, done) => {
  try {
    //retrieve user from database
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//initialize passport

app.get("/test", (req, res) => {
  res.send("test successful");
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/posts", PostRoutes);
app.use("/api/v1/chat", ChatRoutes);

//error handler
app.use(GlobalErrorHandler);
export default app;
