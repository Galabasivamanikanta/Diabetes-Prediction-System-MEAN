const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, forgotPassword, getAllUsers, googleLogin, sendRegisterOTP } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/send-otp', sendRegisterOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.get('/users', auth, getAllUsers);

module.exports = router;

