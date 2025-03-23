import React, { useEffect } from "react";
import { useEventStore } from "../store/event.store";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import EventCard from "../components/EventCard";

import { useColorModeValue } from "@chakra-ui/react";

const Home = () => {
  const { events, loading, error, fetchEvents } = useEventStore();

  const textPrimary = useColorModeValue("black", "gray.200");

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Box width="100vw" minHeight="100vh" p={6}>
      <Text
        fontSize="2xl"
        color={textPrimary}
        fontWeight="bold"
        textAlign="center"
        mb={4}
      >
        Live Events
      </Text>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" h="40">
          <Spinner size="xl" />
        </Box>
      )}

      {error && (
        <Text textAlign="center" color="red.500" mt={4}>
          ⚠️ {error}
        </Text>
      )}

      {/* Events List */}
      <VStack spacing={4} align="stretch">
        {events.length > 0
          ? events.map((event) => <EventCard key={event._id} event={event} />)
          : !loading && (
              <Text textAlign="center" color="gray.500">
                No events found.
              </Text>
            )}
      </VStack>
    </Box>
  );
};

export default Home;
