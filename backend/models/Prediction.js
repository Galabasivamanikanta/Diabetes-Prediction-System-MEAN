const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputs: {
        pregnancies: { type: Number, required: true },
        glucose: { type: Number, required: true },
        bloodPressure: { type: Number, required: true },
        skinThickness: { type: Number, required: true },
        insulin: { type: Number, required: true },
        bmi: { type: Number, required: true },
        dpf: { type: Number, required: true },
        age: { type: Number, required: true }
    },
    result: { type: Number, required: true }, // 0 or 1
    label: { type: String, required: true }, // Diabetic or Non-Diabetic
    probability: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    recommendation: { type: String },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
