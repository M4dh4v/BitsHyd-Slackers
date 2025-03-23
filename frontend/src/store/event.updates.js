import { useEventStore } from "./event.store";

export const updateEventList = async () => {
  try {
    const { fetchEvents } = useEventStore.getState();
    await fetchEvents(true);
    return true;
  } catch (error) {
    console.error("Error loading orders: ", error);
    return false;
  }
};
