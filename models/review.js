const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  attraction: {
    type: Schema.Types.ObjectId,
    ref: 'Attraction',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'กรุณาระบุคะแนน'],
    min: [1, 'คะแนนต้องอยู่ระหว่าง 1-5'],
    max: [5, 'คะแนนต้องอยู่ระหว่าง 1-5']
  },
  title: {
    type: String,
    required: [true, 'กรุณาระบุหัวข้อรีวิว'],
    trim: true,
    maxlength: [100, 'หัวข้อรีวิวต้องไม่เกิน 100 ตัวอักษร']
  },
  comment: {
    type: String,
    required: [true, 'กรุณาระบุความคิดเห็น'],
    trim: true
  },
  visit_date: {
    type: Date
  },
  photos: [{
    type: String
  }],
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
reviewSchema.pre('findOneAndUpdate', function() {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('Review', reviewSchema);
