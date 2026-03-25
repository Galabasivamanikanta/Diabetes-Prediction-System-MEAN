import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService } from './prediction.service';

@Component({
    selector: 'app-wellness',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="wellness-container">
      <div class="glass-card header-panel">
        <h2 class="gradient-text">Wellness Center</h2>
        <p class="subtitle">Your health score and medical achievements.</p>
      </div>

      <div class="wellness-grid">
        <!-- Wellness Score Card -->
        <div class="glass-card score-card">
          <div class="score-circle" [style.border-color]="getScoreColor()">
            <span class="score-value">{{ wellnessScore }}</span>
            <span class="score-label">Health Score</span>
          </div>
          <div class="score-info">
            <h3>{{ getScoreTitle() }}</h3>
            <p>{{ getScoreDesc() }}</p>
          </div>
        </div>

        <!-- Achievements Card -->
        <div class="glass-card badges-card">
          <h3>Medical Achievements</h3>
          <div class="badges-grid">
            <div class="badge-item" *ngFor="let badge of badges" [class.locked]="!badge.unlocked">
              <div class="badge-icon">{{ badge.icon }}</div>
              <div class="badge-info">
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-status">{{ badge.unlocked ? 'Unlocked' : 'Goal: ' + badge.requirement }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card guide-panel">
        <h3>WHO Health Standards</h3>
        <div class="standards-list">
          <div class="standard-item">
            <span class="std-name">Glucose (Fasting)</span>
            <span class="std-val">70 - 100 mg/dL</span>
          </div>
          <div class="standard-item">
            <span class="std-name">Normal BMI</span>
            <span class="std-val">18.5 - 24.9</span>
          </div>
          <div class="standard-item">
            <span class="std-name">Blood Pressure</span>
            <span class="std-val">120/80 mm Hg</span>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .wellness-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
    .header-panel { padding: 30px; margin-bottom: 30px; }
    
    .wellness-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-bottom: 30px; }
    @media (max-width: 900px) { .wellness-grid { grid-template-columns: 1fr; } }

    .score-card { padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .score-circle { width: 180px; height: 180px; border: 12px solid var(--primary); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 25px; transition: all 1s ease; }
    .score-value { font-size: 3.5rem; font-weight: 800; color: var(--text-main); line-height: 1; }
    .score-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
    .score-info h3 { margin-bottom: 10px; color: var(--text-main); }
    .score-info p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }

    .badges-card { padding: 30px; }
    .badges-card h3 { margin-bottom: 25px; font-size: 1.1rem; }
    .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .badge-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(37,99,235,0.03); border-radius: 12px; border: 1px solid var(--border); transition: all 0.3s; }
    .badge-item.locked { opacity: 0.4; filter: grayscale(1); }
    .badge-icon { font-size: 1.5rem; }
    .badge-name { display: block; font-weight: 600; font-size: 0.9rem; }
    .badge-status { font-size: 0.75rem; color: var(--text-muted); }

    .guide-panel { padding: 30px; }
    .guide-panel h3 { margin-bottom: 20px; font-size: 1.1rem; }
    .standards-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .standard-item { display: flex; justify-content: space-between; padding: 12px 20px; background: #f8fafc; border-radius: 10px; border: 1px solid var(--border); }
    .std-name { color: var(--text-muted); font-size: 0.9rem; }
    .std-val { font-weight: 600; font-size: 0.9rem; color: var(--primary); }
  `]
})
export class WellnessComponent implements OnInit {
    wellnessScore = 0;
    badges = [
        { name: 'Glucose Master', icon: '💎', requirement: 'Glucose < 100', unlocked: false },
        { name: 'BMI Warrior', icon: '🛡️', requirement: 'BMI < 25', unlocked: false },
        { name: 'Health Regular', icon: '⭐', requirement: '5+ Scans', unlocked: false },
        { name: 'Stability King', icon: '👑', requirement: 'Low Risk Trend', unlocked: false }
    ];

    constructor(private service: PredictionService) { }

    ngOnInit() {
        this.service.getHistory().subscribe(history => {
            this.calculateWellness(history);
        });
    }

    calculateWellness(history: any[]) {
        if (!history || history.length === 0) {
            this.wellnessScore = 0;
            return;
        }

        const latest = history[history.length - 1];
        let score = 100;

        // Deduct based on clinical variations
        if (latest.inputs.glucose > 100) score -= (latest.inputs.glucose - 100) * 0.4;
        if (latest.inputs.bmi > 25) score -= (latest.inputs.bmi - 25) * 1.5;
        if (latest.probability > 30) score -= (latest.probability - 30) * 0.5;

        this.wellnessScore = Math.min(Math.max(Math.round(score), 5), 100);

        // Unlock Badges
        this.badges[0].unlocked = latest.inputs.glucose < 100;
        this.badges[1].unlocked = latest.inputs.bmi < 25;
        this.badges[2].unlocked = history.length >= 5;
        this.badges[3].unlocked = history.slice(-3).every(h => h.probability < 30);
    }

    getScoreColor() {
        if (this.wellnessScore > 80) return '#10b981';
        if (this.wellnessScore > 60) return '#6366f1';
        if (this.wellnessScore > 40) return '#f59e0b';
        return '#ef4444';
    }

    getScoreTitle() {
        if (this.wellnessScore > 80) return 'Optimal Health';
        if (this.wellnessScore > 60) return 'Good Standing';
        if (this.wellnessScore > 40) return 'Needs Attention';
        return 'Critical Priority';
    }

    getScoreDesc() {
        if (this.wellnessScore > 80) return 'Your biomarkers are within clinically recommended ranges.';
        if (this.wellnessScore > 60) return 'Maintain your current lifestyle but watch your sugar intake.';
        if (this.wellnessScore > 40) return 'Consider dietary changes to bring your metrics back to normal.';
        return 'Immediate consultation with a healthcare professional is recommended.';
    }
}
