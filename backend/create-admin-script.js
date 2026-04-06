const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_db';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to database...');

        const adminEmail = 'admin@clinical.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin account already exists.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('AdminPortal@2026', 10);
        const adminUser = new User({
            name: 'System Administrator',
            email: adminEmail,
            mobileNo: '0000000000',
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        console.log('✅ Admin account created successfully!');
        console.log('Email: admin@clinical.com');
        console.log('Password: AdminPortal@2026');
        
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
