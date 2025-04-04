const mongoose = require('mongoose');
const Attraction = require('./models/attraction');
require('dotenv').config();

async function fixNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // ข้อมูลแก้ไข
    const updates = [
      {
        id: '67ef1ff3b0b56133cfaee70e',
        newName: 'เกาะยาคุชิมะ (Yakushima Island)',
        newImage: 'https://placehold.co/600x400/a2d2ff/ffffff?text=เกาะยาคุชิมะ'
      },
      {
        id: '67ef1ff3b0b56133cfaee70f',
        newName: 'เนินทรายทตโตริ (Tottori Sand Dunes)',
        newImage: 'https://placehold.co/600x400/fbc4ab/ffffff?text=เนินทรายทตโตริ'
      },
      {
        id: '67ef1ff3b0b56133cfaee710',
        newName: 'โคยะซัง (Koyasan / Mount Koya)',
        newImage: 'https://placehold.co/600x400/c1d5a4/ffffff?text=โคยะซัง'
      },
      {
        id: '67ef1ff3b0b56133cfaee711',
        newName: 'เกาะนาโอชิมะ (Naoshima Island)',
        newImage: 'https://placehold.co/600x400/ffc8dd/ffffff?text=เกาะนาโอชิมะ'
      },
      {
        id: '67ef1ff3b0b56133cfaee712',
        newName: 'ช่องเขาโออิราเสะ (Oirase Gorge)',
        newImage: 'https://placehold.co/600x400/bde0fe/ffffff?text=ช่องเขาโออิราเสะ'
      },
      {
        id: '67ef1ff3b0b56133cfaee713',
        newName: 'หมู่บ้านประวัติศาสตร์โกคายามะ (Historic Village of Gokayama)',
        newImage: 'https://placehold.co/600x400/cdb4db/ffffff?text=หมู่บ้านโกคายามะ'
      }
    ];
    
    // แก้ไขทีละรายการ
    for (const update of updates) {
      console.log(`Fixing: ${update.id}`);
      
      const result = await Attraction.findByIdAndUpdate(
        update.id,
        { 
          $set: { 
            name: update.newName,
            image_url: update.newImage
          } 
        },
        { new: true }
      );
      
      if (result) {
        console.log(`Updated: ${result.name}`);
      } else {
        console.log(`Not found: ${update.id}`);
      }
    }
    
    console.log('Fix completed');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

fixNames();