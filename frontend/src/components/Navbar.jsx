import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaCog, FaCalendarAlt } from "react-icons/fa";
import {
  Box,
  Button,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();

  const bg = useColorModeValue("white", "gray.800");
  const textPrimary = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const menuBg = useColorModeValue("white", "gray.700");

  return (
    <Box
      as="nav"
      bg={bg}
      color={textPrimary}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      boxShadow="sm"
      p={3}
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        {/* Left: App Button */}
        <Button
          as={Link}
          to="/"
          colorScheme="brand"
          _hover={{ bg: "brand.600" }}
        >
          Slackers
        </Button>

        {/* Right: Icons */}
        <Flex align="center" gap={4}>
          {/* Add Button - Only visible to organizers */}
          {user && user.organizer && (
            <Tooltip label="Create New Event" hasArrow>
              <IconButton
                as={Link}
                to="/add"
                icon={<FaPlus />}
                colorScheme="brand"
                borderRadius="full"
                _hover={{ bg: "brand.600" }}
                aria-label="Add Event"
              />
            </Tooltip>
          )}

          {/* Events Button - Visible to all */}
          <Tooltip label="View Events" hasArrow>
            <IconButton
              as={Link}
              to="/"
              icon={<FaCalendarAlt />}
              variant="ghost"
              color={textPrimary}
              _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
              aria-label="View Events"
            />
          </Tooltip>

          {/* Theme Switcher */}
          <Tooltip label={`Switch to ${colorMode === 'dark' ? 'Light' : 'Dark'} Mode`} hasArrow>
            <IconButton
              onClick={toggleColorMode}
              icon={colorMode === "dark" ? <FaSun /> : <FaMoon />}
              variant="ghost"
              color={textPrimary}
              _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
              aria-label="Toggle Theme"
            />
          </Tooltip>

          {/* User Menu */}
          {user ? (
            <Menu>
              <Tooltip label="User Menu" hasArrow>
                <MenuButton>
                  <Avatar 
                    size="sm" 
                    name={user.name} 
                    bg="brand.500" 
                    color="white"
                    _hover={{ 
                      transform: "scale(1.05)",
                      transition: "all 0.2s ease-in-out"
                    }}
                  />
                </MenuButton>
              </Tooltip>
              <MenuList bg={menuBg} borderColor={borderColor} shadow="lg">
                <Box px={3} py={2}>
                  <Text fontWeight="bold">{user.name}</Text>
                  <Text fontSize="sm" opacity={0.8}>{user.email}</Text>
                  {user.organizer && (
                    <Badge colorScheme="brand" mt={1}>Organizer</Badge>
                  )}
                </Box>
                <MenuDivider />
                {user.organizer && (
                  <>
                    <MenuItem 
                      as={Link} 
                      to="/add" 
                      icon={<FaPlus />}
                    >
                      Create Event
                    </MenuItem>
                    <MenuItem 
                      as={Link} 
                      to="/manage-events" 
                      icon={<FaCog />}
                    >
                      Manage Events
                    </MenuItem>
                    <MenuDivider />
                  </>
                )}
                <MenuItem 
                  as={Link} 
                  to="/profile" 
                  icon={<FaUserCircle />}
                >
                  Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem 
                  icon={<FaSignOutAlt />} 
                  onClick={logout}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              as={Link}
              to="/login"
              variant="outline"
              size="sm"
              colorScheme="brand"
              _hover={{ bg: "brand.50" }}
            >
              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
