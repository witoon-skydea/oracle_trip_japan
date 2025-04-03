const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// ตัวแปรสำหรับ Express App
const app = express();

// เชื่อมต่อกับ MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ตั้งค่า View Engine เป็น EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ตั้งค่า layout สำหรับ EJS
app.use((req, res, next) => {
  res.locals.body = '';
  next();
});

// เรียกใช้ middleware สำหรับ layout (ทางเลือกโดยไม่ต้องใช้ package เพิ่มเติม)
app.use((req, res, next) => {
  const render = res.render;
  res.render = function(view, options, callback) {
    options = options || {};
    
    if (view !== 'layout') {
      render.call(this, view, options, (err, html) => {
        if (err) return callback ? callback(err) : next(err);
        options.body = html;
        render.call(this, 'layout', options, callback);
      });
    } else {
      render.call(this, view, options, callback);
    }
  };
  next();
});

// เส้นทาง (Routes)
app.use('/', require('./routes/index'));
app.use('/attractions', require('./routes/attractions'));

// จัดการกับเส้นทางที่ไม่มีอยู่
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'ไม่พบหน้าที่คุณต้องการ',
    error: { status: 404 }
  });
});

// จัดการข้อผิดพลาดที่เกิดขึ้น
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ตั้งค่าพอร์ตสำหรับรันเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// สำหรับการ Seed ข้อมูลเริ่มต้น
const seedData = async () => {
  const Attraction = require('./models/attraction');
  
  // ตรวจสอบว่ามีข้อมูลในฐานข้อมูลหรือไม่
  const count = await Attraction.countDocuments();
  
  // หากไม่มีข้อมูล ให้ใส่ข้อมูลตัวอย่าง
  if (count === 0) {
    console.log('ไม่พบข้อมูลแหล่งท่องเที่ยว กำลังเพิ่มข้อมูลตัวอย่าง...');
    
    const sampleData = [
      {
        "name": "เกาะยาคุชิมะ (Yakushima Island)",
        "location": "จังหวัดคาโกชิมะ (Kagoshima Prefecture)",
        "description": "เกาะที่เต็มไปด้วยป่าสนซีดาร์โบราณอายุนับพันปี ได้รับการขึ้นทะเบียนเป็นมรดกโลกทางธรรมชาติ มีเส้นทางเดินป่าที่สวยงามและบรรยากาศลึกลับ",
        "type": "ธรรมชาติ, เกาะ, เดินป่า",
        "image_url": "https://placehold.co/600x400/a2d2ff/ffffff?text=เกาะยาคุชิมะ"
      },
      {
        "name": "เนินทรายทตโตริ (Tottori Sand Dunes)",
        "location": "จังหวัดทตโตริ (Tottori Prefecture)",
        "description": "เนินทรายขนาดใหญ่ริมทะเลญี่ปุ่น ให้ความรู้สึกเหมือนอยู่ในทะเลทราย สามารถขี่อูฐหรือเล่นแซนด์บอร์ดได้ เป็นทิวทัศน์ที่ไม่ค่อยพบเห็นในญี่ปุ่น",
        "type": "ธรรมชาติ, ทิวทัศน์ độc đáo",
        "image_url": "https://placehold.co/600x400/fbc4ab/ffffff?text=เนินทรายทตโตริ"
      },
      {
        "name": "โคยะซัง (Koyasan / Mount Koya)",
        "location": "จังหวัดวาคายามะ (Wakayama Prefecture)",
        "description": "ศูนย์กลางของศาสนาพุทธนิกายชินงอน ที่นี่มีวัดวาอารามมากมายและสุสานโอคุโนะอิน (Okunoin) อันเงียบสงบและขลัง นักท่องเที่ยวสามารถพักค้างคืนในวัด (ชุคุโบ) ได้",
        "type": "ศาสนา, วัฒนธรรม, ประวัติศาสตร์",
        "image_url": "https://placehold.co/600x400/c1d5a4/ffffff?text=โคยะซัง"
      },
      {
        "name": "เกาะนาโอชิมะ (Naoshima Island)",
        "location": "ทะเลเซโตะใน (Seto Inland Sea), จังหวัดคางาวะ (Kagawa Prefecture)",
        "description": "เกาะแห่งศิลปะร่วมสมัย มีพิพิธภัณฑ์ สถาปัตยกรรม และงานศิลปะกลางแจ้งกระจายอยู่ทั่วเกาะ รวมถึงฟักทองลายจุดอันโด่งดังของยาโยอิ คุซามะ",
        "type": "ศิลปะ, วัฒนธรรม, เกาะ",
        "image_url": "https://placehold.co/600x400/ffc8dd/ffffff?text=เกาะนาโอชิมะ"
      },
      {
        "name": "ช่องเขาโออิราเสะ (Oirase Gorge)",
        "location": "จังหวัดอาโอโมริ (Aomori Prefecture)",
        "description": "ลำธารที่ไหลผ่านหุบเขา มีน้ำตกน้อยใหญ่และพืชพรรณเขียวชอุ่มตลอดเส้นทางเดินเลียบธารน้ำ เหมาะแก่การเดินป่าชมธรรมชาติ โดยเฉพาะช่วงใบไม้เปลี่ยนสี",
        "type": "ธรรมชาติ, เดินป่า, ทิวทัศน์",
        "image_url": "https://placehold.co/600x400/bde0fe/ffffff?text=ช่องเขาโออิราเสะ"
      },
      {
        "name": "หมู่บ้านประวัติศาสตร์โกคายามะ (Historic Village of Gokayama)",
        "location": "จังหวัดโทยามะ (Toyama Prefecture)",
        "description": "หมู่บ้านมรดกโลกสไตล์กัชโชสึคุริ (บ้านหลังคาทรงพนมมือ) ที่มีความเงียบสงบและนักท่องเที่ยวน้อยกว่าชิราคาวาโกะ สัมผัสวิถีชีวิตชนบทแบบดั้งเดิม",
        "type": "วัฒนธรรม, ประวัติศาสตร์, หมู่บ้าน",
        "image_url": "https://placehold.co/600x400/cdb4db/ffffff?text=หมู่บ้านโกคายามะ"
      }
    ];
    
    try {
      await Attraction.insertMany(sampleData);
      console.log('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว');
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง:', err);
    }
  }
};

// รัน seed data หลังจากเชื่อมต่อ MongoDB
mongoose.connection.once('open', () => {
  seedData();
});