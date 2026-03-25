const Report = require('../models/Report');
const User = require('../models/User');

// Upload a new report (admin only)
exports.uploadReport = async (req, res) => {
    try {
        const { userId, reportName, reportType, findings } = req.body;
        if (req.userRole !== 'admin' && req.userRole !== 'doctor') {
            return res.status(403).json({ msg: 'Access denied' });
        }
        const report = new Report({
            userId,
            reportName,
            reportType: reportType || 'Lab Report',
            findings,
            uploadedBy: req.userId,
            status: 'pending'
        });
        await report.save();
        res.json({ msg: 'Report indexed successfully', report });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all reports (admin/doctor)
exports.getAllReports = async (req, res) => {
    try {
        if (req.userRole !== 'admin' && req.userRole !== 'doctor') {
            return res.status(403).json({ msg: 'Access denied' });
        }
        const reports = await Report.find()
            .populate('userId', 'name email')
            .populate('uploadedBy', 'name')
            .populate('diagnosedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get reports for a specific user (patient)
exports.getUserReports = async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.userId;
        // Patients can only see their own reports
        if (req.userRole === 'user' && targetUserId !== req.userId) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        const reports = await Report.find({ userId: targetUserId })
            .populate('uploadedBy', 'name')
            .populate('diagnosedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add diagnosis to a report (admin/doctor)
exports.diagnoseReport = async (req, res) => {
    try {
        if (req.userRole !== 'admin' && req.userRole !== 'doctor') {
            return res.status(403).json({ msg: 'Access denied' });
        }
        const { medicines, foodToTake, foodToAvoid, doctorNotes } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            {
                medicines,
                foodToTake,
                foodToAvoid,
                doctorNotes,
                diagnosedBy: req.userId,
                status: 'diagnosed'
            },
            { new: true }
        );
        if (!report) return res.status(404).json({ msg: 'Report not found' });
        res.json({ msg: 'Diagnosis finalized', report });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
