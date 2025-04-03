const express = require('express');
const router = express.Router();
const Attraction = require('../models/attraction');

// แสดงรายการแหล่งท่องเที่ยวทั้งหมด
router.get('/', async (req, res) => {
  try {
    const attractions = await Attraction.find().sort({ created_at: -1 });
    res.render('attractions/index', { 
      title: 'รายการแหล่งท่องเที่ยวทั้งหมด',
      attractions 
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: err 
    });
  }
});

// แสดงฟอร์มสำหรับเพิ่มแหล่งท่องเที่ยวใหม่
router.get('/new', (req, res) => {
  res.render('attractions/new', { 
    title: 'เพิ่มแหล่งท่องเที่ยวใหม่',
    attraction: new Attraction() 
  });
});

// บันทึกข้อมูลแหล่งท่องเที่ยวใหม่
router.post('/', async (req, res) => {
  const attraction = new Attraction({
    name: req.body.name,
    location: req.body.location,
    prefecture: req.body.prefecture,
    description: req.body.description,
    type: req.body.type,
    season: req.body.season || 'all-year',
    image_url: req.body.image_url || undefined
  });

  try {
    await attraction.save();
    res.redirect('/attractions');
  } catch (err) {
    console.error(err);
    res.render('attractions/new', {
      title: 'เพิ่มแหล่งท่องเที่ยวใหม่',
      attraction: attraction,
      error: err.message
    });
  }
});

// แสดงข้อมูลแหล่งท่องเที่ยวเฉพาะ
router.get('/:id', async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (attraction == null) {
      return res.status(404).render('error', { 
        message: 'ไม่พบข้อมูลแหล่งท่องเที่ยวที่ต้องการ',
        error: { status: 404 } 
      });
    }
    res.render('attractions/show', { 
      title: attraction.name,
      attraction: attraction 
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: err 
    });
  }
});

// แสดงฟอร์มสำหรับแก้ไขข้อมูล
router.get('/:id/edit', async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (attraction == null) {
      return res.status(404).render('error', { 
        message: 'ไม่พบข้อมูลแหล่งท่องเที่ยวที่ต้องการแก้ไข',
        error: { status: 404 } 
      });
    }
    res.render('attractions/edit', { 
      title: `แก้ไข ${attraction.name}`,
      attraction: attraction 
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: err 
    });
  }
});

// อัพเดทข้อมูลแหล่งท่องเที่ยว
router.put('/:id', async (req, res) => {
  let attraction;
  try {
    attraction = await Attraction.findById(req.params.id);
    if (attraction == null) {
      return res.status(404).render('error', { 
        message: 'ไม่พบข้อมูลแหล่งท่องเที่ยวที่ต้องการแก้ไข',
        error: { status: 404 } 
      });
    }
    
    attraction.name = req.body.name;
    attraction.location = req.body.location;
    attraction.prefecture = req.body.prefecture;
    attraction.description = req.body.description;
    attraction.type = req.body.type;
    attraction.season = req.body.season || 'all-year';
    attraction.image_url = req.body.image_url;
    
    await attraction.save();
    res.redirect(`/attractions/${attraction.id}`);
  } catch (err) {
    if (attraction == null) {
      return res.status(404).render('error', { 
        message: 'ไม่พบข้อมูลแหล่งท่องเที่ยว',
        error: { status: 404 } 
      });
    }
    console.error(err);
    res.render('attractions/edit', {
      title: `แก้ไข ${attraction.name}`,
      attraction: attraction,
      error: err.message
    });
  }
});

// ลบข้อมูลแหล่งท่องเที่ยว
router.delete('/:id', async (req, res) => {
  try {
    await Attraction.findByIdAndDelete(req.params.id);
    res.redirect('/attractions');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
      error: err 
    });
  }
});

module.exports = router;