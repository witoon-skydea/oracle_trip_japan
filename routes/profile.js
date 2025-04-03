const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Trip = require('../models/trip');
const Review = require('../models/review');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('./auth');

// แสดงหน้าโปรไฟล์ผู้ใช้
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    // ดึงข้อมูลทริปล่าสุด
    const recentTrips = await Trip.find({ user: user._id })
      .sort({ created_at: -1 })
      .limit(3);
    
    // ดึงข้อมูลรีวิวล่าสุด
    const recentReviews = await Review.find({ user: user._id })
      .sort({ created_at: -1 })
      .limit(3)
      .populate('attraction');
    
    // ดึงข้อมูลสถานที่ที่บันทึกไว้
    const savedAttractions = await User.findById(user._id)
      .populate('saved_attractions')
      .then(user => user.saved_attractions);
    
    res.render('profile/index', {
      title: 'โปรไฟล์ของฉัน',
      user,
      recentTrips,
      recentReviews,
      savedAttractions
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์',
      error: err
    });
  }
});

// แสดงฟอร์มแก้ไขโปรไฟล์
router.get('/edit', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    res.render('profile/edit', {
      title: 'แก้ไขโปรไฟล์',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์',
      error: err
    });
  }
});

// อัพเดทโปรไฟล์
router.put('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }
    
    const { username, email, profile_image } = req.body;
    
    // ตรวจสอบว่ามีผู้ใช้อื่นใช้ username หรือ email นี้หรือไม่
    const existingUser = await User.findOne({
      $or: [
        { username, _id: { $ne: user._id } },
        { email, _id: { $ne: user._id } }
      ]
    });
    
    if (existingUser) {
      return res.render('profile/edit', {
        title: 'แก้ไขโปรไฟล์',
        user: { ...user.toObject(), ...req.body },
        error: 'ชื่อผู้ใช้หรืออีเมลนี้มีผู้ใช้อื่นใช้งานแล้ว'
      });
    }
    
    user.username = username;
    user.email = email;
    
    if (profile_image && profile_image.trim() !== '') {
      user.profile_image = profile_image;
    }
    
    await user.save();
    
    // อัพเดทชื่อผู้ใช้ในเซสชัน
    req.session.username = user.username;
    
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.render('profile/edit', {
      title: 'แก้ไขโปรไฟล์',
      user: { ...req.body, _id: req.session.userId },
      error: err.message
    });
  }
});

// แสดงฟอร์มเปลี่ยนรหัสผ่าน
router.get('/change-password', requireAuth, (req, res) => {
  res.render('profile/change-password', {
    title: 'เปลี่ยนรหัสผ่าน'
  });
});

// อัพเดทรหัสผ่าน
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    
    // ตรวจสอบว่ารหัสผ่านใหม่ตรงกัน
    if (new_password !== confirm_password) {
      return res.render('profile/change-password', {
        title: 'เปลี่ยนรหัสผ่าน',
        error: 'รหัสผ่านใหม่ไม่ตรงกัน'
      });
    }
    
    const user = await User.findById(req.session.userId);
    
    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isMatch = await bcrypt.compare(current_password, user.password);
    
    if (!isMatch) {
      return res.render('profile/change-password', {
        title: 'เปลี่ยนรหัสผ่าน',
        error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      });
    }
    
    // เข้ารหัสพาสเวิร์ดใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    
    // อัพเดทรหัสผ่าน
    user.password = hashedPassword;
    await user.save();
    
    res.redirect('/profile?success=password-changed');
  } catch (err) {
    console.error(err);
    res.render('profile/change-password', {
      title: 'เปลี่ยนรหัสผ่าน',
      error: err.message
    });
  }
});

// บันทึกแหล่งท่องเที่ยว
router.post('/save-attraction/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const attractionId = req.params.id;
    
    // ตรวจสอบว่าบันทึกแล้วหรือยัง
    if (!user.saved_attractions.includes(attractionId)) {
      user.saved_attractions.push(attractionId);
      await user.save();
    }
    
    res.redirect(`/attractions/${attractionId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการบันทึกแหล่งท่องเที่ยว',
      error: err
    });
  }
});

// ยกเลิกการบันทึกแหล่งท่องเที่ยว
router.delete('/unsave-attraction/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const attractionId = req.params.id;
    
    // ลบออกจากรายการที่บันทึก
    user.saved_attractions = user.saved_attractions.filter(
      id => id.toString() !== attractionId
    );
    
    await user.save();
    
    // ส่งกลับไปที่หน้าเดิม หรือหน้าโปรไฟล์
    if (req.query.redirect) {
      res.redirect(req.query.redirect);
    } else {
      res.redirect('/profile');
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการยกเลิกการบันทึกแหล่งท่องเที่ยว',
      error: err
    });
  }
});

module.exports = router;
