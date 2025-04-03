const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
require('dotenv').config();

// ตัวแปรสำหรับ Express App
const app = express();

// เชื่อมต่อกับ MongoDB
connectDB();

// ตั้งค่า Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'oracle-trip-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60 * 24 // 1 วัน
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 วัน
  }
}));

// ส่งข้อมูลเซสชันไปยัง views
app.use((req, res, next) => {
  res.locals.user = {
    isAuthenticated: !!req.session.userId,
    id: req.session.userId,
    username: req.session.username,
    isAdmin: req.session.isAdmin
  };
  next();
});

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
app.use('/auth', require('./routes/auth').router);
app.use('/trips', require('./routes/trips'));
app.use('/', require('./routes/reviews'));
app.use('/profile', require('./routes/profile'));

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
const PORT = process.env.PORT || 3456;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// สำหรับการ Seed ข้อมูลเริ่มต้น
const seedData = async () => {
  const Attraction = require('./models/attraction');
  const User = require('./models/user');
  const bcrypt = require('bcryptjs');
  
  // ตรวจสอบว่ามีข้อมูลผู้ใช้ในฐานข้อมูลหรือไม่
  const userCount = await User.countDocuments();
  
  // หากไม่มีข้อมูลผู้ใช้ ให้สร้างผู้ใช้เริ่มต้น
  if (userCount === 0) {
    console.log('ไม่พบข้อมูลผู้ใช้ กำลังสร้างผู้ใช้เริ่มต้น...');
    
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
    
    try {
      await adminUser.save();
      await normalUser.save();
      console.log('สร้างผู้ใช้เริ่มต้นเรียบร้อยแล้ว');
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้เริ่มต้น:', err);
    }
  }
  
  // ตรวจสอบว่ามีข้อมูลในฐานข้อมูลหรือไม่
  const count = await Attraction.countDocuments();
  
  // หากไม่มีข้อมูล ให้ใส่ข้อมูลตัวอย่าง
  if (count === 0) {
    console.log('ไม่พบข้อมูลแหล่งท่องเที่ยว กำลังเพิ่มข้อมูลตัวอย่าง...');
    
    // ค้นหาผู้ใช้แอดมิน
    const admin = await User.findOne({ username: 'admin' });
    
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