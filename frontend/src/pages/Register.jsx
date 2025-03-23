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
  useToast,
  Text
} from "@chakra-ui/react";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { register, loading, error, user, token } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordColor, setPasswordColor] = useState("gray.500");

  // Redirect if already logged in
  useEffect(() => {
    if (token && user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength when password field changes
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
      setPasswordColor("gray.500");
      return;
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = 
      [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    if (strength < 2) {
      setPasswordStrength("Weak");
      setPasswordColor("red.500");
    } else if (strength < 4) {
      setPasswordStrength("Moderate");
      setPasswordColor("orange.500");
    } else {
      setPasswordStrength("Strong");
      setPasswordColor("green.500");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phoneNumber || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Password length validation
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Phone number validation
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number (10-15 digits)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    console.log("Attempting to register with:", {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      passwordLength: formData.password.length
    });

    const success = await register(formData.name, formData.phoneNumber, formData.password);

    if (success) {
      toast({
        title: "Registration successful",
        description: "Your account has been created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    } else if (error) {
      toast({
        title: "Registration failed",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="md" py={5}>
      <Heading textAlign="center" mb={6}>
        Create Account
      </Heading>

      {error && (
        <Box color="red.500" textAlign="center" mb={4} p={3} bg="red.50" borderRadius="md">
          {error}
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={4}>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <Text fontSize="xs" color="gray.500">Format: 10-15 digits without spaces or special characters</Text>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={togglePasswordVisibility}>
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {passwordStrength && (
              <Text fontSize="xs" color={passwordColor} mt={1}>
                Password strength: {passwordStrength}
              </Text>
            )}
            <Text fontSize="xs" color="gray.500">Minimum 6 characters required</Text>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="green"
            width="full"
            isLoading={loading}
            mt={2}
          >
            Create Account
          </Button>

          <Button
            onClick={() => navigate("/login")}
            colorScheme="blue"
            variant="outline"
            width="full"
          >
            Back to Login
          </Button>
        </Flex>
      </form>
    </Container>
  );
};

export default Register;
