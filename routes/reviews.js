const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Attraction = require('../models/attraction');
const { requireAuth } = require('./auth');

// เพิ่มรีวิวใหม่
router.post('/attractions/:id/reviews', requireAuth, async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) {
      return res.status(404).render('error', {
        message: 'ไม่พบแหล่งท่องเที่ยวที่ต้องการรีวิว',
        error: { status: 404 }
      });
    }
    
    const { rating, title, comment, visit_date } = req.body;
    
    // สร้างรีวิวใหม่
    const review = new Review({
      attraction: attraction._id,
      user: req.session.userId,
      rating: parseInt(rating),
      title,
      comment,
      visit_date: visit_date || undefined
    });
    
    await review.save();
    
    // อัพเดทคะแนนเฉลี่ยและจำนวนรีวิวของแหล่งท่องเที่ยว
    const allReviews = await Review.find({ attraction: attraction._id });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    attraction.average_rating = averageRating;
    attraction.review_count = allReviews.length;
    await attraction.save();
    
    res.redirect(`/attractions/${attraction._id}#reviews`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว',
      error: err
    });
  }
});

// แสดงรายละเอียดรีวิว
router.get('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('attraction')
      .populate('user', 'username profile_image');
    
    if (!review) {
      return res.status(404).render('error', {
        message: 'ไม่พบรีวิวที่ต้องการ',
        error: { status: 404 }
      });
    }
    
    res.render('reviews/show', {
      title: review.title,
      review,
      isOwner: req.session.userId && review.user._id.toString() === req.session.userId
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว',
      error: err
    });
  }
});

// แสดงฟอร์มแก้ไขรีวิว
router.get('/reviews/:id/edit', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('attraction');
    
    if (!review) {
      return res.status(404).render('error', {
        message: 'ไม่พบรีวิวที่ต้องการแก้ไข',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบเจ้าของรีวิว
    if (review.user.toString() !== req.session.userId) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์แก้ไขรีวิวนี้',
        error: { status: 403 }
      });
    }
    
    res.render('reviews/edit', {
      title: `แก้ไขรีวิว ${review.title}`,
      review
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว',
      error: err
    });
  }
});

// อัพเดทรีวิว
router.put('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).render('error', {
        message: 'ไม่พบรีวิวที่ต้องการแก้ไข',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบเจ้าของรีวิว
    if (review.user.toString() !== req.session.userId) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์แก้ไขรีวิวนี้',
        error: { status: 403 }
      });
    }
    
    const { rating, title, comment, visit_date } = req.body;
    
    review.rating = parseInt(rating);
    review.title = title;
    review.comment = comment;
    review.visit_date = visit_date || undefined;
    
    await review.save();
    
    // อัพเดทคะแนนเฉลี่ยของแหล่งท่องเที่ยว
    const attraction = await Attraction.findById(review.attraction);
    const allReviews = await Review.find({ attraction: review.attraction });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    attraction.average_rating = averageRating;
    await attraction.save();
    
    res.redirect(`/attractions/${review.attraction}#reviews`);
  } catch (err) {
    console.error(err);
    res.render('reviews/edit', {
      title: 'แก้ไขรีวิว',
      review: { ...req.body, _id: req.params.id },
      error: err.message
    });
  }
});

// ลบรีวิว
router.delete('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).render('error', {
        message: 'ไม่พบรีวิวที่ต้องการลบ',
        error: { status: 404 }
      });
    }
    
    // ตรวจสอบเจ้าของรีวิวหรือแอดมิน
    if (review.user.toString() !== req.session.userId && !req.session.isAdmin) {
      return res.status(403).render('error', {
        message: 'คุณไม่มีสิทธิ์ลบรีวิวนี้',
        error: { status: 403 }
      });
    }
    
    const attractionId = review.attraction;
    
    await Review.findByIdAndDelete(req.params.id);
    
    // อัพเดทคะแนนเฉลี่ยและจำนวนรีวิวของแหล่งท่องเที่ยว
    const attraction = await Attraction.findById(attractionId);
    const allReviews = await Review.find({ attraction: attractionId });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      attraction.average_rating = averageRating;
    } else {
      attraction.average_rating = 0;
    }
    
    attraction.review_count = allReviews.length;
    await attraction.save();
    
    res.redirect(`/attractions/${attractionId}#reviews`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'เกิดข้อผิดพลาดในการลบรีวิว',
      error: err
    });
  }
});

module.exports = router;
