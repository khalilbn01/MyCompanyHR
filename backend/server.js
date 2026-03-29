const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/company', require('./routes/company'));
app.use('/api/balance', require('./routes/balance'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // ⚡ Auto Monthly Accrual — runs every 1st of the month at 00:00
    cron.schedule('0 0 1 * *', async () => {
      console.log('⚡ Running automatic monthly accrual...');
      try {
        const User = require('./models/User');
        const LeaveBalance = require('./models/LeaveBalance');
        const Company = require('./models/Company');

        const company = await Company.findOne();
        const accrualRate = company?.leavePolicy?.accrualPerMonth || 1.75;
        const maxAccrual = company?.leavePolicy?.maxAccrual || 30;

        const staff = await User.find({
          role: { $in: ['staff', 'hr'] },
          isActive: true,
        });

        for (const user of staff) {
          let balance = await LeaveBalance.findOne({ employee: user._id });
          if (!balance) {
            balance = new LeaveBalance({ employee: user._id });
          }

          const newBalance = Math.min(balance.balance + accrualRate, maxAccrual);
          balance.balance = newBalance;
          balance.accrued += accrualRate;
          balance.lastAccrualDate = new Date();
          balance.history.push({
            date: new Date(),
            type: 'accrual',
            days: accrualRate,
            description: `Auto accrual — ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          });
          await balance.save();
        }

        console.log(`✅ Auto accrual done for ${staff.length} employees (+${accrualRate} days each)`);
      } catch (err) {
        console.error('❌ Auto accrual failed:', err.message);
      }
    });

    console.log('📅 Monthly accrual cron job scheduled (every 1st of the month)');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });