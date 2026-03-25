const Notification = require('../models/Notification');

exports.createNotification = async (req, res) => {
    try {
        const { message, type, user, doctor } = req.body;
        const notification = new Notification({
            message,
            type,
            user,
            doctor
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        let query = {};
        
        // If not Admin, filter by user/doctor association
        if (req.userRole !== 'admin') {
            query = { 
                $or: [
                    { user: req.userId },
                    { doctor: req.userId }
                ]
            };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
            
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};
