import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/slackers")
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function createOrganizerAccount() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ phno: "1234567890" });
    
    if (existingUser) {
      console.log("User with phone number 1234567890 already exists");
      
      // Update to make them an organizer if they're not already
      if (!existingUser.organizer) {
        existingUser.organizer = true;
        await existingUser.save();
        console.log("User updated to organizer role");
      } else {
        console.log("User is already an organizer");
      }
    } else {
      // Create a new organizer account
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("1234567890", salt);
      
      const newUser = new User({
        name: "XXXX",
        phno: "1234567890",
        password: hashedPassword,
        organizer: true
      });
      
      await newUser.save();
      console.log("Organizer account created successfully");
    }
    
    // Display all organizers
    const organizers = await User.find({ organizer: true });
    console.log("\nCurrent Organizers:");
    organizers.forEach(org => {
      console.log(`- ${org.name} (${org.phno})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating organizer account:", error);
    process.exit(1);
  }
}

createOrganizerAccount();
