import {
  Box,
  Image,
  Text,
  Button,
  VStack,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {
  const bg = useColorModeValue("gray.100", "gray.800");
  const textPrimary = useColorModeValue("black", "gray.200");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const joinButtonColor = useColorModeValue("teal", "purple.500");

  const navigate = useNavigate();

  const handleJoin = () => {
    navigate(`/event/${event._id}`); // ✅ Now passes event ID dynamically
  };

  return (
    <Box
      width="100%"
      minH="180px"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      borderColor={borderColor}
      p={4}
      shadow="md"
    >
      <Flex align="center" gap={4}>
        {/* Event Image */}
        <Image
          src={event.image}
          alt={event.title}
          boxSize="120px"
          objectFit="cover"
          borderRadius="lg"
        />

        {/* Event Details */}
        <VStack align="start" flex="1" spacing={2} justify="center">
          {/* Event Name */}
          <Text
            fontSize={{ base: "20px", md: "24px" }} // ✅ Responsive size
            fontWeight="bold"
            color={textPrimary}
            noOfLines={2} // ✅ Ensures wrapping if long
            wordBreak="break-word"
          >
            {event.name}
          </Text>

          {/* Event Title */}
          <Text fontSize="lg" fontWeight="bold" color={textPrimary}>
            {event.title}
          </Text>

          {/* Event Description */}
          <Text fontSize="md" color={textSecondary} noOfLines={3}>
            {event.description}
          </Text>
        </VStack>

        {/* Join Button */}
        <Button
          bg={joinButtonColor}
          color="white"
          _hover={{ opacity: 0.8 }}
          borderRadius="md"
          fontSize="20px" // ✅ Slightly reduced for balance
          px={8} // ✅ Maintains rectangular shape
          py={6}
          onClick={handleJoin}
        >
          JOIN
        </Button>
      </Flex>
    </Box>
  );
};

export default EventCard;
