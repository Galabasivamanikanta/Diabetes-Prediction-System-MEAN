@echo off
echo ==============================================
echo   Pushing MEAN Stack updates to GitHub...
echo ==============================================
git init
git remote remove origin
git remote add origin https://github.com/Galabasivamanikanta/Diabetes-Prediction-System-MEAN.git
git add .
git commit -m "Complete Project Setup with Database DNS Fix"
git branch -M main
git push -u origin main
echo ==============================================
echo   Done! Your changes are now live on GitHub.
echo ==============================================
pause
