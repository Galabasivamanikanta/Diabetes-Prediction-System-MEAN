import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PredictionService } from './prediction.service';
import { HealthBridgeService } from './health-bridge.service';

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="prediction-container animate-fade">
      <!-- Result Panel (Clinical View) -->
      <div class="diagno-card result-panel" *ngIf="result">
        <div class="result-header">
          <div class="risk-indicator">
            <div class="risk-badge" [style.background-color]="getRiskColor()">{{ result.riskLevel }} Risk</div>
            <h2 class="gradient-text">{{ result.label }} Evaluation</h2>
            <p class="text-muted">AI Diagnostic Confidence: {{ result.probability }}%</p>
          </div>
          <div class="probability-score" [style.border-color]="getRiskColor()">
            <span class="score-val">{{ result.probability }}%</span>
            <span class="score-label">Certainty</span>
          </div>
        </div>

        <div class="analysis-grid">
          <!-- Key Risk Drivers -->
          <div class="diagno-card sub-panel">
            <h3 class="panel-title"><i class="material-icons-outlined">insights</i> Key Biomarker Drivers</h3>
            <div class="driver-list">
              <div class="driver-item" *ngFor="let driver of getRiskDrivers()">
                <div class="driver-info">
                  <span class="driver-name">{{ driver.name }}</span>
                  <span class="driver-impact" [style.color]="driver.impact > 0.6 ? 'var(--accent)' : 'var(--primary)'">
                    {{ (driver.impact * 100).toFixed(0) }}% Factor
                  </span>
                </div>
                <div class="driver-bar-bg">
                  <div class="driver-bar-fill" [style.width.%]="driver.impact * 100" [style.background-color]="getRiskColor()"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Clinical Recommendations -->
          <div class="diagno-card sub-panel">
            <h3 class="panel-title"><i class="material-icons-outlined">emergency</i> Clinical Guidance</h3>
            <div class="guide-content">
              <div class="recommend">
                <span class="guide-tag">Recommended High-Priority Steps</span>
                <ul><li *ngFor="let item of getDietPlan().eat">{{ item }}</li></ul>
              </div>
              <hr class="s-divider">
              <div class="avoid">
                <span class="guide-tag alert">Clinical Contraindications</span>
                <ul><li *ngFor="let item of getDietPlan().avoid">{{ item }}</li></ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Simulator -->
        <div class="diagno-card simulator-panel">
          <div class="simulator-header">
            <h3>Diagnostic "What-If" Analysis Engine</h3>
            <p class="text-muted">Adjust physiological variables to project potential risk mitigation strategies.</p>
          </div>
          
          <div class="sim-grid">
            <div class="slider-box">
              <div class="s-head">
                <span>Glucose Synthesis ({{ data.glucose }} mg/dL)</span>
                <span class="s-stat">{{ getSimulatedProb().toFixed(1) }}% Proj.</span>
              </div>
              <input type="range" [(ngModel)]="data.glucose" min="70" max="250" class="sim-slider">
            </div>
            <div class="slider-box">
              <div class="s-head">
                <span>BMI Projection ({{ data.bmi.toFixed(1) }})</span>
              </div>
              <input type="range" [(ngModel)]="data.bmi" min="15" max="50" step="0.1" class="sim-slider">
            </div>
          </div>
        </div>

        <div class="action-footer">
          <button class="btn-secondary" (click)="resetForm()">
            <i class="material-icons-outlined">refresh</i> New Assessment
          </button>
          <button class="btn-primary" (click)="notifyDoctor()">
            <i class="material-icons-outlined">notifications_active</i> Notify Clinical Lead
          </button>
        </div>
      </div>

      <!-- Input Form (Clinical View) -->
      <div class="diagno-card form-card animate-fade" *ngIf="!result">
        <div class="form-header">
          <div class="header-text">
            <h2 class="gradient-text">Laboratory Biomarker Intake</h2>
            <p class="text-muted">Precision analyzer for Indian PIMA physiological datasets.</p>
          </div>
          <button class="btn-secondary sync-btn" (click)="pullSmartSync()" [class.syncing]="isSyncing">
             <i class="material-icons-outlined">bolt</i> {{ isSyncing ? 'Synchronizing...' : 'Smart Profile Sync' }}
          </button>
        </div>

        <form (submit)="onPredict()" class="modern-form">
          <div class="input-grid">
            <div class="field">
              <label>Glucose (Fasting)</label>
              <input type="number" name="glucose" [(ngModel)]="data.glucose" required placeholder="mg/dL">
            </div>
            <div class="field">
              <label>BMI (kg/m²)</label>
              <input type="number" name="bmi" [(ngModel)]="data.bmi" required placeholder="Auto-calculated">
            </div>
            <div class="field">
              <label>Insulin (2h Serum)</label>
              <input type="number" name="insulin" [(ngModel)]="data.insulin" required placeholder="mu U/ml">
            </div>
            <div class="field">
              <label>Blood Pressure</label>
              <input type="number" name="bp" [(ngModel)]="data.bloodPressure" required placeholder="Diastolic mmHg">
            </div>
            <div class="field">
              <label>Patient Age</label>
              <input type="number" name="age" [(ngModel)]="data.age" required placeholder="Years">
            </div>
            <div class="field">
              <label>Skin Thickness</label>
              <input type="number" name="skin" [(ngModel)]="data.skinThickness" required placeholder="Triceps mm">
            </div>
          </div>

          <button type="submit" class="btn-primary main-submit" [disabled]="loading">
            <span *ngIf="!loading">Execute AI Diagnostics <i class="material-icons-outlined">analytics</i></span>
            <span *ngIf="loading">Clinical Processing <div class="mini-spinner"></div></span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .prediction-container { max-width: 1100px; margin: 0 auto; }
    
    .result-panel { padding: 40px; }
    .result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .risk-badge { padding: 6px 16px; border-radius: 50px; font-size: 0.8rem; font-weight: 800; color: white; text-transform: uppercase; margin-bottom: 15px; display: inline-block; }
    .result-header h2 { font-size: 2.22rem; font-family: var(--font-title); }
    
    .probability-score { width: 120px; height: 120px; border-radius: 16px; background: var(--bg-alt); border: 2px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; border-left-width: 8px; }
    .score-val { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
    .score-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; }

    .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .sub-panel { padding: 30px; }
    .panel-title { font-size: 1rem; font-weight: 800; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; color: var(--text-main); }
    .panel-title i { color: var(--primary); font-size: 1.3rem; }
    
    .driver-list { display: flex; flex-direction: column; gap: 18px; }
    .driver-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; font-weight: 700; }
    .driver-bar-bg { height: 8px; background: var(--bg-alt); border-radius: 10px; }
    .driver-bar-fill { height: 100%; border-radius: 10px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

    .guide-tag { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--primary); margin-bottom: 12px; }
    .guide-tag.alert { color: var(--accent); }
    .guide-content ul { list-style: none; padding-left: 0; }
    .guide-content li { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; margin-bottom: 10px; color: var(--text-muted); font-weight: 600; }
    .guide-content li::before { content: '•'; color: var(--primary); font-size: 1.5rem; }
    .s-divider { border: 0; border-top: 1px solid var(--border); margin: 20px 0; }

    .simulator-panel { padding: 35px; margin-bottom: 30px; background: #fafbfc; }
    .sim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; }
    .s-head { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
    .s-stat { color: var(--primary); background: white; padding: 2px 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
    .sim-slider { -webkit-appearance: none; width: 100%; height: 8px; background: #e2e8f0; border-radius: 5px; cursor: pointer; }
    .sim-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; background: white; border: 4px solid var(--primary); border-radius: 50%; box-shadow: var(--shadow-soft); }

    .action-footer { display: flex; gap: 20px; }
    .action-footer button { flex: 1; height: 56px; font-weight: 800; }

    .form-card { padding: 50px; }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .input-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 40px; }
    .field label { display: block; margin-bottom: 10px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .main-submit { width: 100%; height: 60px; font-size: 1.1rem; }
    .mini-spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; margin-left: 10px; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 850px) {
      .analysis-grid, .sim-grid, .input-grid { grid-template-columns: 1fr; }
      .result-header { flex-direction: column; gap: 20px; align-items: flex-start; }
      .probability-score { width: 100%; height: 100px; border-left-width: 8px; }
    }
  `]
})
export class PredictionComponent implements OnInit {
  data = { pregnancies: 0, glucose: 121, bloodPressure: 72, skinThickness: 23, insulin: 112, bmi: 27.8, dpf: 0.44, age: 31 };
  loading = false;
  isSyncing = false;
  result: any = null;

  constructor(
    private service: PredictionService,
    private healthService: HealthBridgeService
  ) { }

  ngOnInit() { }

  onPredict() {
    this.loading = true;
    this.service.predict(this.data).subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  pullSmartSync() {
    this.isSyncing = true;
    this.healthService.getProfile().subscribe({
      next: (res) => {
        if (res.age) this.data.age = res.age;
        if (res.weight && res.height) this.data.bmi = this.healthService.calculateBMI(res.weight, res.height);
        setTimeout(() => this.isSyncing = false, 1200);
      },
      error: () => this.isSyncing = false
    });
  }

  notifyDoctor() { alert("Emergency notification dispatched to clinical lead."); }
  resetForm() { this.result = null; }

  getRiskDrivers() {
    return [
      { name: 'Glucose Levels', val: this.data.glucose, threshold: 120, max: 200 },
      { name: 'BMI Correlation', val: this.data.bmi, threshold: 25, max: 40 },
      { name: 'Insulin Resistance', val: this.data.insulin, threshold: 100, max: 800 }
    ].map(d => ({ name: d.name, impact: Math.min(Math.max((d.val - d.threshold / 2) / (d.max - d.threshold / 2), 0.1), 0.95) }));
  }

  getDietPlan() {
    const high = this.result && this.result.probability > 40;
    return {
      eat: high ? ['High-Fiber Complex Carbs', 'Omega-3 Rich Proteins', 'Antioxidant Vegetables'] : ['Natural Whole Foods', 'Hydration Management', 'Balanced Macronutrients'],
      avoid: high ? ['High-Glycemic Sugars', 'Saturated Lipid Fats', 'Industrial Sodas'] : ['Processed Preservatives', 'Excess Sodium Intake']
    };
  }

  getSimulatedProb() {
    if (!this.result) return 0;
    const base = 0.4 + (this.data.glucose - 100) * 0.005 + (this.data.bmi - 25) * 0.015;
    return Math.min(Math.max(base * 100, 5), 98);
  }

  getRiskColor() {
    if (!this.result) return '#2563eb';
    switch (this.result.riskLevel) {
      case 'Low': return '#10b981';
      case 'Moderate': return '#f59e0b';
      case 'High': return '#dc2626';
      default: return '#dc2626';
    }
  }
}
