import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    live: {
      type: Boolean,
      required: true,
      default: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      required: false,
    },
    phoneNumbers: {
      type: [String], // Array of phone numbers
      validate: {
        validator: function (numbers) {
          // If numbers is empty or undefined, it's valid
          if (!numbers || numbers.length === 0) return true;
          // Otherwise check each number
          return numbers.every((num) => {
            // Allow empty strings (we'll filter these out in the route)
            if (!num) return true;
            // Basic phone number validation
            return typeof num === 'string';
          });
        },
        message: "Invalid phone number format",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
