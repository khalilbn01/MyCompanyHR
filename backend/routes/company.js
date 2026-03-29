const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCompany, updateCompany } = require('../controllers/companyController');

router.use(protect);
router.get('/', getCompany);
router.put('/', authorize('manager', 'admin'), updateCompany);

module.exports = router;