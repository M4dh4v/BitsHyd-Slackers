import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

export const useEventStore = create((set) => ({
  events: [],
  loading: false,
  error: null,

  // ✅ Fetch all events
  fetchEvents: async () => {
    try {
      set((state) => ({ ...state, loading: true, error: null }));

      const response = await axios.get(`${API_BASE_URL}/api/event`);
      console.log("Fetched events:", response.data);

      set((state) => ({
        ...state,
        events: Array.isArray(response.data) ? response.data : [],
        loading: false,
      }));
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      set((state) => ({
        ...state,
        error: error.response?.data?.message || "Failed to fetch events",
        loading: false,
      }));
    }
  },

  // ✅ Add a new event
  addEvent: async (eventData) => {
    try {
      set((state) => ({ ...state, loading: true, error: null }));

      const response = await axios.post(`${API_BASE_URL}/api/event`, eventData);
      console.log("Event added:", response.data.event);

      set((state) => ({
        ...state,
        events: [...state.events, response.data.event],
        loading: false,
      }));

      return { success: true, message: "Event added successfully" };
    } catch (error) {
      console.error("❌ Error adding event:", error);
      set((state) => ({
        ...state,
        error: error.response?.data?.message || "Failed to add event",
        loading: false,
      }));
      return { success: false, message: "Failed to add event" };
    }
  },

  // ✅ Update an event by ID
  updateEvent: async (id, updatedData) => {
    try {
      set((state) => ({ ...state, loading: true, error: null }));

      const response = await axios.put(
        `${API_BASE_URL}/api/event/${id}`,
        updatedData
      );
      console.log("Event updated:", response.data.event);

      set((state) => ({
        ...state,
        events: state.events.map((event) =>
          event._id === id ? response.data.event : event
        ),
        loading: false,
      }));

      return { success: true, message: "Event updated successfully" };
    } catch (error) {
      console.error("❌ Error updating event:", error);
      set((state) => ({
        ...state,
        error: error.response?.data?.message || "Failed to update event",
        loading: false,
      }));
      return { success: false, message: "Failed to update event" };
    }
  },

  // ✅ Delete an event by ID
  deleteEvent: async (id) => {
    try {
      set((state) => ({ ...state, loading: true, error: null }));

      await axios.delete(`${API_BASE_URL}/api/event/${id}`);
      console.log("Event deleted:", id);

      set((state) => ({
        ...state,
        events: state.events.filter((event) => event._id !== id),
        loading: false,
      }));

      return { success: true, message: "Event deleted successfully" };
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      set((state) => ({
        ...state,
        error: error.response?.data?.message || "Failed to delete event",
        loading: false,
      }));
      return { success: false, message: "Failed to delete event" };
    }
  },
}));
