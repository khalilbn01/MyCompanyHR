const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    requestingStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Half Day Leave', 'Full Day Leave', 'Multi-Day Leave', 'Time Off Permission'],
      required: [true, 'Leave type is required'],
    },
    leaveTypeCode: {
      type: String,
      enum: ['HDL', 'FDL', 'MDL', 'TOP'],
      required: true,
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    duration: { type: String },
    reason: {
      type: String,
      enum: ['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Other'],
      required: [true, 'Reason is required'],
    },
    description: { type: String, trim: true },
    medicalPrescription: { type: String }, // file path or URL
    approvingStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    hrComment: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-calculate duration
leaveRequestSchema.pre('save', function (next) {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (this.leaveType === 'Time Off Permission') {
    const diffMs = end - start;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    this.duration = `${diffHours} Hour${diffHours !== 1 ? 's' : ''}`;
  } else if (this.leaveType === 'Half Day Leave') {
    this.duration = 'Half a day';
  } else {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.duration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
