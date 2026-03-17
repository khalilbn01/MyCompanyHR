const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await LeaveRequest.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const hrUser = await User.create({
    name: 'Rafika Chwayah',
    email: 'hr@mycompany.com',
    password: 'password123',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager',
  });

  const staffUser = await User.create({
    name: 'Khalil Ben Nasr',
    email: 'staff@mycompany.com',
    password: 'password123',
    role: 'staff',
    department: 'Engineering',
    position: 'Software Developer',
  });

  const managerUser = await User.create({
  name: 'Manager Komutel',
  email: 'manager@mycompany.com',
  password: 'password123',
  role: 'manager',
  department: 'Management',
  position: 'Team Manager',
  });

  console.log('✅ Users created');

  // Create leave requests
  const leaveData = [
    {
      requestingStaff: staffUser._id,
      leaveType: 'Time Off Permission',
      leaveTypeCode: 'TOP',
      startDate: new Date('2025-11-17T03:30:00'),
      endDate: new Date('2025-11-17T05:30:00'),
      duration: '2 Hours',
      reason: 'Other',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Full Day Leave',
      leaveTypeCode: 'FDL',
      startDate: new Date('2025-12-10T12:00:00'),
      endDate: new Date('2025-12-10T12:00:00'),
      duration: '1 day',
      reason: 'Paid Leave',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Time Off Permission',
      leaveTypeCode: 'TOP',
      startDate: new Date('2025-12-11T03:30:00'),
      endDate: new Date('2025-12-11T05:30:00'),
      duration: '2 Hours',
      reason: 'Other',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Multi-Day Leave',
      leaveTypeCode: 'MDL',
      startDate: new Date('2025-12-30T12:00:00'),
      endDate: new Date('2025-12-31T12:00:00'),
      duration: '2 days',
      reason: 'Paid Leave',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Full Day Leave',
      leaveTypeCode: 'FDL',
      startDate: new Date('2026-01-02T12:00:00'),
      endDate: new Date('2026-01-02T12:00:00'),
      duration: '1 day',
      reason: 'Paid Leave',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Time Off Permission',
      leaveTypeCode: 'TOP',
      startDate: new Date('2026-01-27T03:30:00'),
      endDate: new Date('2026-01-27T05:30:00'),
      duration: '2 Hours',
      reason: 'Other',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Half Day Leave',
      leaveTypeCode: 'HDL',
      startDate: new Date('2026-02-17T01:30:00'),
      endDate: new Date('2026-02-17T05:30:00'),
      duration: 'Half a day',
      reason: 'Paid Leave',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Time Off Permission',
      leaveTypeCode: 'TOP',
      startDate: new Date('2026-02-26T03:30:00'),
      endDate: new Date('2026-02-26T05:30:00'),
      duration: '2 Hours',
      reason: 'Other',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Time Off Permission',
      leaveTypeCode: 'TOP',
      startDate: new Date('2026-03-12T03:30:00'),
      endDate: new Date('2026-03-12T05:30:00'),
      duration: '2 Hours',
      reason: 'Other',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
    {
      requestingStaff: staffUser._id,
      leaveType: 'Multi-Day Leave',
      leaveTypeCode: 'MDL',
      startDate: new Date('2026-03-16T12:00:00'),
      endDate: new Date('2026-03-19T12:00:00'),
      duration: '4 days',
      reason: 'Paid Leave',
      approvingStaff: hrUser._id,
      status: 'Approved',
    },
  ];

  for (const leave of leaveData) {
    await LeaveRequest.create(leave);
  }

  console.log('✅ Leave requests seeded');
  console.log('\n📋 Demo Accounts:');
  console.log('  Manager: manager@mycompany.com / password123');
  console.log('  HR:    hr@mycompany.com    / password123');
  console.log('  Staff: staff@mycompany.com / password123');

  await mongoose.disconnect();
  console.log('\n✅ Seed complete!');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
