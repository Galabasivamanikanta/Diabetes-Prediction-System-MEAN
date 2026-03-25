require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const predictionRoutes = require('./routes/predictions');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');

const app = express();

// Essential Production Middlewares
app.use(cors());
app.use(express.json());

// Request logging for Render
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// FIRST: Unauthenticated Health Check for Render Deployment Verification
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'perfect', 
        clinical_system: 'active',
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
    .then(() => {
        console.log('✅ Clinical Repository established with MongoDB');
    })
    .catch(err => {
        console.error('❌ MONGODB CONNECTION FAILED:', err.message);
        console.log('Deployment will proceed; API calls requiring backend will fail until MONGODB_URI is correctly configured.');
    });

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Clinical Portal fully operational on port ${PORT}`);
});
