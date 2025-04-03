const mongoose = require('mongoose');
const Attraction = require('./models/attraction');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function cleanAndSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // ล้างข้อมูลทั้งหมดยกเว้น User
    await Attraction.deleteMany({});
    console.log('Cleared attractions data');
    
    // สร้างผู้ใช้หากยังไม่มี
    const userCount = await User.countDocuments();
    let admin = null;
    
    if (userCount === 0) {
      console.log('Creating default users...');
      
      // เข้ารหัสพาสเวิร์ด
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        is_admin: true
      });
      
      const normalUser = new User({
        username: 'user',
        email: 'user@example.com',
        password: hashedPassword
      });
      
      admin = await adminUser.save();
      await normalUser.save();
      console.log('Default users created');
    } else {
      // หากมีผู้ใช้แล้ว ให้ใช้ admin ที่มีอยู่
      admin = await User.findOne({ is_admin: true });
    }
    
    // เพิ่มข้อมูลตัวอย่าง
    const sampleData = [
      {
        "name": "เกาะยาคุชิมะ (Yakushima Island)",
        "location": "จังหวัดคาโกชิมะ (Kagoshima Prefecture)",
        "prefecture": "คาโกชิมะ",
        "description": "เกาะที่เต็มไปด้วยป่าสนซีดาร์โบราณอายุนับพันปี ได้รับการขึ้นทะเบียนเป็นมรดกโลกทางธรรมชาติ มีเส้นทางเดินป่าที่สวยงามและบรรยากาศลึกลับ",
        "type": "ธรรมชาติ, เกาะ, เดินป่า",
        "season": "all-year",
        "image_url": "https://placehold.co/600x400/a2d2ff/ffffff?text=เกาะยาคุชิมะ",
        "admission_fee": "ประมาณ 1,000 เยน",
        "opening_hours": "ตลอดเวลา (เส้นทางเดินป่าแนะนำในช่วงกลางวัน)",
        "website": "https://www.yakushima-info.com/",
        "coordinates": {
          "lat": 30.3587,
          "lng": 130.5221
        },
        "created_by": admin ? admin._id : null
      },
      {
        "name": "เนินทรายทตโตริ (Tottori Sand Dunes)",
        "location": "จังหวัดทตโตริ (Tottori Prefecture)",
        "prefecture": "ทตโตริ",
        "description": "เนินทรายขนาดใหญ่ริมทะเลญี่ปุ่น ให้ความรู้สึกเหมือนอยู่ในทะเลทราย สามารถขี่อูฐหรือเล่นแซนด์บอร์ดได้ เป็นทิวทัศน์ที่ไม่ค่อยพบเห็นในญี่ปุ่น",
        "type": "ธรรมชาติ, ทิวทัศน์",
        "season": "all-year",
        "image_url": "https://placehold.co/600x400/fbc4ab/ffffff?text=เนินทรายทตโตริ",
        "admission_fee": "ฟรี (กิจกรรมเสริมมีค่าใช้จ่ายเพิ่มเติม)",
        "opening_hours": "ตลอดเวลา",
        "website": "https://www.tottori-tour.jp/en/",
        "coordinates": {
          "lat": 35.5404,
          "lng": 134.2096
        },
        "created_by": admin ? admin._id : null
      },
      {
        "name": "โคยะซัง (Koyasan / Mount Koya)",
        "location": "จังหวัดวาคายามะ (Wakayama Prefecture)",
        "prefecture": "วาคายามะ",
        "description": "ศูนย์กลางของศาสนาพุทธนิกายชินงอน ที่นี่มีวัดวาอารามมากมายและสุสานโอคุโนะอิน (Okunoin) อันเงียบสงบและขลัง นักท่องเที่ยวสามารถพักค้างคืนในวัด (ชุคุโบ) ได้",
        "type": "ศาสนา, วัฒนธรรม, ประวัติศาสตร์",
        "season": "all-year",
        "image_url": "https://placehold.co/600x400/c1d5a4/ffffff?text=โคยะซัง",
        "admission_fee": "ประมาณ 500 เยน (ขึ้นอยู่กับวัด)",
        "opening_hours": "8:30-17:00 น. (ส่วนใหญ่)",
        "website": "https://www.japan-guide.com/e/e4900.html",
        "coordinates": {
          "lat": 34.2130,
          "lng": 135.5838
        },
        "created_by": admin ? admin._id : null
      },
      {
        "name": "เกาะนาโอชิมะ (Naoshima Island)",
        "location": "ทะเลเซโตะใน (Seto Inland Sea), จังหวัดคางาวะ (Kagawa Prefecture)",
        "prefecture": "คางาวะ",
        "description": "เกาะแห่งศิลปะร่วมสมัย มีพิพิธภัณฑ์ สถาปัตยกรรม และงานศิลปะกลางแจ้งกระจายอยู่ทั่วเกาะ รวมถึงฟักทองลายจุดอันโด่งดังของยาโยอิ คุซามะ",
        "type": "ศิลปะ, วัฒนธรรม, เกาะ",
        "season": "all-year",
        "image_url": "https://placehold.co/600x400/ffc8dd/ffffff?text=เกาะนาโอชิมะ",
        "admission_fee": "แตกต่างกันไปตามพิพิธภัณฑ์ (ประมาณ 1,000-2,000 เยน)",
        "opening_hours": "10:00-17:00 น. (หยุดวันจันทร์)",
        "website": "http://benesse-artsite.jp/en/",
        "coordinates": {
          "lat": 34.4629,
          "lng": 133.9959
        },
        "created_by": admin ? admin._id : null
      },
      {
        "name": "ช่องเขาโออิราเสะ (Oirase Gorge)",
        "location": "จังหวัดอาโอโมริ (Aomori Prefecture)",
        "prefecture": "อาโอโมริ",
        "description": "ลำธารที่ไหลผ่านหุบเขา มีน้ำตกน้อยใหญ่และพืชพรรณเขียวชอุ่มตลอดเส้นทางเดินเลียบธารน้ำ เหมาะแก่การเดินป่าชมธรรมชาติ โดยเฉพาะช่วงใบไม้เปลี่ยนสี",
        "type": "ธรรมชาติ, เดินป่า, ทิวทัศน์",
        "season": "autumn",
        "image_url": "https://placehold.co/600x400/bde0fe/ffffff?text=ช่องเขาโออิราเสะ",
        "admission_fee": "ฟรี",
        "opening_hours": "ตลอดเวลา (เส้นทางปิดในช่วงหิมะตก)",
        "website": "https://www.en-aomori.com/sightseeing/23066",
        "coordinates": {
          "lat": 40.5783,
          "lng": 140.9786
        },
        "created_by": admin ? admin._id : null
      },
      {
        "name": "หมู่บ้านประวัติศาสตร์โกคายามะ (Historic Village of Gokayama)",
        "location": "จังหวัดโทยามะ (Toyama Prefecture)",
        "prefecture": "โทยามะ",
        "description": "หมู่บ้านมรดกโลกสไตล์กัชโชสึคุริ (บ้านหลังคาทรงพนมมือ) ที่มีความเงียบสงบและนักท่องเที่ยวน้อยกว่าชิราคาวาโกะ สัมผัสวิถีชีวิตชนบทแบบดั้งเดิม",
        "type": "วัฒนธรรม, ประวัติศาสตร์, หมู่บ้าน",
        "season": "all-year",
        "image_url": "https://placehold.co/600x400/cdb4db/ffffff?text=หมู่บ้านโกคายามะ",
        "admission_fee": "ฟรี (บางบ้านเปิดให้เข้าชมมีค่าเข้าชม)",
        "opening_hours": "9:00-17:00 น.",
        "website": "https://www.gokayama-info.jp/en/",
        "coordinates": {
          "lat": 36.4047,
          "lng": 136.8878
        },
        "created_by": admin ? admin._id : null
      }
    ];
    
    await Attraction.insertMany(sampleData);
    console.log(`Added ${sampleData.length} attractions`);
    
    console.log('Data seeding complete');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

cleanAndSeed();