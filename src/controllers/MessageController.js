import expressAsyncHandler from "express-async-handler";
import Message from "../models/MessageModel.js";
import Conversation from "../models/ConversationModel.js";
import { getUserSocketId, io } from "../server.js";
import Notification from "../models/NotificationModel.js";

export const getMessages = expressAsyncHandler(async (req, res, next) => {
  const senderId = req?.user?._id;
  const receiverId = req?.params?.id;
  const conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });
  const messages = await conversation.populate("messages");
  if (messages) {
    res.status(200).json(messages);
    return next();
  }
});

export const sendMessage = expressAsyncHandler(async (req, res, next) => {
  const { id: receiverId } = req?.params;
  const senderId = req?.user?._id;
  const content = req?.body?.content;
  let conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    conversation = new Conversation({
      members: [senderId, receiverId],
    });
  }
  const newMessage = new Message({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
  });
  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  Promise.all([await conversation.save(), await newMessage.save()]).then(
    ([conversation, message]) => {
      res.status(201).json({
        message: "Message sent successfully",
        conversation,
        message,
      });
      return next();
    }
  );

  const notification = new Notification({
    user: receiverId,
    type: "message",
    message: `${req.user.name} sent you a message`,
  });
  await notification.save();

  const receiverSocketId = getUserSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", {
      newMessage,
    });
    io.to(receiverSocketId).emit("messageNotification", {
      notification,
    });
  }
});
