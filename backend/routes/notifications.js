const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, markAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.post('/', createNotification);
router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);

module.exports = router;
