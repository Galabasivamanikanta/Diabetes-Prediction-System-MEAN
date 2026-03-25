const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { userId: user.id, role: user.role };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name, email, role: user.role } });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { userId: user.id, role: user.role };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { age, weight, height, bloodGroup, chronicHistory } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: { age, weight, height, bloodGroup, chronicHistory } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this clinical email.' });
        }

        // Simulate sending a recovery email
        console.log(`[PASS_RECOVERY] Simulated reset link sent to: ${email}`);
        
        res.json({ msg: 'A clinical password recovery link has been dispatched to your email.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        if (req.userRole !== 'admin' && req.userRole !== 'doctor') {
            return res.status(403).json({ msg: 'Access denied' });
        }
        const users = await User.find({ role: 'user' }).select('_id name email');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
