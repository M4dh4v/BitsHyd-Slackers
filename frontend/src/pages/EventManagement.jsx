import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { API_BASE_URL } from "../config/api.config";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { FaEdit, FaTrash, FaPlus, FaPhone } from "react-icons/fa";

const EventManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // Form state for creating/editing events
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    image: "",
    live: true,
  });

  // Modal controls
  const { 
    isOpen: isEventModalOpen, 
    onOpen: onEventModalOpen, 
    onClose: onEventModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isPhoneModalOpen, 
    onOpen: onPhoneModalOpen, 
    onClose: onPhoneModalClose 
  } = useDisclosure();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch events on component mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.organizer) {
      toast({
        title: "Access Denied",
        description: "Only organizers can access this page",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
      return;
    }

    fetchEvents();
  }, [user, navigate, toast]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/event`);
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openCreateEventModal = () => {
    setEventForm({
      name: "",
      description: "",
      image: "",
      live: true,
    });
    setCurrentEvent(null);
    onEventModalOpen();
  };

  const openEditEventModal = (event) => {
    setEventForm({
      name: event.name,
      description: event.description || "",
      image: event.image || "",
      live: event.live,
    });
    setCurrentEvent(event);
    onEventModalOpen();
  };

  const openPhoneNumberModal = (event) => {
    setCurrentEvent(event);
    setPhoneNumbers(event.phoneNumbers || []);
    setNewPhoneNumber("");
    onPhoneModalOpen();
  };

  const handleCreateOrUpdateEvent = async () => {
    try {
      if (!eventForm.name) {
        toast({
          title: "Error",
          description: "Event name is required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (currentEvent) {
        // Update existing event
        await axios.put(`${API_BASE_URL}/api/event/${currentEvent._id}`, eventForm);
        toast({
          title: "Success",
          description: "Event updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new event
        await axios.post(`${API_BASE_URL}/api/event`, eventForm);
        toast({
          title: "Success",
          description: "Event created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      onEventModalClose();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save event",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/event/${eventId}`);
      toast({
        title: "Success",
        description: "Event deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addPhoneNumber = () => {
    if (!newPhoneNumber.trim()) return;
    
    // Basic phone number validation
    if (!/^\d{10,15}$/.test(newPhoneNumber.trim())) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid phone number (10-15 digits)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check for duplicates
    if (phoneNumbers.includes(newPhoneNumber.trim())) {
      toast({
        title: "Duplicate",
        description: "This phone number is already in the list",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setPhoneNumbers([...phoneNumbers, newPhoneNumber.trim()]);
    setNewPhoneNumber("");
  };

  const removePhoneNumber = (index) => {
    const updatedNumbers = [...phoneNumbers];
    updatedNumbers.splice(index, 1);
    setPhoneNumbers(updatedNumbers);
  };

  const savePhoneNumbers = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/event/${currentEvent._id}/phone-numbers`, {
        phoneNumbers,
      });
      
      toast({
        title: "Success",
        description: "Phone numbers updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onPhoneModalClose();
      fetchEvents();
    } catch (error) {
      console.error("Error saving phone numbers:", error);
      toast({
        title: "Error",
        description: "Failed to save phone numbers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user || !user.organizer) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Event Management</Heading>
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="brand" 
            onClick={openCreateEventModal}
          >
            Create New Event
          </Button>
        </Flex>

        <Box 
          bg={cardBgColor} 
          borderRadius="lg" 
          boxShadow="md" 
          p={6}
        >
          {loading ? (
            <Text>Loading events...</Text>
          ) : events.length === 0 ? (
            <Text>No events found. Create your first event!</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Allowed Phone Numbers</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {events.map((event) => (
                  <Tr key={event._id}>
                    <Td fontWeight="medium">{event.name}</Td>
                    <Td>
                      <Badge colorScheme={event.live ? "green" : "red"}>
                        {event.live ? "LIVE" : "INACTIVE"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Text>{event.phoneNumbers?.length || 0}</Text>
                        <IconButton
                          size="sm"
                          icon={<FaPhone />}
                          aria-label="Manage phone numbers"
                          onClick={() => openPhoneNumberModal(event)}
                        />
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FaEdit />}
                          aria-label="Edit event"
                          size="sm"
                          onClick={() => openEditEventModal(event)}
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Delete event"
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteEvent(event._id)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/event/${event._id}`)}
                        >
                          View
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Container>

      {/* Event Create/Edit Modal */}
      <Modal isOpen={isEventModalOpen} onClose={onEventModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentEvent ? "Edit Event" : "Create New Event"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Event Name</FormLabel>
                <Input
                  name="name"
                  value={eventForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                  resize="vertical"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="image"
                  value={eventForm.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="live-switch" mb="0">
                  Event is Live
                </FormLabel>
                <Switch
                  id="live-switch"
                  name="live"
                  isChecked={eventForm.live}
                  onChange={handleInputChange}
                  colorScheme="brand"
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEventModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreateOrUpdateEvent}>
              {currentEvent ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Phone Numbers Modal */}
      <Modal isOpen={isPhoneModalOpen} onClose={onPhoneModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Allowed Phone Numbers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Only users with these phone numbers will be able to send messages in this event.
              </Text>
              
              <HStack>
                <Input
                  placeholder="Add phone number (e.g., 1234567890)"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPhoneNumber();
                    }
                  }}
                />
                <Button onClick={addPhoneNumber}>Add</Button>
              </HStack>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb={2}>
                  {phoneNumbers.length} Allowed Phone Numbers:
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {phoneNumbers.map((number, index) => (
                    <Tag
                      key={index}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="brand"
                    >
                      <TagLabel>{number}</TagLabel>
                      <TagCloseButton onClick={() => removePhoneNumber(index)} />
                    </Tag>
                  ))}
                </Flex>
                {phoneNumbers.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No phone numbers added yet. If you leave this empty, all users can send messages.
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPhoneModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={savePhoneNumbers}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventManagement;
