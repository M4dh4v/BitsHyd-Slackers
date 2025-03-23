import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed, 
      ref: "User", 
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", 
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      default: "Unknown User"
    }
  },
  { timestamps: true } 
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
