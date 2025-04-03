const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attractionSchema = new Schema({
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
  prefecture: {
    type: String,
    required: [true, 'กรุณาระบุจังหวัด'],
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
  season: {
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'all-year'],
    default: 'all-year'
  },
  image_url: {
    type: String,
    default: 'https://placehold.co/600x400/cccccc/ffffff?text=รูปภาพ'
  },
  gallery: [{
    type: String
  }],
  admission_fee: {
    type: String,
    default: 'ฟรี'
  },
  opening_hours: {
    type: String,
    default: 'ตลอดเวลา'
  },
  website: {
    type: String
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  average_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  review_count: {
    type: Number,
    default: 0
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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