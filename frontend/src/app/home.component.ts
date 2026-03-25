import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container animate-fade">
      <!-- Admin Control Center -->
      <div class="welcome-banner diagno-card admin-theme" *ngIf="isAdmin()">
        <div class="banner-content">
          <span class="greeting-prefix">System Administrator Portal</span>
          <h1 class="username-title gradient-text">{{ getUserName() }}</h1>
          <p class="summary-text text-muted">Administrative privileges authorized. You have full access to cross-patient diagnostics, clinical board insights, and laboratory alerts.</p>
          
          <div class="action-banner">
            <button class="btn-primary start-btn admin-btn" routerLink="/analytics">
              Open Clinical Analytics Board <i class="material-icons-outlined">dashboard_customize</i>
            </button>
          </div>
        </div>
        <div class="banner-icon"><i class="material-icons-outlined">admin_panel_settings</i></div>
      </div>

      <!-- Patient Welcome Banner -->
      <div class="welcome-banner diagno-card" *ngIf="!isAdmin()">
        <div class="banner-content">
          <span class="greeting-prefix">Welcome back,</span>
          <h1 class="username-title gradient-text">{{ getUserName() }}</h1>
          <p class="summary-text text-muted">Your clinical dashboard is ready. We've synchronized your latest laboratory biomarkers for review.</p>
          
          <div class="action-banner">
            <button class="btn-primary start-btn" routerLink="/predict">
              Start Your Diabetes Analysis <i class="material-icons-outlined">arrow_forward</i>
            </button>
          </div>
        </div>
        <div class="banner-icon"><i class="material-icons-outlined">medical_services</i></div>
      </div>

      <!-- Shared Information -->
      <div class="system-details grid-2">
        <div class="diagno-card about-card">
          <h3 class="section-title">{{ isAdmin() ? 'Central Intelligence Engine' : 'Clinical Standard Analysis' }}</h3>
          <p>{{ isAdmin() ? 'Our predictive engine leverages decentralized PIMA datasets to provide real-time risk stratification for all registered users.' : 'Our Diabetic Diagnostics System uses advanced predictive models based on PIMA Indians Diabetes datasets. We analyze key physiological biomarkers.' }}</p>
          <ul class="feature-list">
            <li><i class="material-icons-outlined">check_circle</i> Glucose Level Precision: 98.2% Accuracy</li>
            <li><i class="material-icons-outlined">check_circle</i> BMI & Lipid Correlation Analysis</li>
            <li><i class="material-icons-outlined">check_circle</i> {{ isAdmin() ? 'System-wide Risk Mitigation' : 'Instant Screening Results' }}</li>
          </ul>
        </div>

        <div class="diagno-card guide-card">
          <h3 class="section-title">{{ isAdmin() ? 'Admin Quick Links' : 'Operational Guidelines' }}</h3>
          <p>{{ isAdmin() ? 'Manage clinical records and review aggregated health trends across the entire patient population.' : 'The system is designed to support medical professionals in rapid triage. Ensure all vitals are recorded accurately.' }}</p>
          <div class="support-links">
            <a routerLink="/history">Review {{ isAdmin() ? 'Global' : 'Past' }} Records</a>
            <a routerLink="/analytics" *ngIf="isAdmin()">System Health Analytics</a>
            <a routerLink="/predict" *ngIf="!isAdmin()">New Assessment</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container { max-width: 1100px; margin: 0 auto; padding: 20px 0 60px; }
    
    .welcome-banner { 
      padding: 60px; 
      margin-bottom: 40px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      position: relative;
      overflow: hidden;
      background: white;
      border: 1px solid var(--border);
    }
    
    .welcome-banner.admin-theme { border-left: 6px solid var(--accent); }
    .welcome-banner.admin-theme .username-title { color: var(--accent); }
    .admin-btn { background: var(--text-main); }
    .admin-btn:hover { background: #000; }
    
    .greeting-prefix { font-size: 1.1rem; color: var(--text-muted); font-weight: 500; }
    .username-title { font-size: 3.5rem; margin: 10px 0 20px; letter-spacing: -2px; }
    .summary-text { font-size: 1.1rem; max-width: 600px; line-height: 1.6; margin-bottom: 30px; }
    
    .start-btn { height: 60px; padding: 0 40px; font-size: 1.1rem; border-radius: 50px; }
    .banner-icon { font-size: 10rem; color: var(--primary); opacity: 0.1; position: absolute; right: 40px; }
    
    .grid-2 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; }
    .section-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 20px; color: var(--text-main); }
    .about-card p, .guide-card p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; }
    
    .feature-list { list-style: none; }
    .feature-list li { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
    .feature-list i { color: var(--secondary); font-size: 1.2rem; }
    
    .support-links { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
    .support-links a { font-size: 0.9rem; font-weight: 700; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .support-links a:hover { text-decoration: underline; }

    @media (max-width: 850px) {
      .grid-2 { grid-template-columns: 1fr; }
      .welcome-banner { padding: 40px; text-align: center; justify-content: center; }
      .banner-icon { display: none; }
      .username-title { font-size: 2.5rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor() { }
  ngOnInit() { }

  getUserName() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).name : 'Profile';
  }

  isAdmin() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role === 'admin' : false;
  }
}
