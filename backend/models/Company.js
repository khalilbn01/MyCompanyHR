const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  country: { type: String, trim: true, default: 'Tunisia' },
  industry: { type: String, trim: true },
  services: [{ type: String }],
  foundedYear: { type: Number },
  registrationNumber: { type: String, trim: true },
  website: { type: String, trim: true },
  employeeCount: { type: Number, default: 0 },
  leavePolicy: {
    accrualPerMonth: { type: Number, default: 1.75 },
    maxAccrual: { type: Number, default: 30 },
    carryOver: { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);