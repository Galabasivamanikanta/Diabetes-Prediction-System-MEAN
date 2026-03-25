import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionService } from './prediction.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="history-container animate-fade">
      <div class="diagno-card header-panel">
        <div class="header-flex">
          <div class="header-text">
            <h2 class="title gradient-text">Patient Diagnostic Records</h2>
            <p class="subtitle">Securely managed historical assessments and clinical biomarkers.</p>
          </div>
          <div class="history-stats">
            <span class="stat-badge">Total Records: {{ history.length }}</span>
          </div>
        </div>
      </div>

      <!-- Loading/Empty States -->
      <div class="loading-state" *ngIf="loading">
        <div class="clinical-spinner"></div>
        <p>Synchronizing Clinical Database...</p>
      </div>

      <div class="empty-state diagno-card" *ngIf="!loading && history.length === 0">
        <div class="empty-icon"><i class="material-icons-outlined">folder_open</i></div>
        <p>No historical diagnostic data found for this patient session.</p>
      </div>

      <!-- History Table -->
      <div class="history-table diagno-card" *ngIf="!loading && history.length > 0">
        <div class="table-header">
          <span class="col-date">Date & Time</span>
          <span class="col-result">Diagnostic Result</span>
          <span class="col-risk">Risk Level</span>
          <span class="col-notes">Clinical Notes</span>
          <span class="col-actions">Actions</span>
        </div>
        
        <div class="table-body">
          <div class="row" *ngFor="let item of history">
            <div class="col-date">
              <span class="date">{{ item.createdAt | date:'MMM d, y' }}</span>
              <span class="time">{{ item.createdAt | date:'h:mm a' }}</span>
            </div>
            <div class="col-result">
              <span class="label">{{ item.label }}</span>
              <span class="prob">{{ item.probability }}% Probability</span>
            </div>
            <div class="col-risk">
              <span class="status-chip" [style.background-color]="getRiskColor(item.riskLevel)">
                {{ item.riskLevel }}
              </span>
            </div>
            <div class="col-notes">
              <textarea 
                [(ngModel)]="item.notes" 
                placeholder="Observed trends..."
                (blur)="updateNotes(item)"
              ></textarea>
              <div class="save-status" *ngIf="item.saving">Saving...</div>
            </div>
            <div class="col-actions">
              <button class="btn-icon view" (click)="viewReport(item)" title="Detailed Report">
                <i class="material-icons-outlined">visibility</i>
              </button>
              <button class="btn-icon delete" (click)="deleteItem(item._id)" title="Remove Entry">
                <i class="material-icons-outlined">delete_outline</i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- DIAGNOSTIC REPORT MODAL -->
      <div class="modal-overlay animate-fade" *ngIf="selectedItem" (click)="selectedItem = null">
        <div class="modal-content diagno-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="m-title-box">
              <span class="m-label">Clinical Data Report</span>
              <h3>ID: {{ selectedItem._id.substring(0,8) }}</h3>
            </div>
            <button class="close-btn" (click)="selectedItem = null">
              <i class="material-icons-outlined">close</i>
            </button>
          </div>

          <div class="modal-body">
             <div class="report-banner" [style.background-color]="getRiskColor(selectedItem.riskLevel) + '08'">
               <div class="banner-stat">
                 <span class="b-label">Finding</span>
                 <span class="b-value" [style.color]="getRiskColor(selectedItem.riskLevel)">{{ selectedItem.label }}</span>
               </div>
               <div class="banner-stat">
                 <span class="b-label">Certainty</span>
                 <span class="b-value">{{ selectedItem.probability }}%</span>
               </div>
               <div class="banner-stat">
                 <span class="b-label">Risk Grade</span>
                 <span class="b-value">{{ selectedItem.riskLevel }}</span>
               </div>
             </div>

             <div class="vitals-grid">
               <div class="vital-item" *ngFor="let v of getVitalsArray(selectedItem)">
                 <span class="v-label">{{ v.key }}</span>
                 <span class="v-value">{{ v.val }} <small>{{ v.unit }}</small></span>
               </div>
             </div>

             <div class="report-section">
               <h4>Clinical Recommendation</h4>
               <p>{{ selectedItem.recommendation }}</p>
             </div>

             <div class="report-section routine-section">
               <h4>Clinical Daily Routine</h4>
               <div class="routine-grid">
                 <div class="routine-item" *ngFor="let r of getDailyRoutine(selectedItem)">
                   <span class="r-task">{{ r.time }}</span>
                   <p class="r-desc">{{ r.desc }}</p>
                 </div>
               </div>
             </div>

             <div class="report-section diet-section">
               <h4>Clinical Dietary Roadmap</h4>
               <div class="diet-flex">
                 <div class="diet-col recommend">
                   <span class="d-label">Recommended Intake</span>
                   <ul><li *ngFor="let f of getDietPlan(selectedItem).eat">{{ f }}</li></ul>
                 </div>
                 <div class="diet-col avoid">
                   <span class="d-label">Clinical Contraindications</span>
                   <ul><li *ngFor="let f of getDietPlan(selectedItem).avoid">{{ f }}</li></ul>
                 </div>
               </div>
             </div>

             <div class="report-section" *ngIf="selectedItem.notes">
               <h4>Practitioner Observations</h4>
               <p class="notes-text italic">"{{ selectedItem.notes }}"</p>
             </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="selectedItem = null">Archive View</button>
            <button class="btn-primary" onclick="window.print()">
              <i class="material-icons-outlined">print</i> Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container { max-width: 1200px; margin: 0 auto; }
    .header-panel { padding: 40px; margin-bottom: 30px; }
    .header-flex { display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 2.2rem; margin-bottom: 6px; font-family: var(--font-title); }
    .subtitle { color: var(--text-muted); font-size: 1rem; }
    .stat-badge { background: var(--bg-alt); color: var(--primary); padding: 10px 20px; border-radius: 50px; font-weight: 800; font-size: 0.8rem; border: 1px solid var(--border); }

    /* Table Styles */
    .history-table { padding: 0; overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 140px 180px 120px 1fr 100px; padding: 20px 30px; background: var(--bg-alt); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .row { display: grid; grid-template-columns: 140px 180px 120px 1fr 100px; padding: 20px 30px; border-bottom: 1px solid var(--bg-alt); align-items: center; transition: 0.2s; }
    .row:hover { background: rgba(37, 99, 235, 0.02); }

    .col-date .date { display: block; font-weight: 800; font-size: 0.95rem; color: var(--text-main); }
    .col-date .time { font-size: 0.75rem; color: var(--text-muted); }
    .col-result .label { display: block; font-weight: 800; color: var(--primary); font-size: 1rem; }
    .col-result .prob { font-size: 0.8rem; color: var(--text-muted); }
    .status-chip { padding: 6px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; color: white; text-transform: uppercase; display: inline-block; }

    .col-notes { position: relative; }
    textarea { width: 100%; min-height: 48px; padding: 12px; font-size: 0.85rem; border: 1px solid var(--border); border-radius: 10px; background: #fcfdfe; transition: 0.2s; }
    textarea:focus { border-color: var(--primary); background: white; }
    .save-status { position: absolute; right: 10px; bottom: -18px; font-size: 0.65rem; color: var(--primary); font-weight: 800; }

    .col-actions { display: flex; gap: 8px; }
    .btn-icon { background: transparent; border: none; font-size: 1.3rem; color: var(--text-muted); cursor: pointer; transition: 0.2s; padding: 6px; border-radius: 8px; }
    .btn-icon.view:hover { color: var(--primary); background: rgba(37, 99, 235, 0.05); }
    .btn-icon.delete:hover { color: var(--accent); background: #fee2e2; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-content { width: 100%; max-width: 650px; background: white; padding: 0; overflow: hidden; }
    .modal-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: var(--bg-alt); }
    .m-label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
    .modal-header h3 { font-size: 1.2rem; margin-top: 4px; }
    .close-btn { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

    .modal-body { padding: 30px; }
    .report-banner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 1px solid var(--border); text-align: center; }
    .b-label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
    .b-value { font-size: 1.2rem; font-weight: 800; color: var(--text-main); }

    .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .vital-item { padding: 15px; background: var(--bg-alt); border-radius: 12px; text-align: center; border: 1px solid var(--border); }
    .v-label { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
    .v-value { font-size: 0.95rem; font-weight: 800; color: var(--text-main); }
    .v-value small { font-size: 0.7rem; color: var(--text-muted); }

    .report-section { margin-bottom: 25px; }
    .report-section h4 { font-size: 0.9rem; font-weight: 800; color: var(--text-main); margin-bottom: 10px; border-left: 4px solid var(--primary); padding-left: 12px; }
    .report-section p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; }
    
    .diet-flex { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
    .diet-col { padding: 15px; border-radius: 12px; background: #fafbfc; border: 1px solid var(--border); }
    .d-label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
    .recommend .d-label { color: var(--primary); }
    .avoid .d-label { color: var(--accent); }
    .diet-col ul { list-style: none; padding-left: 0; }
    .diet-col li { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .diet-col li::before { content: '•'; font-size: 1.2rem; }

    .routine-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
    .routine-item { padding: 15px; background: #fafbfc; border: 1px solid var(--border); border-radius: 12px; }
    .r-task { display: block; font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 5px; }
    .r-desc { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; line-height: 1.3; }

    .notes-text { padding: 15px; background: #fcfdfe; border-radius: 10px; border: 1px dashed var(--border); }

    .modal-footer { padding: 25px 30px; background: var(--bg-alt); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }

    .loading-state, .empty-state { text-align: center; padding: 100px 40px; margin-top: 50px; }
    .clinical-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .table-header { display: none; }
      .row { grid-template-columns: 1fr; gap: 15px; }
      .vitals-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class HistoryComponent implements OnInit {
  history: any[] = [];
  loading = true;
  selectedItem: any = null;

  constructor(private service: PredictionService) { }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.service.getHistory().subscribe({
      next: (res) => {
        this.history = res.map(item => ({ ...item, saving: false }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewReport(item: any) {
    this.selectedItem = item;
  }

  getVitalsArray(item: any) {
    if (!item || !item.inputs) return [];
    return [
      { key: 'Glucose', val: item.inputs.glucose, unit: 'mg/dL' },
      { key: 'BMI', val: item.inputs.bmi, unit: 'kg/m²' },
      { key: 'Insulin', val: item.inputs.insulin, unit: 'mu U/ml' },
      { key: 'Age', val: item.inputs.age, unit: 'Years' },
      { key: 'BP', val: item.inputs.bloodPressure, unit: 'mmHg' },
      { key: 'Skin', val: item.inputs.skinThickness, unit: 'mm' },
      { key: 'Pregn', val: item.inputs.pregnancies, unit: 'Count' },
      { key: 'DPF', val: item.inputs.dpf, unit: 'Factor' }
    ];
  }

  updateNotes(item: any) {
    if (!item.notes) return;
    item.saving = true;
    this.service.updateNotes(item._id, item.notes).subscribe({
      next: () => {
        setTimeout(() => item.saving = false, 1200);
      },
      error: () => {
        item.saving = false;
        alert('Transmission failed. Record not synchronized.');
      }
    });
  }

  deleteItem(id: string) {
    if (confirm('Delete clinical entry? This will permanently remove the patient data from our records.')) {
      this.service.deletePrediction(id).subscribe({
        next: () => {
          this.history = this.history.filter(h => h._id !== id);
        },
        error: () => {
          alert('Deletion protocol failed.');
        }
      });
    }
  }

  getRiskColor(riskLevel: string) {
    switch (riskLevel) {
      case 'Low': return '#059669';
      case 'Moderate': return '#d97706';
      case 'High': return '#dc2626';
      case 'Very High': return '#991b1b';
      default: return '#3b82f6';
    }
  }

  getDietPlan(item: any) {
    const high = item && item.probability > 40;
    return {
      eat: high ? ['High-Fiber Complex Carbs', 'Omega-3 Rich Proteins', 'Antioxidant Vegetables'] : ['Natural Whole Foods', 'Hydration Management', 'Balanced Macronutrients'],
      avoid: high ? ['High-Glycemic Sugars', 'Saturated Lipid Fats', 'Industrial Sodas'] : ['Processed Preservatives', 'Excess Sodium Intake']
    };
  }

  getDailyRoutine(item: any) {
    const high = item && item.probability > 40;
    return [
      { time: '08:00 AM - Breakfast', desc: high ? 'Steel-cut oats with almonds.' : 'Whole grain toast with egg whites.' },
      { time: '01:00 PM - Lunch', desc: high ? 'Grilled chicken with leafy greens.' : 'Quinoa bowl with mixed legumes.' },
      { time: '07:00 PM - Dinner', desc: high ? 'Steamed fish with broccoli.' : 'Vegetable stir-fry with tofu.' },
      { time: 'Hydration', desc: high ? '3-4 Liters of filtered water.' : 'Regular water with herbal infusions.' }
    ];
  }
}
