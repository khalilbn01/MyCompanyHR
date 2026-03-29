const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  accrued: { type: Number, default: 0 },
  lastAccrualDate: { type: Date, default: Date.now },
  year: { type: Number, default: new Date().getFullYear() },
  history: [{
    date: { type: Date },
    type: { type: String, enum: ['accrual', 'deduction', 'adjustment'] },
    days: { type: Number },
    description: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);