const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLeaves,
  createLeave,
  getLeave,
  updateLeaveStatus,
  deleteLeave,
  getStats,
  getPendingLeaves,
} = require('../controllers/leaveController');

router.use(protect);

router.get('/stats', getStats);
router.get('/pending', authorize('hr', 'admin'), getPendingLeaves);

router.route('/').get(getLeaves).post(
  [
    body('leaveType')
      .isIn(['Half Day Leave', 'Full Day Leave', 'Multi-Day Leave', 'Time Off Permission'])
      .withMessage('Invalid leave type'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('endDate').notEmpty().withMessage('End date is required'),
    body('reason')
      .isIn(['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Other'])
      .withMessage('Invalid reason'),
  ],
  createLeave
);

router.route('/:id').get(getLeave).delete(deleteLeave);
router.get('/pending', authorize('hr', 'manager', 'admin'), getPendingLeaves);
router.put('/:id/status', authorize('hr', 'manager', 'admin'), updateLeaveStatus);

module.exports = router;
