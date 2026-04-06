const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth users
    googleId: { type: String },
    mobileNo: { type: String }, // Added for new registration flow
    role: { type: String, enum: ['user', 'doctor', 'admin', 'patient'], default: 'user' },
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    bloodGroup: { type: String },
    chronicHistory: { type: String, default: 'None' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
