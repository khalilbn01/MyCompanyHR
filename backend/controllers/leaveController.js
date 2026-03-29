const { validationResult } = require('express-validator');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

const leaveTypeCodes = {
  'Half Day Leave': 'HDL',
  'Full Day Leave': 'FDL',
  'Multi-Day Leave': 'MDL',
  'Time Off Permission': 'TOP',
};

// @desc  Get all leave requests (HR/Admin) or own (staff)
// @route GET /api/leaves
exports.getLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'staff') {
      query.requestingStaff = req.user.id;
    }
    const { startDate, endDate, status } = req.query;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { ...query.endDate, $lte: new Date(endDate) };
    if (status) query.status = status;

    const leaves = await LeaveRequest.find(query)
      .populate('requestingStaff', 'name email department')
      .populate('approvingStaff', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get pending requests for HR/Manager approval
// @route GET /api/leaves/pending
exports.getPendingLeaves = async (req, res) => {
  try {
    let query = { status: 'Pending' };

    if (req.user.role === 'hr') {
      const staffUsers = await User.find({ role: 'staff' }).select('_id');
      const staffIds = staffUsers.map(u => u._id);
      query.requestingStaff = { $in: staffIds };
    } else if (req.user.role === 'manager' || req.user.role === 'admin') {
      const hrUsers = await User.find({ role: 'hr' }).select('_id');
      const hrIds = hrUsers.map(u => u._id);
      query.requestingStaff = { $in: hrIds };
    }

    const leaves = await LeaveRequest.find(query)
      .populate('requestingStaff', 'name email department role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create leave request
// @route POST /api/leaves
exports.createLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { leaveType, startDate, endDate, reason, description, approvingStaff } = req.body;

    // Check balance for Paid Leave
    if (reason === 'Paid Leave') {
      const LeaveBalance = require('../models/LeaveBalance');
      const balance = await LeaveBalance.findOne({ employee: req.user.id });

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.max(Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)), 1);

      if (!balance || balance.balance < diffDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. Available: ${balance?.balance.toFixed(2) || 0} days, Requested: ${diffDays} days. Consider Unpaid Leave instead.`,
        });
      }
    }

    const leave = await LeaveRequest.create({
      requestingStaff: req.user.id,
      leaveType,
      leaveTypeCode: leaveTypeCodes[leaveType],
      startDate,
      endDate,
      reason,
      description,
      approvingStaff,
    });

    await leave.populate('requestingStaff', 'name email');
    await leave.populate('approvingStaff', 'name email');

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single leave request
// @route GET /api/leaves/:id
exports.getLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('requestingStaff', 'name email department')
      .populate('approvingStaff', 'name email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (req.user.role === 'staff' && leave.requestingStaff._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update leave status (HR/Manager)
// @route PUT /api/leaves/:id/status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, hrComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await LeaveRequest.findById(req.params.id)
      .populate('requestingStaff', 'name email department role');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Deduct balance when Approved + Paid Leave
if (status === 'Approved' && leave.reason === 'Paid Leave') {
  const LeaveBalance = require('../models/LeaveBalance');
  const balance = await LeaveBalance.findOne({ employee: leave.requestingStaff._id });

  if (balance) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffDays = Math.max(Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)), 1);

    balance.balance = Math.max(balance.balance - diffDays, 0);
    balance.used += diffDays;
    balance.history.push({
      date: new Date(),
      type: 'deduction',
      days: -diffDays,
      description: `Leave approved: ${leave.leaveType} (${leave.startDate.toDateString()} — ${leave.endDate.toDateString()})`,
    });
    await balance.save();
  }
}

    // Restore balance if previously approved and now rejected
    if (status === 'Rejected' && leave.status === 'Approved' && leave.reason === 'Paid Leave') {
      const LeaveBalance = require('../models/LeaveBalance');
      const balance = await LeaveBalance.findOne({ employee: leave.requestingStaff._id });

      if (balance) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffDays = Math.max(Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)), 1);

        balance.balance += diffDays;
        balance.used = Math.max(balance.used - diffDays, 0);
        balance.history.push({
          date: new Date(),
          type: 'adjustment',
          days: diffDays,
          description: `Leave rejected — balance restored: ${diffDays} days`,
        });
        await balance.save();
      }
    }

    leave.status = status;
    leave.hrComment = hrComment;
    leave.approvingStaff = req.user.id;
    await leave.save();

    await leave.populate('approvingStaff', 'name email');

    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete leave request
// @route DELETE /api/leaves/:id
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.requestingStaff.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (leave.status !== 'Pending' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete a non-pending request' });
    }

    await leave.deleteOne();
    res.json({ success: true, message: 'Leave request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get dashboard stats
// @route GET /api/leaves/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.role === 'staff' ? req.user.id : null;
    const matchStage = userId
      ? { requestingStaff: require('mongoose').Types.ObjectId.createFromHexString(userId) }
      : {};

    const stats = await LeaveRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = { Pending: 0, Approved: 0, Rejected: 0, Total: 0 };
    stats.forEach((s) => {
      result[s._id] = s.count;
      result.Total += s.count;
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};