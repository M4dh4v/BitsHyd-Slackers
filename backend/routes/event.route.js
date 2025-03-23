import express from "express";
import Event from "../models/event.model.js"; 
import { protect as authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

export default (io) => {
  // Fetch all events
  router.get("/", async (req, res) => {
    try {
      const events = await Event.find();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events", error });
    }
  });

  // Fetch a single event by ID
  router.get("/:id", async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving event", error });
    }
  });

  // Add a new event (only organizers can add events)
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { name, live, image, description, phoneNumbers } = req.body;

      // Check if user is an organizer
      if (!req.user.organizer) {
        return res.status(403).json({ message: "Only organizers can add events" });
      }

      if (!name) {
        return res.status(400).json({ message: "Event name is required" });
      }

      const newEvent = new Event({ 
        name, 
        live, 
        image, 
        description,
        phoneNumbers: phoneNumbers || [] 
      });
      
      await newEvent.save();

      io.emit("eventList"); // Emit event update

      res.status(201).json({
        success: true,
        message: "Event added successfully",
        event: newEvent,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add event", error });
    }
  });

  // Update an event by ID (only organizers can update events)
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const { name, live, image, description, phoneNumbers } = req.body;

      // Check if user is an organizer
      if (!req.user.organizer) {
        return res.status(403).json({ message: "Only organizers can update events" });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { name, live, image, description, phoneNumbers },
        { new: true, runValidators: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      io.emit("eventList"); // Emit event update

      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        event: updatedEvent,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update event", error });
    }
  });

  // Delete an event by ID (only organizers can delete events)
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an organizer
      if (!req.user.organizer) {
        return res.status(403).json({ message: "Only organizers can delete events" });
      }

      const deletedEvent = await Event.findByIdAndDelete(req.params.id);
      if (!deletedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      io.emit("eventList"); // Emit event update

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event", error });
    }
  });

  // Add allowed phone numbers to an event (only organizers)
  router.post("/:id/phone-numbers", authMiddleware, async (req, res) => {
    try {
      const { phoneNumbers } = req.body;
      
      // Check if user is an organizer
      if (!req.user.organizer) {
        return res.status(403).json({ message: "Only organizers can manage allowed phone numbers" });
      }

      if (!Array.isArray(phoneNumbers)) {
        return res.status(400).json({ message: "Phone numbers must be an array" });
      }

      // Find the event by ID
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Initialize phone numbers array if it doesn't exist
      if (!event.phoneNumbers) {
        event.phoneNumbers = [];
      }

      // Filter out invalid phone numbers and add valid ones
      const validPhoneNumbers = [];
      for (const num of phoneNumbers) {
        if (typeof num === 'string' && num.trim() !== '') {
          validPhoneNumbers.push(num.trim());
        }
      }

      // Add new phone numbers (avoid duplicates)
      const existingNumbers = new Set(event.phoneNumbers);
      validPhoneNumbers.forEach(number => existingNumbers.add(number));
      
      // Update the event directly using findByIdAndUpdate to avoid validation issues
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { phoneNumbers: Array.from(existingNumbers) },
        { new: true, runValidators: false }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: "Failed to update event" });
      }

      res.status(200).json({
        success: true,
        message: "Phone numbers added successfully",
        phoneNumbers: updatedEvent.phoneNumbers
      });
    } catch (error) {
      console.error("Error adding phone numbers:", error);
      res.status(500).json({ 
        message: "Failed to add phone numbers", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Remove phone numbers from an event (only organizers)
  router.delete("/:id/phone-numbers", authMiddleware, async (req, res) => {
    try {
      const { phoneNumbers } = req.body;
      
      // Check if user is an organizer
      if (!req.user.organizer) {
        return res.status(403).json({ message: "Only organizers can manage allowed phone numbers" });
      }

      if (!Array.isArray(phoneNumbers)) {
        return res.status(400).json({ message: "Phone numbers must be an array" });
      }

      // Find the event by ID
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // If no phone numbers exist, return early
      if (!event.phoneNumbers || event.phoneNumbers.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No phone numbers to remove",
          phoneNumbers: []
        });
      }

      // Remove specified phone numbers
      const updatedPhoneNumbers = (event.phoneNumbers || []).filter(
        number => !phoneNumbers.includes(number)
      );
      
      // Update the event directly using findByIdAndUpdate to avoid validation issues
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { phoneNumbers: updatedPhoneNumbers },
        { new: true, runValidators: false }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: "Failed to update event" });
      }

      res.status(200).json({
        success: true,
        message: "Phone numbers removed successfully",
        phoneNumbers: updatedEvent.phoneNumbers
      });
    } catch (error) {
      console.error("Error removing phone numbers:", error);
      res.status(500).json({ 
        message: "Failed to remove phone numbers", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Check if a phone number is allowed for an event
  router.get("/:id/check-phone/:phoneNumber", async (req, res) => {
    try {
      const { id, phoneNumber } = req.params;
      
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const isAllowed = event.phoneNumbers && event.phoneNumbers.includes(phoneNumber);
      
      res.status(200).json({
        allowed: isAllowed
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check phone number", error });
    }
  });

  return router;
};
