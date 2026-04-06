const axios = require('axios');
const path = require('path');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');
const User = require('../models/User');

const ML_MODEL_DIR = path.join(__dirname, '../../ml-model');

exports.predict = async (req, res) => {
    try {
        const inputData = req.body;
        
        // Vercel Serverless: Call Python Function via HTTP
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const apiUrl = `${protocol}://${host}/api/predict_ml`;
        
        console.log(`[AI_BRIDGE]: Forwarding diagnostics to ${apiUrl}`);
        
        const response = await axios.post(apiUrl, {
            pregnancies: inputData.pregnancies || 0,
            glucose: inputData.glucose,
            bloodPressure: inputData.bloodPressure,
            skinThickness: inputData.skinThickness,
            insulin: inputData.insulin,
            bmi: inputData.bmi,
            dpf: inputData.dpf || 0.44,
            age: inputData.age
        });

        const result = response.data;
        if (result.error) return res.status(500).json({ msg: result.error });

        // Save prediction to DB
        const prediction = new Prediction({
            userId: req.userId,
            inputs: inputData,
            result: result.result,
            label: result.label,
            probability: result.probability,
            riskLevel: result.riskLevel,
            recommendation: result.recommendation
        });
        await prediction.save();

        // Critical Alert logic
        if (result.riskLevel === 'High' || result.riskLevel === 'Very High') {
            const user = await User.findById(req.userId);
            const notification = new Notification({
                message: `CRITICAL ALERT: High-Risk screening detected for ${user?.name || 'Patient'}. Immediate review requested.`,
                type: 'alert'
            });
            await notification.save();
        }

        res.json({ ...result, predictionId: prediction._id });

    } catch (err) {
        console.error('[AI_BRIDGE_ERROR]:', err.message);
        res.status(500).json({ 
            msg: 'Clinical Analytical Engine is currently unavailable on Vercel.',
            error: err.message 
        });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const predictions = await Prediction.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(predictions);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getStats = async (req, res) => {
    try {
        const total = await Prediction.countDocuments({ userId: req.userId });
        const diabetic = await Prediction.countDocuments({ userId: req.userId, result: 1 });
        const nonDiabetic = total - diabetic;

        const riskCounts = await Prediction.aggregate([
            { $match: { userId: req.userId } },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        const recent = await Prediction.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Average probability over time (last 10)
        const last10 = await Prediction.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('probability createdAt');

        res.json({ total, diabetic, nonDiabetic, riskCounts, recent, probabilityTrend: last10.reverse() });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getAllPredictions = async (req, res) => {
    try {
        if (req.userRole !== 'doctor' && req.userRole !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }
        const predictions = await Prediction.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .limit(100);
        res.json(predictions);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.bulkPredict = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

        const python = spawn('python3', [

            path.join(ML_MODEL_DIR, 'predict_csv.py'),
            req.file.path
        ]);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => { output += data.toString(); });
        python.stderr.on('data', (data) => { errorOutput += data.toString(); });

        python.on('close', (code) => {
            const fs = require('fs');
            try { fs.unlinkSync(req.file.path); } catch (e) { }
            if (code !== 0) return res.status(500).json({ msg: 'Bulk prediction error', error: errorOutput });
            try {
                const results = JSON.parse(output.trim());
                res.json(results);
            } catch (e) {
                res.status(500).json({ msg: 'Parse error', error: e.message });
            }
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.deletePrediction = async (req, res) => {
    try {
        const prediction = await Prediction.findOne({ _id: req.params.id, userId: req.userId });
        if (!prediction) return res.status(404).json({ msg: 'Prediction not found' });

        await prediction.deleteOne();
        res.json({ msg: 'Prediction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updatePredictionNotes = async (req, res) => {
    try {
        const { notes } = req.body;
        const prediction = await Prediction.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: { notes } },
            { new: true }
        );
        if (!prediction) return res.status(404).json({ msg: 'Prediction not found' });

        // Notify Patient about clinical note update
        const notification = new Notification({
            message: `A medical practitioner has updated the clinical notes for your screening from ${new Date(prediction.createdAt).toLocaleDateString()}.`,
            type: 'update',
            user: prediction.userId
        });
        await notification.save();

        res.json(prediction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
