import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

console.log('Starting comprehensive account fix script...');

// MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Madhav:Datamadhav456@cluster0.6suce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
console.log('MongoDB URI:', MONGO_URI);

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // Get direct access to the database
    const db = mongoose.connection.db;
    
    // 1. First, check the users collection structure
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // 2. Check if users collection exists
    const usersCollection = db.collection('users');
    
    // 3. Check the schema by examining a sample document
    const sampleUser = await usersCollection.findOne({});
    console.log('Sample user document structure:', sampleUser ? Object.keys(sampleUser) : 'No users found');
    
    // 4. Determine if we have a phone/phno field mismatch
    const hasPhoneField = sampleUser && 'phone' in sampleUser;
    const hasPhnoField = sampleUser && 'phno' in sampleUser;
    
    console.log('Field detection:', { 
      hasPhoneField, 
      hasPhnoField,
      phoneValue: hasPhoneField ? sampleUser.phone : null,
      phnoValue: hasPhnoField ? sampleUser.phno : null
    });
    
    // 5. Create or update the organizer user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1234567890', salt);
    
    // Check if user with phone 1234567890 exists (using either field)
    let existingUser = null;
    if (hasPhnoField) {
      existingUser = await usersCollection.findOne({ phno: '1234567890' });
    }
    if (!existingUser && hasPhoneField) {
      existingUser = await usersCollection.findOne({ phone: '1234567890' });
    }
    
    if (existingUser) {
      console.log('Found existing user:', existingUser._id);
      
      // Update user with correct fields and make them an organizer
      const updateFields = {
        password: hashedPassword,
        organizer: true
      };
      
      // Ensure both phone and phno fields are set correctly
      if (hasPhoneField) updateFields.phone = '1234567890';
      if (hasPhnoField) updateFields.phno = '1234567890';
      
      await usersCollection.updateOne(
        { _id: existingUser._id },
        { $set: updateFields }
      );
      
      console.log('Updated existing user successfully');
    } else {
      console.log('User not found, creating new organizer user');
      
      // Create new user with all possible field variations to ensure compatibility
      const newUser = {
        name: 'XXXX',
        password: hashedPassword,
        organizer: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add both phone and phno fields to ensure compatibility
      newUser.phno = '1234567890';
      newUser.phone = '1234567890';
      
      await usersCollection.insertOne(newUser);
      console.log('Created new organizer user successfully');
    }
    
    // 6. Verify the user exists and has the correct fields
    let verifiedUser = null;
    if (hasPhnoField) {
      verifiedUser = await usersCollection.findOne({ phno: '1234567890' });
    }
    if (!verifiedUser && hasPhoneField) {
      verifiedUser = await usersCollection.findOne({ phone: '1234567890' });
    }
    
    if (verifiedUser) {
      console.log('User verification successful:');
      console.log('- ID:', verifiedUser._id);
      console.log('- Name:', verifiedUser.name);
      console.log('- Phone fields:', {
        phno: verifiedUser.phno,
        phone: verifiedUser.phone
      });
      console.log('- Has Password:', !!verifiedUser.password);
      console.log('- Is Organizer:', verifiedUser.organizer);
      
      // Test password matching
      const passwordMatches = await bcrypt.compare('1234567890', verifiedUser.password);
      console.log('- Password matches:', passwordMatches);
      
      console.log('\nYou can now log in with:');
      console.log('Phone: 1234567890');
      console.log('Password: 1234567890');
    } else {
      console.log('Failed to verify user after creation/update');
    }
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the function
fixDatabase();
