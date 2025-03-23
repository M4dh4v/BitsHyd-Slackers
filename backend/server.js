import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import eventRoutes from "./routes/event.route.js";
import userRoutes from "./routes/user.route.js";
import messagesRoutes from "./routes/message.route.js";
import { connectDB } from "./config/db.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";
import Event from "./models/event.model.js";

// Load environment variables first
dotenv.config();

// Log environment variables for debugging (excluding sensitive data)
console.log("Environment variables loaded:");
console.log("PORT_BACK:", process.env.PORT_BACK);
console.log("PORT_FRONT:", process.env.PORT_FRONT);
console.log("BASE:", process.env.BASE);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

const app = express();
const httpServer = createServer(app);

// Configure CORS (Allow all origins)
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  allowEIO3: true,
  transports: ["websocket", "polling"],
});

// Express CORS configuration (Allow all origins)
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware for request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Define API routes
app.use("/api/event", eventRoutes(io));
app.use("/api/user", userRoutes);
app.use("/api/messages", messagesRoutes);

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Track users in each event room
const eventRooms = new Map(); // eventId -> Set of socket IDs

// Helper to update user count in a room
const updateUserCount = (eventId) => {
  const count = eventRooms.get(eventId)?.size || 0;
  io.to(eventId).emit("userCount", count);
  console.log(`Event ${eventId} has ${count} users`);
};

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);
  
  // Track which events this socket has joined
  const joinedEvents = new Set();

  // Join an event room
  socket.on("joinEvent", (eventId) => {
    if (isValidObjectId(eventId)) {
      // Join the socket room
      socket.join(eventId);
      joinedEvents.add(eventId);
      
      // Add to tracking
      if (!eventRooms.has(eventId)) {
        eventRooms.set(eventId, new Set());
      }
      eventRooms.get(eventId).add(socket.id);
      
      // Update user count
      updateUserCount(eventId);
      
      console.log(`User ${socket.id} joined event: ${eventId}`);
    } else {
      console.error(`Invalid event ID: ${eventId}`);
    }
  });

  // Handle incoming messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const { userId, eventId, message } = messageData;
      if (!userId || !eventId || !message) {
        console.log("Missing required message data:", messageData);
        socket.emit("messageError", { error: "Missing required message data" });
        return;
      }

      // Validate eventId format (must be a valid ObjectId)
      if (!isValidObjectId(eventId)) {
        console.error("Invalid eventId format:", eventId);
        socket.emit("messageError", { error: "Invalid event ID format" });
        return;
      }

      try {
        // Get user name and phone number
        let userName = "Unknown User";
        let userPhoneNumber = null;
        
        if (isValidObjectId(userId)) {
          // If it's a valid ObjectId, try to find the user in MongoDB
          try {
            const user = await User.findById(userId);
            if (user) {
              userName = user.name;
              userPhoneNumber = user.phno;
            } else {
              socket.emit("messageError", { error: "User not found" });
              return;
            }
          } catch (userError) {
            console.error("Error finding user:", userError);
            socket.emit("messageError", { error: "Error finding user" });
            return;
          }
        } else {
          // For in-memory users with timestamp IDs
          console.log("Using non-ObjectId userId:", userId);
          socket.emit("messageError", { error: "Invalid user ID. Please log in again." });
          return;
        }

        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
          socket.emit("messageError", { error: "Event not found" });
          return;
        }

        // Check if the user's phone number is allowed for this event
        if (event.phoneNumbers && event.phoneNumbers.length > 0) {
          if (!userPhoneNumber || !event.phoneNumbers.includes(userPhoneNumber)) {
            socket.emit("messageError", { 
              error: "Your phone number is not authorized to send messages in this event" 
            });
            return;
          }
        }

        const newMessage = new Message({ 
          userId, 
          eventId, 
          message,
          userName
        });
        
        await newMessage.save();

        // For non-ObjectId users, we can't use populate, so we'll manually create the response
        const messageResponse = {
          _id: newMessage._id,
          userId: {
            _id: userId,
            name: userName
          },
          eventId: newMessage.eventId,
          message: newMessage.message,
          createdAt: newMessage.createdAt,
        };

        // Send the message to all users in the event room
        io.to(eventId).emit("receiveMessage", messageResponse);
        
        console.log("Message saved successfully:", newMessage._id);
      } catch (saveError) {
        console.error("Error saving message:", saveError);
        socket.emit("messageError", { 
          error: "Failed to save message", 
          details: saveError.message 
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.emit("messageError", { 
        error: "Server error processing message", 
        details: error.message 
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from all joined event rooms
    joinedEvents.forEach(eventId => {
      if (eventRooms.has(eventId)) {
        eventRooms.get(eventId).delete(socket.id);
        updateUserCount(eventId);
      }
    });
  });
});

// Connect to database before starting server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server after successful database connection
    const PORT = process.env.PORT_BACK || 5000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
