import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api.config";
import { updateEventList } from "../store/event.updates";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket Connected");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.warn("⚠️ Socket Disconnected");
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err);
    });

    newSocket.on("eventList", async () => {
      try {
        const success = await updateEventList();
        if (!success) {
          console.log("Failed to update order list");
        } else {
          console.log("events refreshed");
        }
      } catch (err) {
        console.error(err);
      }
    });

    newSocket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle message errors
  useEffect(() => {
    if (!socket) return;

    const handleMessageError = (error) => {
      console.error("Message error:", error);
      // You could add toast notifications here if you have a UI notification system
    };

    socket.on("messageError", handleMessageError);

    return () => {
      socket.off("messageError", handleMessageError);
    };
  }, [socket]);

  const sendMessage = (message) => {
    if (socket) {
      socket.emit("sendMessage", message);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, connected, messages, sendMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
