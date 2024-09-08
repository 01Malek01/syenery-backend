import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import AuthRoutes from "./routes/AuthRoutes.js";
dotenv.config({ path: "./.env" });
import morgan from "morgan";
import User from "./models/UserModel.js";
import UserRoutes from "./routes/UserRoutes.js";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
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
  done(null, user.id); // Adjust as per your user model's unique identifier
});

passport.deserializeUser(async (id, done) => {
  try {
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

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
export default app;
