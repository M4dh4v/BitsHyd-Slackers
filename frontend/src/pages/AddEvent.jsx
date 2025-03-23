import React, { useState, useEffect } from "react";
import { useEventStore } from "../store/event.store";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Textarea,
  Switch,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormHelperText,
  Stack,
  HStack,
  VStack,
  Text,
  useToast,
  Divider,
  IconButton,
} from "@chakra-ui/react";

const AddEvent = () => {
  const { addEvent, loading, error } = useEventStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    live: true,
    image: "",
    description: "",
    phoneNumbers: [""],
  });

  const [formErrors, setFormErrors] = useState({});

  // Redirect is handled by OrganizerRoute component now
  
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toggleColor = useColorModeValue("brand.500", "brand.300");
  const toggleOffColor = useColorModeValue("gray.300", "gray.600");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleToggle = () => {
    setFormData({ ...formData, live: !formData.live });
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...formData.phoneNumbers];
    updatedPhones[index] = value;
    setFormData({ ...formData, phoneNumbers: updatedPhones });
    
    // Clear phone number errors when user edits
    if (formErrors.phoneNumbers) {
      setFormErrors({ ...formErrors, phoneNumbers: "" });
    }
  };

  const addPhoneNumber = () => {
    setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, ""] });
  };

  const removePhoneNumber = (index) => {
    const updatedPhones = [...formData.phoneNumbers];
    updatedPhones.splice(index, 1);
    setFormData({ ...formData, phoneNumbers: updatedPhones });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Event name is required";
    }
    
    // Validate phone numbers (if any are provided)
    const nonEmptyPhones = formData.phoneNumbers.filter(phone => phone.trim() !== "");
    if (nonEmptyPhones.length > 0) {
      const invalidPhones = nonEmptyPhones.filter(phone => !/^\d{10,15}$/.test(phone.trim()));
      if (invalidPhones.length > 0) {
        errors.phoneNumbers = "All phone numbers must be 10-15 digits";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Filter out empty phone numbers
    const filteredPhoneNumbers = formData.phoneNumbers.filter(
      (phone) => phone.trim() !== ""
    );
    
    try {
      await addEvent({
        ...formData,
        phoneNumbers: filteredPhoneNumbers,
      });
      
      toast({
        title: "Success",
        description: "Event created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description: error || "Failed to create event",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.md">
        <Box 
          bg={cardBgColor} 
          borderRadius="lg" 
          boxShadow="md" 
          p={6}
          border="1px"
          borderColor={borderColor}
        >
          <Heading size="lg" mb={6}>Create New Event</Heading>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl isRequired isInvalid={!!formErrors.name}>
                <FormLabel>Event Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                />
                {formErrors.name && (
                  <FormHelperText color="red.500">{formErrors.name}</FormHelperText>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  resize="vertical"
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                />
                <FormHelperText>
                  Provide a URL to an image for your event
                </FormHelperText>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="live-switch" mb="0">
                  Event is Live
                </FormLabel>
                <Switch
                  id="live-switch"
                  isChecked={formData.live}
                  onChange={handleToggle}
                  colorScheme="brand"
                />
              </FormControl>
              
              <Divider />
              
              <FormControl isInvalid={!!formErrors.phoneNumbers}>
                <FormLabel>Allowed Phone Numbers</FormLabel>
                <FormHelperText mb={4}>
                  Only users with these phone numbers will be able to send messages in this event.
                  Leave empty to allow all users to send messages.
                </FormHelperText>
                
                <VStack spacing={3} align="stretch">
                  {formData.phoneNumbers.map((phone, index) => (
                    <HStack key={index}>
                      <Input
                        value={phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder="Enter phone number (e.g., 1234567890)"
                      />
                      {formData.phoneNumbers.length > 1 && (
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => removePhoneNumber(index)}
                          aria-label="Remove phone number"
                          colorScheme="red"
                          variant="ghost"
                        />
                      )}
                    </HStack>
                  ))}
                  
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={addPhoneNumber}
                    variant="outline"
                    alignSelf="flex-start"
                  >
                    Add Phone Number
                  </Button>
                  
                  {formErrors.phoneNumbers && (
                    <Text color="red.500">{formErrors.phoneNumbers}</Text>
                  )}
                </VStack>
              </FormControl>
              
              <Flex justify="space-between" mt={6}>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={loading}
                  loadingText="Creating..."
                >
                  Create Event
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default AddEvent;
