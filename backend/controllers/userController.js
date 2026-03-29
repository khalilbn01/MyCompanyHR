const User = require('../models/User');

// @desc  Get all users (Manager/Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort({ name: 1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get supervisors
exports.getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: { $in: ['hr', 'admin', 'manager'] }, isActive: true })
      .select('name email role department')
      .sort({ name: 1 });
    res.json({ success: true, data: supervisors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create team member (Manager only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, position, hireDate } = req.body;
    if (!['staff', 'hr'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Manager can only create staff or hr accounts' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password: password || 'password123', role, department, position, hireDate });
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update team member (Manager only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, department, position, role, hireDate } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!['staff', 'hr'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot edit this account' });
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department, position, role, hireDate },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete team member (Manager only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!['staff', 'hr'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot delete this account' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update own profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, position } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, department, position },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};