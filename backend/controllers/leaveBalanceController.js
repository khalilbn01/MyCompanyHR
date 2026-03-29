const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const Company = require('../models/Company');

// Get or create balance for a user
const getOrCreate = async (userId) => {
  let balance = await LeaveBalance.findOne({ employee: userId });
  if (!balance) {
    balance = await LeaveBalance.create({ employee: userId, balance: 0 });
  }
  return balance;
};

// @desc  Get my balance
// @route GET /api/balance/me
exports.getMyBalance = async (req, res) => {
  try {
    const balance = await getOrCreate(req.user.id);
    await balance.populate('employee', 'name email');
    res.json({ success: true, data: balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all balances (Manager/HR)
// @route GET /api/balance
exports.getAllBalances = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['staff', 'hr'] }, isActive: true });
    const company = await Company.findOne();
    const accrualRate = company?.leavePolicy?.accrualPerMonth || 1.75;
    const maxAccrual = company?.leavePolicy?.maxAccrual || 30;

    const balances = await Promise.all(
      users.map(async (u) => {
        const b = await getOrCreate(u._id);

        // Auto-calculate balance from hire date if not yet accrued
        let calculatedBalance = b.balance;
        let monthsWorked = 0;

        if (u.hireDate) {
          const hire = new Date(u.hireDate);
          const now = new Date();
          monthsWorked = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
          monthsWorked = Math.max(monthsWorked, 0);
          const theoreticalBalance = Math.min(monthsWorked * accrualRate, maxAccrual);

          // Only update if theoretical is higher (first time calculation)
          if (b.accrued === 0 && theoreticalBalance > 0) {
            b.balance = theoreticalBalance - b.used;
            b.accrued = theoreticalBalance;
            b.history.push({
              date: new Date(),
              type: 'accrual',
              days: theoreticalBalance,
              description: `Initial balance calculated from hire date (${monthsWorked} months × ${accrualRate} days)`,
            });
            await b.save();
            calculatedBalance = b.balance;
          }
        }

        return {
          employee: {
            _id: u._id,
            name: u.name,
            email: u.email,
            department: u.department,
            hireDate: u.hireDate,
            monthsWorked,
          },
          balance: b.balance,
          used: b.used,
          accrued: b.accrued,
          lastAccrualDate: b.lastAccrualDate,
        };
      })
    );

    res.json({ success: true, data: balances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Run monthly accrual for all staff
// @route POST /api/balance/accrue
exports.runMonthlyAccrual = async (req, res) => {
  try {
    const company = await Company.findOne();
    const accrualRate = company?.leavePolicy?.accrualPerMonth || 1.75;
    const maxAccrual = company?.leavePolicy?.maxAccrual || 30;

    const staffUsers = await User.find({ role: 'staff', isActive: true });
    let updated = 0;

    for (const user of staffUsers) {
      const balance = await getOrCreate(user._id);
      const newBalance = Math.min(balance.balance + accrualRate, maxAccrual);
      balance.balance = newBalance;
      balance.accrued += accrualRate;
      balance.lastAccrualDate = new Date();
      balance.history.push({
        date: new Date(),
        type: 'accrual',
        days: accrualRate,
        description: `Monthly accrual — ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      });
      await balance.save();
      updated++;
    }

    res.json({ success: true, message: `Accrual applied to ${updated} employees`, rate: accrualRate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Adjust balance manually (Manager)
// @route PUT /api/balance/:userId
exports.adjustBalance = async (req, res) => {
  try {
    const { days, description } = req.body;
    const balance = await getOrCreate(req.params.userId);
    balance.balance += days;
    balance.history.push({
      date: new Date(),
      type: 'adjustment',
      days,
      description: description || 'Manual adjustment by manager',
    });
    await balance.save();
    res.json({ success: true, data: balance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Check if employee has enough balance
// @route GET /api/balance/check/:userId?days=5
exports.checkBalance = async (req, res) => {
  try {
    const { days } = req.query;
    const balance = await getOrCreate(req.params.userId);
    const hasEnough = balance.balance >= parseFloat(days);
    res.json({ success: true, hasEnough, currentBalance: balance.balance, requested: parseFloat(days) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};