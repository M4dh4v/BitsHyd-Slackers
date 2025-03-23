import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
} from "@chakra-ui/react";

const CreateOrganizer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const createOrganizerAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Step 1: Register the user
      const registerData = {
        name: "XXXX",
        phno: "1234567890",
        password: "1234567890"
      };

      try {
        const registerResponse = await axios.post(`${API_BASE_URL}/api/user/register`, registerData);
        setResult(prev => ({ ...prev, register: registerResponse.data }));
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
        });
      } catch (registerError) {
        // If user already exists, that's fine
        if (registerError.response?.data?.error === "Phone number already registered") {
          setResult(prev => ({ ...prev, register: { message: "User already exists" } }));
        } else {
          throw registerError;
        }
      }

      // Step 2: Login with the user
      const loginResponse = await axios.post(`${API_BASE_URL}/api/user/login`, {
        phno: "1234567890",
        password: "1234567890"
      });

      setResult(prev => ({ ...prev, login: loginResponse.data }));
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
      });

      // Step 3: Make the user an organizer
      const token = loginResponse.data.token;
      
      try {
        const makeOrganizerResponse = await axios.post(
          `${API_BASE_URL}/api/user/make-organizer`,
          { phno: "1234567890" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setResult(prev => ({ ...prev, makeOrganizer: makeOrganizerResponse.data }));
        toast({
          title: "User is now an organizer",
          status: "success",
          duration: 3000,
        });
      } catch (orgError) {
        // If this fails, we'll manually update the user in the next step
        console.error("Error making user an organizer:", orgError);
        setResult(prev => ({ ...prev, makeOrganizer: { error: "Failed to make organizer via API" } }));
      }

      // Success message
      toast({
        title: "Organizer account ready",
        description: "You can now log in with phone: 1234567890 and password: 1234567890",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error("Error creating organizer:", error);
      setError(error.response?.data?.error || error.message);
      toast({
        title: "Error creating organizer",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Create Organizer Account</Heading>
        <Text>
          This page will create an organizer account with the following credentials:
        </Text>
        
        <Box p={4} borderWidth="1px" borderRadius="md">
          <VStack align="start" spacing={2}>
            <Text><strong>Name:</strong> XXXX</Text>
            <Text><strong>Phone:</strong> 1234567890</Text>
            <Text><strong>Password:</strong> 1234567890</Text>
            <Text><strong>Role:</strong> Organizer</Text>
          </VStack>
        </Box>
        
        <Button
          colorScheme="brand"
          size="lg"
          onClick={createOrganizerAccount}
          isLoading={loading}
          loadingText="Creating account..."
        >
          Create Organizer Account
        </Button>
        
        {error && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Box>
            <Heading size="md" mb={2}>Result:</Heading>
            <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50" overflowX="auto">
              <Code whiteSpace="pre" display="block">
                {JSON.stringify(result, null, 2)}
              </Code>
            </Box>
            
            <Divider my={4} />
            
            <Alert status="success" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle>Account Ready!</AlertTitle>
                <AlertDescription>
                  You can now log in with the following credentials:
                  <Box mt={2}>
                    <Text><strong>Phone:</strong> 1234567890</Text>
                    <Text><strong>Password:</strong> 1234567890</Text>
                  </Box>
                </AlertDescription>
              </Box>
            </Alert>
            
            <Button 
              mt={4} 
              colorScheme="blue" 
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default CreateOrganizer;
