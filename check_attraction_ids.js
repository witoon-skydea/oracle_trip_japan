const mongoose = require('mongoose');
const Attraction = require('./models/attraction');
require('dotenv').config();

async function checkIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // ดึงข้อมูลทั้งหมด
    const attractions = await Attraction.find();
    console.log(`Found ${attractions.length} attractions`);
    
    attractions.forEach(attraction => {
      console.log(`- ID: ${attraction._id} | Name: ${attraction.name}`);
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkIds();