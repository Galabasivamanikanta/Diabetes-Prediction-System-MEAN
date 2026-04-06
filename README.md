# 🩺 Diabetes Prediction System (DPS)

A comprehensive clinical platform built with the MEAN stack, integrating machine learning for accurate diabetic risk assessment.

## 🚀 Deployed Infrastructure (Vercel Optimized)
The system is configured for a robust, multi-tier deployment on **Vercel**:
- **Frontend**: Angular 17+ (Professional Material Design)
- **Backend**: Node.js & Express (Secure Clinical Logic)
- **AI Engine**: Python (Scikit-Learn Random Forest Model)

## 🔑 Stable Configuration
The system is configured with high-availability credentials to prevent "fail" scenarios:
- **Google OAuth**: Enterprise-ready Client ID for seamless login.
- **Database**: Persistent MongoDB Atlas Cluster for clinical history storage.

## 🛠️ Deployment Troubleshooting (404 Resolution)
If you encounter a 404 error on the home URL:
1. Ensure the **Vercel Root Directory** is set correctly.
2. The `vercel.json` handles the SPA routing — ensure it is present in the repository root.
3. Configure the Environment Variables (`MONGODB_URI`, `GOOGLE_CLIENT_ID`, etc.) in the Vercel dashboard.

---
*Maintained by the Clinical Research Team*
