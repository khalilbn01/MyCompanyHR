const Company = require('../models/Company');
const User = require('../models/User');

// @desc  Get company info
// @route GET /api/company
exports.getCompany = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'MyCompanyRH',
        leavePolicy: { accrualPerMonth: 1.75, maxAccrual: 30, carryOver: true },
      });
    }
    const employeeCount = await User.countDocuments({ isActive: true, role: { $in: ['staff', 'hr'] } });
    res.json({ success: true, data: { ...company.toObject(), employeeCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update company info
// @route PUT /api/company
exports.updateCompany = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = new Company(req.body);
    } else {
      Object.assign(company, req.body);
    }
    await company.save();
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};