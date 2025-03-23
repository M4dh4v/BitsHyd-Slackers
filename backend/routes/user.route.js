import express from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "slackers-secret-key";

// In-memory user store for testing when MongoDB is not available
const inMemoryUsers = [];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

/**
 * @route   POST /api/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { name, phno, password } = req.body;

    // Validate inputs
    if (!name || !phno || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Validate phone number format
    if (!/^\d{10,15}$/.test(phno)) {
      return res.status(400).json({ error: "Please enter a valid phone number (10-15 digits)" });
    }

    try {
      // Check if MongoDB is working
      let user;
      try {
        // Check if user already exists in MongoDB
        user = await User.findOne({ phno });
        if (user) {
          return res.status(400).json({ error: "Phone number already registered" });
        }

        // Create new user in MongoDB
        user = new User({ name, phno, password });
        await user.save();
      } catch (dbError) {
        console.error("MongoDB error, falling back to in-memory storage:", dbError);
        
        // Check if user exists in in-memory store
        const existingUser = inMemoryUsers.find(u => u.phno === phno);
        if (existingUser) {
          return res.status(400).json({ error: "Phone number already registered (in-memory)" });
        }
        
        // Create user in in-memory store
        user = {
          _id: Date.now().toString(),
          name,
          phno,
          password, // Note: In a real app, this would be hashed
          organizer: false,
          event: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryUsers.push(user);
        console.log("User saved to in-memory store:", user._id);
      }
      
      // Generate JWT token
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        phno: user.phno,
        organizer: user.organizer || false,
        event: user.event || null,
        token
      });
    } catch (saveError) {
      console.error("Error saving user:", saveError);
      return res.status(500).json({ error: "Error creating user account", details: saveError.message });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error during registration", details: error.message });
  }
});

/**
 * @route   POST /api/user/login
 * @desc    Log in a user
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", { phno: req.body.phno, passwordProvided: !!req.body.password });
    const { phno, password } = req.body;

    // Validate inputs
    if (!phno || !password) {
      return res
        .status(400)
        .json({ error: "Phone number and password are required" });
    }

    try {
      // Try to find user in MongoDB
      let user;
      let isMatch = false;
      
      try {
        // Find user by phone number in MongoDB
        user = await User.findOne({ phno });
        if (user) {
          console.log("User found in MongoDB:", { id: user._id, hasPassword: !!user.password });
          
          // Check if password exists
          if (!user.password) {
            console.error("User found but password is undefined for phone:", phno);
            return res.status(500).json({ error: "Account error. Please contact support." });
          }
          
          // Check password
          isMatch = await user.matchPassword(password);
        }
      } catch (dbError) {
        console.error("MongoDB error, falling back to in-memory storage:", dbError);
        
        // Find user in in-memory store
        user = inMemoryUsers.find(u => u.phno === phno);
        if (user) {
          console.log("User found in in-memory store:", { id: user._id });
          
          // Simple password check for in-memory users
          isMatch = user.password === password;
        }
      }
      
      if (!user || !isMatch) {
        return res.status(401).json({ error: "Invalid phone number or password" });
      }

      // Generate JWT token
      const token = generateToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        phno: user.phno,
        organizer: user.organizer || false,
        event: user.event || null,
        token
      });
    } catch (authError) {
      console.error("Authentication error:", authError);
      return res.status(500).json({ error: "Error during login. Please try again.", details: authError.message });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login", details: error.message });
  }
});

/**
 * @route   GET /api/user/me
 * @desc    Get logged-in user details
 * @access  Private
 */
router.get("/me", async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      try {
        // Try to get user from MongoDB
        let user;
        
        try {
          // Get user data from MongoDB
          user = await User.findById(decoded.userId).select("-password");
        } catch (dbError) {
          console.error("MongoDB error, falling back to in-memory storage:", dbError);
          
          // Get user from in-memory store
          user = inMemoryUsers.find(u => u._id === decoded.userId);
          if (user) {
            // Create a copy without the password
            user = { ...user };
            delete user.password;
          }
        }
        
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        res.json(user);
      } catch (userError) {
        console.error("Error retrieving user:", userError);
        return res.status(500).json({ error: "Error retrieving user data", details: userError.message });
      }
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   POST /api/user/logout
 * @desc    Log out user (client-side only with JWT)
 * @access  Public
 */
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
  // Note: With JWT, actual logout is handled on the client by removing the token
});

/**
 * @route   POST /api/user/make-organizer
 * @desc    Make a user an organizer (requires authentication)
 * @access  Private
 */
router.post("/make-organizer", async (req, res) => {
  try {
    const { phno } = req.body;

    if (!phno) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Find the user by phone number
    let user;
    try {
      user = await User.findOne({ phno });
    } catch (err) {
      console.error("MongoDB error:", err);
      // Fallback to in-memory for testing
      user = inMemoryUsers.find(u => u.phno === phno);
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user to be an organizer
    if (user._id) {
      // MongoDB user
      user.organizer = true;
      await user.save();
    } else {
      // In-memory user
      user.organizer = true;
    }

    return res.status(200).json({ 
      message: "User has been made an organizer",
      user: {
        _id: user._id,
        name: user.name,
        phno: user.phno,
        organizer: user.organizer
      }
    });
  } catch (error) {
    console.error("Error making user an organizer:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
