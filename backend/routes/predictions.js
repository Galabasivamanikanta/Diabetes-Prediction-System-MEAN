const express = require('express');
const router = express.Router();
const multer = require('multer');
const { predict, getHistory, getStats, getAllPredictions, bulkPredict, deletePrediction, updatePredictionNotes } = require('../controllers/predictionController');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/', auth, predict);
router.get('/history', auth, getHistory);
router.get('/stats', auth, getStats);
router.get('/all', auth, getAllPredictions); // Doctor/Admin route
router.post('/bulk', auth, upload.single('file'), bulkPredict);
router.delete('/:id', auth, deletePrediction);
router.put('/:id/notes', auth, updatePredictionNotes);

module.exports = router;
