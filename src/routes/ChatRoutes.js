import express from "express";
import passport from "../controllers/AuthController.js";
import { getMessages, sendMessage } from "../controllers/MessageController.js";
const router = express.Router();

router.get("/:id/messages", passport.authenticate("session"), getMessages); //receiver id
router.post("/:id/send-message", passport.authenticate("session"), sendMessage);
export default router;
