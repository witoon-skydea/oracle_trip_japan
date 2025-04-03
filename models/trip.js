const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  title: {
    type: String,
    required: [true, 'กรุณาระบุชื่อทริป'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'กรุณาระบุรายละเอียดทริป'],
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attractions: [{
    attraction: {
      type: Schema.Types.ObjectId,
      ref: 'Attraction'
    },
    day: Number,
    order: Number,
    notes: String
  }],
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  total_budget: {
    type: Number
  },
  status: {
    type: String,
    enum: ['planning', 'completed', 'cancelled'],
    default: 'planning'
  },
  is_public: {
    type: Boolean,
    default: false
  },
  cover_image: {
    type: String,
    default: 'https://placehold.co/800x400/cccccc/ffffff?text=Trip'
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
tripSchema.pre('findOneAndUpdate', function() {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('Trip', tripSchema);
