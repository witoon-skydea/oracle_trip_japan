const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'กรุณาระบุชื่อผู้ใช้'],
    unique: true,
    trim: true,
    minlength: [3, 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร']
  },
  email: {
    type: String,
    required: [true, 'กรุณาระบุอีเมล'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'กรุณาระบุอีเมลที่ถูกต้อง']
  },
  password: {
    type: String,
    required: [true, 'กรุณาระบุรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร']
  },
  profile_image: {
    type: String,
    default: 'https://placehold.co/100x100/cccccc/ffffff?text=User'
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  saved_attractions: [{
    type: Schema.Types.ObjectId,
    ref: 'Attraction'
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
userSchema.pre('findOneAndUpdate', function() {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('User', userSchema);
