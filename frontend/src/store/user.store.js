import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../config/api.config.js";

export const useUserStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // Set auth token in axios headers
  setAuthToken: (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  },

  // Fetch logged-in user details
  fetchUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null });
      return;
    }

    try {
      set({ loading: true });
      // Set token in headers
      get().setAuthToken(token);
      
      const response = await axios.get(`${API_BASE_URL}/api/user/me`);
      set({ user: response.data, loading: false, error: null });
    } catch (error) {
      // Clear token if unauthorized
      if (error.response?.status === 401) {
        get().setAuthToken(null);
      }
      set({
        user: null,
        error: error.response?.data?.error || "Failed to fetch user",
        loading: false,
      });
    }
  },

  // Login user
  login: async (phoneNumber, password) => {
    try {
      set({ loading: true });
      console.log("Login attempt with:", { phno: phoneNumber, password: password ? "***" : undefined });
      
      const response = await axios.post(
        `${API_BASE_URL}/api/user/login`,
        { phno: phoneNumber, password }
      );

      const { token, ...userData } = response.data;
      
      // Set token in headers and localStorage
      get().setAuthToken(token);
      
      set({ user: userData, token, loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Login error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      set({
        error: error.response?.data?.error || "Login failed",
        loading: false,
      });
      return false;
    }
  },

  // Register new user
  register: async (name, phoneNumber, password) => {
    try {
      set({ loading: true });
      console.log("Registration attempt with:", { 
        name, 
        phno: phoneNumber, 
        password: password ? "***" : undefined 
      });
      
      const response = await axios.post(
        `${API_BASE_URL}/api/user/register`,
        { name, phno: phoneNumber, password }
      );

      const { token, ...userData } = response.data;
      
      // Set token in headers and localStorage
      get().setAuthToken(token);
      
      set({ user: userData, token, loading: false, error: null });
      return true;
    } catch (error) {
      console.error("Registration error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      set({
        error: error.response?.data?.error || "Registration failed",
        loading: false,
      });
      return false;
    }
  },

  // Logout user
  logout: () => {
    // Clear token
    get().setAuthToken(null);
    set({ user: null, token: null, error: null });
  },
}));

// Set initial auth token
if (localStorage.getItem("token")) {
  useUserStore.getState().setAuthToken(localStorage.getItem("token"));
}

export default useUserStore;
