const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyBalance, getAllBalances, runMonthlyAccrual, adjustBalance, checkBalance } = require('../controllers/leaveBalanceController');

router.use(protect);
router.get('/me', getMyBalance);
router.get('/', authorize('hr', 'manager', 'admin'), getAllBalances);
router.post('/accrue', authorize('manager', 'admin'), runMonthlyAccrual);
router.put('/:userId', authorize('manager', 'admin'), adjustBalance);
router.get('/check/:userId', checkBalance);

module.exports = router;