import axios from 'axios';

// API endpoint
const API_URL = 'http://localhost:5000';

// User credentials
const credentials = {
  phno: '1234567890',
  password: '1234567890'
};

// Function to login and get token
async function loginAndUpdateToOrganizer() {
  try {
    console.log('Logging in to get authentication token...');
    const loginResponse = await axios.post(`${API_URL}/api/user/login`, credentials);
    const token = loginResponse.data.token;
    
    console.log('Login successful, got token');
    
    // Now we'll create a direct route to update the user to organizer
    // This is a custom route we're adding just for this purpose
    try {
      const updateResponse = await axios.post(
        `${API_URL}/api/user/make-organizer`,
        { phno: credentials.phno },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Update response:', updateResponse.data);
      console.log('\nUser has been updated to organizer role!');
      console.log('You can now log in with:');
      console.log('Phone: 1234567890');
      console.log('Password: 1234567890');
    } catch (updateError) {
      if (updateError.response) {
        console.log('Update error:', updateError.response.data);
        console.log('\nManual update required. Please add the make-organizer route to your API or update directly in the database.');
      } else {
        console.log('Update error:', updateError.message);
      }
    }
  } catch (loginError) {
    if (loginError.response) {
      console.log('Login error:', loginError.response.data);
    } else {
      console.log('Error:', loginError.message);
    }
  }
}

// Start the process
loginAndUpdateToOrganizer();
