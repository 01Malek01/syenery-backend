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

  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("Online users:", onlineUsers);
  });

  socket.on("privateMessage", ({ senderId, receiverId, content }) => {
    const receiverIdSocket = onlineUsers[receiverId];
    if (receiverIdSocket) {
      io.to(receiverIdSocket).emit("receiveMessage", {
        senderId,
        content,
      });
    } else {
      console.log("User not found");
    }
  });
  socket.on("receiveMessage", (data) => {
    console.log("Message received: ", data.newMessage);
  });

  socket.on("messageNotification", (data) => {
    console.log("New message notification: ", data.notification);
  });

  socket.on("disconnect", () => {
    for (const user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
        console.log("Online users:", onlineUsers);
        break;
      }
    }
    console.log("user disconnected");
  });
});

//add online users
//TODO: add the register event on the frontend

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
