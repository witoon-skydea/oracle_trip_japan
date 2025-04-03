const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อสถานที่ท่องเที่ยว'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'กรุณาระบุตำแหน่งที่ตั้ง'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'กรุณาระบุรายละเอียด'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'กรุณาระบุประเภทแหล่งท่องเที่ยว'],
    trim: true
  },
  image_url: {
    type: String,
    default: 'https://placehold.co/600x400/cccccc/ffffff?text=รูปภาพ'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// อัพเดท updated_at เมื่อมีการแก้ไขข้อมูล
attractionSchema.pre('findOneAndUpdate', function() {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('Attraction', attractionSchema);