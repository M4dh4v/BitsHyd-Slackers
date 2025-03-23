import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/user.store";
import { 
  Button, 
  Container, 
  Flex, 
  Heading, 
  Input, 
  Box, 
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  useToast
} from "@chakra-ui/react";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loading, error, user, token } = useUserStore();

  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token && user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { phoneNumber, password } = formData;

    if (!phoneNumber || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both phone number and password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const success = await login(phoneNumber, password);

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    }
  };

  return (
    <Container maxW="md" py={5}>
      <Heading textAlign="center" mb={6}>
        Login
      </Heading>

      {error && (
        <Box color="red.500" textAlign="center" mb={4} p={3} bg="red.50" borderRadius="md">
          {error}
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={4}>
          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={togglePasswordVisibility}>
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            colorScheme="green"
            width="full"
            isLoading={loading}
            mt={2}
          >
            Login
          </Button>

          <Button
            onClick={() => navigate("/register")}
            colorScheme="blue"
            variant="outline"
            width="full"
          >
            Create Account
          </Button>
        </Flex>
      </form>
    </Container>
  );
};

export default Login;
