const mongoose = require('mongoose');
const Attraction = require('./models/attraction');
require('dotenv').config();

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // ดึงข้อมูลทั้งหมด
    const attractions = await Attraction.find();
    console.log(`Found ${attractions.length} attractions`);
    
    // แก้ไขชื่อแต่ละรายการ
    const updates = [
      { id: '67ef1d91d9c01d4e3badb7ef', action: 'delete' }, // ลบรายการ Fuji Mountain
      { 
        namePattern: 'เกาะยาคุช', 
        newName: 'เกาะยาคุชิมะ (Yakushima Island)',
        newImageUrl: 'https://placehold.co/600x400/a2d2ff/ffffff?text=เกาะยาคุชิมะ' 
      },
      { 
        namePattern: 'เนินทราย', 
        newName: 'เนินทรายทตโตริ (Tottori Sand Dunes)',
        newImageUrl: 'https://placehold.co/600x400/fbc4ab/ffffff?text=เนินทรายทตโตริ' 
      },
      { 
        namePattern: 'โคยะซ', 
        newName: 'โคยะซัง (Koyasan / Mount Koya)',
        newImageUrl: 'https://placehold.co/600x400/c1d5a4/ffffff?text=โคยะซัง' 
      },
      { 
        namePattern: 'เกาะนาโอช', 
        newName: 'เกาะนาโอชิมะ (Naoshima Island)',
        newImageUrl: 'https://placehold.co/600x400/ffc8dd/ffffff?text=เกาะนาโอชิมะ' 
      },
      { 
        namePattern: 'ช่องเขาโออ', 
        newName: 'ช่องเขาโออิราเสะ (Oirase Gorge)',
        newImageUrl: 'https://placehold.co/600x400/bde0fe/ffffff?text=ช่องเขาโออิราเสะ' 
      },
      { 
        namePattern: 'หมู่บ้าน', 
        newName: 'หมู่บ้านประวัติศาสตร์โกคายามะ (Historic Village of Gokayama)',
        newImageUrl: 'https://placehold.co/600x400/cdb4db/ffffff?text=หมู่บ้านโกคายามะ' 
      }
    ];
    
    // ดำเนินการแก้ไข
    for (const update of updates) {
      if (update.action === 'delete') {
        const result = await Attraction.findByIdAndDelete(update.id);
        if (result) {
          console.log(`Deleted attraction with ID: ${update.id}`);
        } else {
          console.log(`Attraction with ID: ${update.id} not found`);
        }
      } else {
        const result = await Attraction.updateMany(
          { name: { $regex: update.namePattern, $options: 'i' } },
          { 
            $set: { 
              name: update.newName,
              image_url: update.newImageUrl
            } 
          }
        );
        
        console.log(`Updated ${result.modifiedCount} attraction(s) matching "${update.namePattern}" to "${update.newName}"`);
      }
    }

    console.log('Data fix complete');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

fixData();