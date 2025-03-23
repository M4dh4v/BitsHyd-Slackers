import express from "express";
import Message from "../models/message.model.js";

const router = express.Router();

// Get messages for a specific event
router.get("/:eventId", async (req, res) => {
  try {
    const messages = await Message.find({ eventId: req.params.eventId })
      .populate("userId", "name") // Fetch user name
      .sort({ createdAt: 1 }); // Sort messages by time
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// Save a new message
router.post("/", async (req, res) => {
  try {
    const { userId, eventId, message } = req.body;
    const newMessage = new Message({ userId, eventId, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error saving message", error });
  }
});

export default router;
