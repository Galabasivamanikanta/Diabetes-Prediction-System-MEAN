const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportName: { type: String, required: true },
    reportType: { type: String, default: 'Lab Report' },
    findings: { type: String },
    medicines: { type: String },
    foodToTake: { type: String },
    foodToAvoid: { type: String },
    doctorNotes: { type: String },
    status: { type: String, enum: ['pending', 'diagnosed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
