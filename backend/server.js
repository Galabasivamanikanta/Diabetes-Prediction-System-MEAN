require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const predictionRoutes = require('./routes/predictions');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();

// Essential Production Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Request logging for Render
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// FIRST: Unauthenticated Health Check for Render Deployment Verification
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'active', 
        clinical_system: 'Diabetes Prediction System (DPS)',
        timestamp: new Date().toISOString()
    });
});

// SECOND: API Backend Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// THIRD: Static Asset Serving (Frontend Assembly)
const frontendPath = process.env.STATIC_PATH || path.resolve(__dirname, '../frontend/dist/frontend/browser');
app.use(express.static(frontendPath));

console.log('Production: Serving assets from', frontendPath);

// LAST: Catch-all Routing for Angular SPAs
app.get('*', (req, res) => {
    // Avoid accidentally serving index.html for missing API endpoints
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'Clinical API Endpoint Not Found' });
    }
    
    const indexPath = path.join(frontendPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('CRITICAL: Frontend index not found at', indexPath);
            res.status(500).send('Diagnostic Frontend Assembly Failure.');
        }
    });
});

// Resilient MongoDB Lifecycle
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_db';
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ DiagnoLabs Clinical Repository established');
        // Initial Admin Seed
        try {
            const adminEmail = 'admin@clinical.com';
            const existingAdmin = await User.findOne({ email: adminEmail });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash('AdminPortal@2026', 10);
                const adminUser = new User({
                    name: 'System Administrator',
                    email: adminEmail,
                    mobileNo: '0000000000',
                    password: hashedPassword,
                    role: 'admin'
                });
                await adminUser.save();
                console.log('✅ Admin seed successfully created.');
            } else {
                console.log('✅ Admin credentials confirmed.');
            }
        } catch (seedErr) {
            console.error('⚠️ Admin seed failed:', seedErr.message);
        }
    })
    .catch(err => {
        console.error('❌ MONGODB CONNECTION FAILED:', err.message);
        console.log('Deployment will proceed; API calls requiring backend will fail until MONGODB_URI is correctly configured.');
    });

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Clinical Portal fully operational on port ${PORT}`);
});

module.exports = app;
