const mongoose = require('mongoose');
const Attraction = require('./models/attraction');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // ดึงข้อมูลสถานที่ท่องเที่ยวทั้งหมด
    const attractions = await Attraction.find();
    console.log(`Found ${attractions.length} attractions:`);
    attractions.forEach(attraction => {
      console.log(`- ${attraction.name} (${attraction._id})`);
      console.log(`  Image URL: ${attraction.image_url}`);
    });

    // ปิดการเชื่อมต่อ
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkData();

