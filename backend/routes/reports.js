const express = require('express');
const router = express.Router();
const { uploadReport, getAllReports, getUserReports, diagnoseReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.post('/upload', auth, uploadReport);
router.get('/all', auth, getAllReports);
router.get('/my', auth, getUserReports);
router.get('/user/:userId', auth, getUserReports);
router.put('/:id/diagnose', auth, diagnoseReport);

module.exports = router;
