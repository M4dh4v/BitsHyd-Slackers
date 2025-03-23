import { create } from "zustand";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api.config";

export const useMessagesStore = create((set, get) => {
  const socket = io(API_BASE_URL);

  return {
    messages: [],
    fetchMessages: async (eventId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${eventId}`);
        const data = await res.json();
        set({ messages: data });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    sendMessage: (message) => {
      socket.emit("sendMessage", message);
    },
    listenForMessages: () => {
      socket.on("receiveMessage", (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
      });
    },
  };
});
