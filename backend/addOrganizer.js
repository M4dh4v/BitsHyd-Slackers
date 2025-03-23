// Simple script to register an organizer account
import axios from 'axios';

// API endpoint
const API_URL = 'http://localhost:5000';

// User data
const userData = {
  name: 'XXXX',
  phno: '1234567890',
  password: '1234567890'
};

// Register the user
async function registerOrganizer() {
  try {
    console.log('Attempting to register organizer account...');
    const response = await axios.post(`${API_URL}/api/user/register`, userData);
    console.log('Registration successful:', response.data);
    console.log('\nYou can now log in with:');
    console.log('Phone: 1234567890');
    console.log('Password: 1234567890');
  } catch (error) {
    if (error.response && error.response.data) {
      console.log('Registration error:', error.response.data);
      
      // If user already exists, try logging in
      if (error.response.data.error === 'Phone number already registered') {
        console.log('\nUser already exists. Attempting to log in...');
        loginOrganizer();
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Login with the user credentials
async function loginOrganizer() {
  try {
    const response = await axios.post(`${API_URL}/api/user/login`, {
      phno: userData.phno,
      password: userData.password
    });
    console.log('Login successful:', response.data);
    console.log('\nYou can use these credentials to log in:');
    console.log('Phone: 1234567890');
    console.log('Password: 1234567890');
  } catch (error) {
    if (error.response && error.response.data) {
      console.log('Login error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Start the process
registerOrganizer();
