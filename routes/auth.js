const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.is_admin) {
      return res.status(403).render('error', {
        message: 'ไม่มีสิทธิ์เข้าถึงหน้านี้',
        error: { status: 403 }
      });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
      error: err
    });
  }
};

// หน้าลงทะเบียน
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'ลงทะเบียนผู้ใช้ใหม่'
  });
});

// ดำเนินการลงทะเบียน
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  // ตรวจสอบรหัสผ่านตรงกัน
  if (password !== confirmPassword) {
    return res.render('auth/register', {
      title: 'ลงทะเบียนผู้ใช้ใหม่',
      error: 'รหัสผ่านไม่ตรงกัน',
      username,
      email
    });
  }
  
  try {
    // ตรวจสอบว่ามีผู้ใช้นี้ในระบบแล้วหรือไม่
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.render('auth/register', {
        title: 'ลงทะเบียนผู้ใช้ใหม่',
        error: 'อีเมลหรือชื่อผู้ใช้นี้มีในระบบแล้ว',
        username,
        email
      });
    }
    
    // เข้ารหัสพาสเวิร์ด
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // สร้างผู้ใช้ใหม่
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // เก็บข้อมูลผู้ใช้ในเซสชัน
    req.session.userId = user._id;
    req.session.username = user.username;
    
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.render('auth/register', {
      title: 'ลงทะเบียนผู้ใช้ใหม่',
      error: err.message,
      username,
      email
    });
  }
});

// หน้าเข้าสู่ระบบ
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'เข้าสู่ระบบ'
  });
});

// ดำเนินการเข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // ค้นหาผู้ใช้จากอีเมล
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('auth/login', {
        title: 'เข้าสู่ระบบ',
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        email
      });
    }
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'เข้าสู่ระบบ',
        error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        email
      });
    }
    
    // เก็บข้อมูลผู้ใช้ในเซสชัน
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = user.is_admin;
    
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'เข้าสู่ระบบ',
      error: err.message,
      email
    });
  }
});

// ออกจากระบบ
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ส่งออก router และ middleware
module.exports = {
  router,
  requireAuth,
  requireAdmin
};
