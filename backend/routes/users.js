const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getSupervisors, updateProfile, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.use(protect);

router.get('/', authorize('manager', 'admin'), getUsers);
router.get('/supervisors', getSupervisors);
router.put('/profile', updateProfile);

router.post('/', authorize('manager', 'admin'), createUser);
router.put('/:id', authorize('manager', 'admin'), updateUser);
router.delete('/:id', authorize('manager', 'admin'), deleteUser);

module.exports = router;