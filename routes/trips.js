const express = require('express');
const router = express.Router();
const Trip = require('../models/trip');
const Attraction = require('../models/attraction');
const { requireAuth } = require('./auth');

// แสดงรายการทริปทั้งหมดของผู้ใช้
router.get('/', requireAuth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.session.userId })
      .sort({ created_at: -1 })
      .populate('user', 'username profile_image');
    
    res.render('trips/index', {
      title: 'ทริปของฉัน',
      trips
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลทริป',
      error: err
    });
  }
});

// แสดงทริปที่เผยแพร่สู่สาธารณะ
router.get('/public', async (req, res) => {
  try {
    const trips = await Trip.find({ is_public: true })
      .sort({ created_at: -1 })
      .populate('user', 'username profile_image');
    
    res.render('trips/public', {
      title: 'ทริปที่แนะนำ',
      trips
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลทริป',
      error: err
    });
  }
});

// แสดงฟอร์มสร้างทริปใหม่
router.get('/new', requireAuth, async (req, res) => {
  try {
    const attractions = await Attraction.find().sort({ name: 1 });
    
    res.render('trips/new', {
      title: 'สร้างทริปใหม่',
      attractions,
      trip: new Trip()
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการเตรียมข้อมูล',
      error: err
    });
  }
});

// บันทึกทริปใหม่
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      total_budget,
      is_public,
      cover_image,
      attractions
    } = req.body;
    
    // แปลงข้อมูลสถานที่ท่องเที่ยว
    let attractionsData = [];
    if (attractions) {
      // ถ้ามีหลายสถานที่จะเป็น array
      if (Array.isArray(attractions.attraction)) {
        for (let i = 0; i < attractions.attraction.length; i++) {
          attractionsData.push({
            attraction: attractions.attraction[i],
            day: attractions.day[i],
            order: attractions.order[i],
            notes: attractions.notes[i]
          });
        }
      } else {
        // ถ้ามีสถานที่เดียวจะเป็น string
        attractionsData.push({
          attraction: attractions.attraction,
          day: attractions.day,
          order: attractions.order,
          notes: attractions.notes
        });
      }
    }
    
    const trip = new Trip({
      title,
      description,
      user: req.session.userId,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      total_budget: total_budget || undefined,
      is_public: is_public === 'on',
      cover_image: cover_image || undefined,
      attractions: attractionsData
    });
    
    await trip.save();
    res.redirect('/trips');
  } catch (err) {
    console.error(err);
    
    // กรณีเกิดข้อผิดพลาด ให้ดึงข้อมูลสถานที่ท่องเที่ยวมาแสดงในฟอร์มอีกครั้ง
    const attractions = await Attraction.find().sort({ name: 1 });
    
    res.render('trips/new', {
      title: 'สร้างทริปใหม่',
      attractions,
      trip: req.body,
      error: err.message
    });
  }
});

// แสดงรายละเอียดทริป
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'username profile_image')
      .populate('attractions.attraction');
    
    if (!trip) {
      return res.status(404).render('error', {
        message: 'ไม่พบทริปที่ต้องการ',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    const isOwner = req.session.userId && trip.user._id.toString() === req.session.userId;
    if (!trip.is_public && !isOwner) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์เข้าถึงทริปนี้',
        error: { status: 403 }
      });
    }
    
    res.render('trips/show', {
      title: trip.title,
      trip,
      isOwner
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลทริป',
      error: err
    });
  }
});

// แสดงฟอร์มแก้ไขทริป
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('attractions.attraction');
    
    if (!trip) {
      return res.status(404).render('error', {
        message: 'ไม่พบทริปที่ต้องการแก้ไข',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบเจ้าของทริป
    if (trip.user.toString() !== req.session.userId) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์แก้ไขทริปนี้',
        error: { status: 403 }
      });
    }
    
    const attractions = await Attraction.find().sort({ name: 1 });
    
    res.render('trips/edit', {
      title: `แก้ไข ${trip.title}`,
      trip,
      attractions
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลทริป',
      error: err
    });
  }
});

// อัพเดททริป
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).render('error', {
        message: 'ไม่พบทริปที่ต้องการแก้ไข',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบเจ้าของทริป
    if (trip.user.toString() !== req.session.userId) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์แก้ไขทริปนี้',
        error: { status: 403 }
      });
    }
    
    const {
      title,
      description,
      start_date,
      end_date,
      total_budget,
      is_public,
      cover_image,
      status,
      attractions
    } = req.body;
    
    // แปลงข้อมูลสถานที่ท่องเที่ยว
    let attractionsData = [];
    if (attractions) {
      // ถ้ามีหลายสถานที่จะเป็น array
      if (Array.isArray(attractions.attraction)) {
        for (let i = 0; i < attractions.attraction.length; i++) {
          attractionsData.push({
            attraction: attractions.attraction[i],
            day: attractions.day[i],
            order: attractions.order[i],
            notes: attractions.notes[i]
          });
        }
      } else {
        // ถ้ามีสถานที่เดียวจะเป็น string
        attractionsData.push({
          attraction: attractions.attraction,
          day: attractions.day,
          order: attractions.order,
          notes: attractions.notes
        });
      }
    }
    
    trip.title = title;
    trip.description = description;
    trip.start_date = start_date || undefined;
    trip.end_date = end_date || undefined;
    trip.total_budget = total_budget || undefined;
    trip.is_public = is_public === 'on';
    trip.cover_image = cover_image || trip.cover_image;
    trip.status = status;
    trip.attractions = attractionsData;
    
    await trip.save();
    res.redirect(`/trips/${trip._id}`);
  } catch (err) {
    console.error(err);
    
    // กรณีเกิดข้อผิดพลาด ให้ดึงข้อมูลสถานที่ท่องเที่ยวมาแสดงในฟอร์มอีกครั้ง
    const attractions = await Attraction.find().sort({ name: 1 });
    
    res.render('trips/edit', {
      title: `แก้ไขทริป`,
      trip: { ...req.body, _id: req.params.id },
      attractions,
      error: err.message
    });
  }
});

// ลบทริป
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).render('error', {
        message: 'ไม่พบทริปที่ต้องการลบ',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบเจ้าของทริป
    if (trip.user.toString() !== req.session.userId) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์ลบทริปนี้',
        error: { status: 403 }
      });
    }
    
    await Trip.findByIdAndDelete(req.params.id);
    res.redirect('/trips');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการลบทริป',
      error: err
    });
  }
});

module.exports = router;
