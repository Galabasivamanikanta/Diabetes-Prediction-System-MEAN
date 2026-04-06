# 🩺 Diabetes Prediction System (MEAN Stack + Python ML)
### *Advanced Clinical Decision Support for Predictive Risk Stratification*

[![Live Demo](https://img.shields.io/badge/Live-On--Render-brightgreen?style=for-the-badge)](https://diabetes-prediction-system-mean.onrender.com)
[![Build](https://img.shields.io/badge/Build-Docker-blue?style=for-the-badge)](./Dockerfile)
[![University](https://img.shields.io/badge/Parul%20University-CSE--AI%26ML-orange?style=for-the-badge)](https://www.paruluniversity.ac.in/)

## 🏥 Project Overview
An advanced, enterprise-grade **Clinical Decision Support System (CDSS)** engineered for industrial-scale laboratory screening and risk stratification. The platform serves as a specialized bridge between patient biomarkers and predictive diagnostics, utilizing a validated **Random Forest** engine to provide sub-second clinical evaluations.

### 🔬 Core Clinical Pillars
- **Enterprise Risk Analytics**: Real-time identification of Diabetic risk levels (Low to Critical) for clinical triage.
- **Role-Based Diagnostics**: Restricted medical assessment tools for authorized clinicians, with a high-trust administrative board.
- **Secure Clinical Auth**: Multi-layered security featuring email-based OTP verification and secure session management.
- **Historical Biomarker Persistence**: Specialized history tracking for multi-point clinical observations and patient progress review.

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
| **G. Sivamanikanta** | Full-Stack Developer | [sivamanikanta1013@gmail.com](mailto:sivamanikanta1013@gmail.com) |
| **G. Avinash** | UI/UX Designer & Researcher | - |

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
