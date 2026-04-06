const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};

exports.sendRegisterOTP = async (req, res) => {
    console.log(`[AUTH_SIGNAL]: Received OTP request for ${req.body.email}`);
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists with this clinical email.' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const mailOptions = {
            from: `"HealthPortal Clinical" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Clinical Account',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2563eb;">Verify Your Account</h2>
                    <p>Your one-time password (OTP) for account registration is:</p>
                    <h1 style="background: #f3f4f6; padding: 10px; display: inline-block; letter-spacing: 5px;">${otpCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Diabetic Research Portal Security Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: 'Verification code sent to your email.' });
    } catch (err) {
        console.error('[OTP_ERROR]:', err);
        const errorMsg = err.message || 'Failed to send verification code. Check backend logs.';
        res.status(500).json({ msg: errorMsg });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, mobileNo, password, role, otp } = req.body;

        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) return res.status(400).json({ msg: 'Invalid or expired verification code.' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, mobileNo, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        await Otp.deleteOne({ _id: otpRecord._id });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('Registration Error:', err);
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

        sendTokenResponse(user, 200, res);
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

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        const mailOptions = {
            from: `"HealthPortal Clinical" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Recovery OTP',
            html: `<h2>Password Reset Request</h2><p>Your OTP is: <b>${otpCode}</b></p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: 'Recovery code dispatched to your email.' });
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

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub: googleId } = ticket.getPayload();
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ name, email, googleId, role: 'user' });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ msg: 'Google Authorization Failed' });
    }
};
