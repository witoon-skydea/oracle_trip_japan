const express = require('express');
const router = express.Router();

// หน้าหลัก
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Oracle Trip - แหล่งท่องเที่ยวในญี่ปุ่น',
    description: 'แอพพลิเคชั่นสำหรับจัดการข้อมูลแหล่งท่องเที่ยวในญี่ปุ่น'
  });
});

module.exports = router;