# 🩺 Diabetes Prediction System (MEAN Stack + Python ML)
### *Advanced Clinical Decision Support for Predictive Risk Stratification*

[![Live Demo](https://img.shields.io/badge/Live-On--Render-brightgreen?style=for-the-badge)](https://diabetes-prediction-system-mean.onrender.com)
[![Build](https://img.shields.io/badge/Build-Docker-blue?style=for-the-badge)](./Dockerfile)
[![University](https://img.shields.io/badge/Parul%20University-CSE--AI%26ML-orange?style=for-the-badge)](https://www.paruluniversity.ac.in/)

## 🏥 Project Overview
An industrial-grade laboratory portal designed to analyze patient biomarkers (Glucose, BMI, Insulin, etc.) and provide real-time diabetes risk assessments using a validated Scikit-Learn Random Forest model.

### 🔬 Core Features
- **AI Diagnostics**: Instant risk level detection (Low, Moderate, High, Very High).
- **Clinical Dashboard**: Real-time analytics for healthcare administrators.
- **Biomarker History**: Persistent patient screening records.
- **Alert System**: Immediate notification for critical high-risk cases.

## 🛠️ Technical Architecture
- **Frontend**: Angular 17+ (Reactive Components, Chart.js)
- **Backend**: Node.js & Express (RESTful API)
- **Database**: MongoDB Atlas (Persistent Cloud Storage)
- **AI Engine**: Python 3.10 (Scikit-Learn, NumPy, Pandas)
- **Deployment**: Dockerized on Render / Railway

---

## 👥 The Clinical Intelligence Team
Developed by a team of 4 specialists from **Parul University**, Department of **Computer Science and Engineering (AI & ML)**:

| Name | Role |
| :--- | :--- |
| **D. Venkatasai** | Lead Developer & System Architect |
| **M. Srikanth** | ML Engineer & Data Scientist |
| **G. Sivamanikanta** | Full-Stack Developer |
| **G. Avinash** | UI/UX Designer & Researcher |

---

## 🚀 Deployment Guide
This project is fully containerized. To run locally:
```bash
# Clone the repository
git clone https://github.com/Galabasivamanikanta/Diabetes-Prediction-System-MEAN.git

# Build and Run with Docker
docker build -t diabetes-portal .
docker run -p 5001:5001 diabetes-portal
```

---
*© 2026 Specialized Diabetic Analytics & Laboratory Portal. All rights reserved.*
