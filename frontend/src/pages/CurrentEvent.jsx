import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { API_BASE_URL } from "../config/api.config";
import { useSocket } from "../context/SocketContext";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  useToast,
  Avatar,
  Divider,
  Badge,
  IconButton,
  useColorModeValue,
  Spinner,
  Tooltip,
  Textarea,
} from "@chakra-ui/react";
import { FaArrowLeft, FaUsers, FaInfoCircle } from "react-icons/fa";

const CurrentEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { socket, sendMessage } = useSocket();
  
  // State variables
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAllowed, setIsAllowed] = useState(true);
  const [userCount, setUserCount] = useState(0);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Theme values
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const messageBgSelf = useColorModeValue("brand.100", "brand.800");
  const messageBgOthers = useColorModeValue("gray.100", "gray.600");

  // Join event room when socket connects
  useEffect(() => {
    if (!socket || !id) return;

    // Join the event room
    socket.emit("joinEvent", id);
    
    // Listen for user count updates
    socket.on("userCount", (count) => {
      setUserCount(count);
    });

    // Cleanup on unmount
    return () => {
      socket.off("userCount");
    };
  }, [socket, id]);

  // Set up message listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Listen for message errors
    const handleMessageError = (error) => {
      console.error("Message error:", error);
      if (error.error === "Your phone number is not authorized to send messages in this event") {
        setIsAllowed(false);
      }
      toast({
        title: "Error",
        description: error.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageError", handleMessageError);

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageError", handleMessageError);
    };
  }, [socket, toast]);

  // Fetch event details and past messages
  useEffect(() => {
    const fetchEventAndMessages = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await axios.get(`${API_BASE_URL}/api/event/${id}`);
        setEvent(eventResponse.data);
        
        // Fetch past messages for this event
        const messagesResponse = await axios.get(`${API_BASE_URL}/api/messages/${id}`);
        setMessages(messagesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load event data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    if (id) {
      fetchEventAndMessages();
    }
  }, [id, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || !user || !newMessage.trim()) return;

    if (!isAllowed) {
      toast({
        title: "Not Authorized",
        description: "Your phone number is not authorized to send messages in this event",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Send message to server
    sendMessage({
      userId: user._id,
      eventId: id,
      message: newMessage.trim(),
    });

    // Clear input field
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Rendering logic
  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box minH="100vh" p={8}>
        <Container maxW="container.md">
          <VStack spacing={4} align="stretch">
            <Button leftIcon={<FaArrowLeft />} onClick={() => navigate("/")} variant="ghost">
              Back to Events
            </Button>
            <Text>Event not found or has been removed.</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={4}>
      <Container maxW="container.lg">
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Button leftIcon={<FaArrowLeft />} onClick={() => navigate("/")} variant="ghost">
              Back to Events
            </Button>
            <HStack>
              <Tooltip label="Active Users" hasArrow>
                <Badge colorScheme="green" display="flex" alignItems="center" p={2} borderRadius="md">
                  <FaUsers style={{ marginRight: "8px" }} />
                  {userCount}
                </Badge>
              </Tooltip>
              {event.live ? (
                <Badge colorScheme="green" p={2} borderRadius="md">Live</Badge>
              ) : (
                <Badge colorScheme="red" p={2} borderRadius="md">Ended</Badge>
              )}
            </HStack>
          </HStack>

          <Box 
            bg={cardBgColor} 
            p={6} 
            borderRadius="lg" 
            boxShadow="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="lg">{event.name}</Heading>
                {user && user.organizer && (
                  <Tooltip label="Manage Event" hasArrow>
                    <IconButton
                      icon={<FaInfoCircle />}
                      onClick={() => navigate("/manage-events")}
                      aria-label="Manage Event"
                    />
                  </Tooltip>
                )}
              </Flex>
              
              {event.description && (
                <Text color="gray.600">{event.description}</Text>
              )}
              
              <Divider />
              
              <Box 
                height="400px" 
                overflowY="auto" 
                p={4} 
                borderRadius="md" 
                borderWidth="1px"
                borderColor={borderColor}
                ref={messageContainerRef}
                bg={useColorModeValue("gray.50", "gray.700")}
              >
                {messages.length === 0 ? (
                  <Text color="gray.500" textAlign="center">
                    No messages yet. Be the first to send a message!
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {messages.map((msg) => {
                      const isSelf = user && msg.userId._id === user._id;
                      return (
                        <Box 
                          key={msg._id} 
                          alignSelf={isSelf ? "flex-end" : "flex-start"}
                          maxWidth="80%"
                          bg={isSelf ? messageBgSelf : messageBgOthers}
                          p={3}
                          borderRadius="lg"
                          boxShadow="sm"
                        >
                          <Text fontWeight="bold" fontSize="sm" color={isSelf ? "brand.600" : "gray.600"}>
                            {isSelf ? "You" : msg.userId.name}
                          </Text>
                          <Text whiteSpace="pre-wrap">{msg.message}</Text>
                          <Text fontSize="xs" color="gray.500" textAlign="right">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </Text>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>
              
              <HStack>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isAllowed
                      ? "Type your message here... (Press Enter to send)"
                      : "Your phone number is not authorized to send messages"
                  }
                  disabled={!isAllowed || !user}
                  resize="none"
                  rows={2}
                />
                <Button 
                  colorScheme="brand" 
                  onClick={handleSendMessage}
                  isDisabled={!isAllowed || !user || !newMessage.trim()}
                  height="100%"
                >
                  Send
                </Button>
              </HStack>
              
              {!user && (
                <Text color="red.500" fontSize="sm">
                  Please log in to participate in the chat.
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default CurrentEvent;
