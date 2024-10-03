import app from "./app.js";
import mongoose from "mongoose";
const PORT = process.env.PORT || 3000;
import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = {};
export const getUserSocketId = (userId) => onlineUsers[userId];
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  console.log("Online users:", onlineUsers);

  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers[userId] = socket.id;
      console.log("Online users:", onlineUsers);
    } else {
      console.log("User not found");
    }
  });

  socket.on("disconnect", () => {
    for (const user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
        break;
      }
    }
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
