import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-container animate-fade">

      <!-- Admin / Doctor View -->
      <ng-container *ngIf="isAdminOrDoctor()">
        <div class="page-header">
          <h1 class="gradient-text">Clinical Portfolio Master</h1>
          <p class="text-muted">Index laboratory reports and issue medical guidance to patients.</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-bar">
          <button class="tab-btn" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">
            <i class="material-icons-outlined">folder_shared</i> Medical Records & Reports
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'upload'" (click)="activeTab = 'upload'">
            <i class="material-icons-outlined">upload_file</i> Index New Report
          </button>
        </div>

        <!-- Reports List -->
        <div *ngIf="activeTab === 'reports'">
          <div class="diagno-card" style="padding: 30px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 20px;">All Indexed Clinical Reports</h3>
            <div *ngIf="allReports.length === 0" class="empty-state">
              <i class="material-icons-outlined">folder_open</i>
              <p>No reports indexed yet. Upload a report to get started.</p>
            </div>
            <div *ngFor="let r of allReports" class="report-row">
              <div class="report-meta">
                <span class="report-badge" [class.diagnosed]="r.status === 'diagnosed'">{{ r.status }}</span>
                <strong>{{ r.reportName }}</strong>
                <span class="text-muted"> — {{ r.userId?.name || 'Unknown Patient' }} ({{ r.userId?.email }})</span>
              </div>
              <div class="report-findings" *ngIf="r.findings">
                <small class="text-muted">Findings: {{ r.findings }}</small>
              </div>
              <div *ngIf="r.status === 'pending'" class="diagnose-form">
                <h4>Finalize Diagnosis for {{ r.userId?.name }}</h4>
                <textarea placeholder="Medicines & Dosage..." [(ngModel)]="diagnosisMap[r._id + '_medicines']" rows="2"></textarea>
                <textarea placeholder="Food to Take..." [(ngModel)]="diagnosisMap[r._id + '_foodToTake']" rows="2"></textarea>
                <textarea placeholder="Food to Avoid..." [(ngModel)]="diagnosisMap[r._id + '_foodToAvoid']" rows="2"></textarea>
                <textarea placeholder="Doctor's Notes & Timings..." [(ngModel)]="diagnosisMap[r._id + '_doctorNotes']" rows="2"></textarea>
                <button class="btn-primary" (click)="submitDiagnosis(r._id)">
                  <i class="material-icons-outlined">check_circle</i> Validate & Submit
                </button>
              </div>
              <div *ngIf="r.status === 'diagnosed'" class="diagnosed-view">
                <div class="guidance-chip"><i class="material-icons-outlined">medication</i> <span>{{ r.medicines }}</span></div>
                <div class="guidance-chip eat"><i class="material-icons-outlined">restaurant</i> <span>{{ r.foodToTake }}</span></div>
                <div class="guidance-chip avoid"><i class="material-icons-outlined">no_food</i> <span>{{ r.foodToAvoid }}</span></div>
                <div class="guidance-chip note"><i class="material-icons-outlined">notes</i> <span>{{ r.doctorNotes }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload New Report -->
        <div *ngIf="activeTab === 'upload'" class="diagno-card" style="padding: 40px;">
          <h3 style="margin-bottom: 25px;">Index New Laboratory Report</h3>
          <form (submit)="submitReport()" class="upload-form">
            <div class="field-group">
              <label>Assign to Patient</label>
              <select [(ngModel)]="newReport.userId" name="userId">
                <option value="">-- Select Patient --</option>
                <option *ngFor="let u of allUsers" [value]="u._id">{{ u.name }} ({{ u.email }})</option>
              </select>
            </div>
            <div class="field-group">
              <label>Report Name / Title</label>
              <input type="text" [(ngModel)]="newReport.reportName" name="reportName" placeholder="e.g. HbA1c Blood Panel - March 2025">
            </div>
            <div class="field-group">
              <label>Lab Findings / Summary</label>
              <textarea [(ngModel)]="newReport.findings" name="findings" rows="4" placeholder="Summarize the key findings from the lab report..."></textarea>
            </div>
            <button type="submit" class="btn-primary">
              <i class="material-icons-outlined">publish</i> Index Report
            </button>
          </form>
        </div>
      </ng-container>

      <!-- Patient View -->
      <ng-container *ngIf="!isAdminOrDoctor()">
        <div class="page-header">
          <h1 class="gradient-text">My Clinical Portfolio</h1>
          <p class="text-muted">Your laboratory reports, physician prescriptions and dietary guidance.</p>
        </div>

        <div *ngIf="myReports.length === 0" class="diagno-card empty-state" style="padding: 60px; text-align: center;">
          <i class="material-icons-outlined" style="font-size: 4rem; color: var(--primary); opacity: 0.4;">folder_open</i>
          <h3 style="margin-top: 20px;">No Clinical Reports Yet</h3>
          <p class="text-muted">Your physician will index your laboratory reports here. Please check back after your appointment.</p>
        </div>

        <div *ngFor="let r of myReports" class="diagno-card patient-report-card">
          <div class="report-header-row">
            <span class="report-badge" [class.diagnosed]="r.status === 'diagnosed'">{{ r.status === 'diagnosed' ? '✓ Diagnosed' : 'Pending Review' }}</span>
            <h3>{{ r.reportName }}</h3>
            <small class="text-muted">Indexed on {{ r.createdAt | date:'mediumDate' }}</small>
          </div>

          <div *ngIf="r.findings" class="findings-block">
            <strong>Lab Findings:</strong>
            <p>{{ r.findings }}</p>
          </div>

          <div *ngIf="r.status === 'diagnosed'" class="prescription-grid">
            <div class="rx-block">
              <span class="rx-label"><i class="material-icons-outlined">medication</i> Medicines</span>
              <p>{{ r.medicines }}</p>
            </div>
            <div class="rx-block eat-block">
              <span class="rx-label"><i class="material-icons-outlined">restaurant</i> Food to Take</span>
              <p>{{ r.foodToTake }}</p>
            </div>
            <div class="rx-block avoid-block">
              <span class="rx-label"><i class="material-icons-outlined">no_food</i> Food to Avoid</span>
              <p>{{ r.foodToAvoid }}</p>
            </div>
            <div class="rx-block note-block">
              <span class="rx-label"><i class="material-icons-outlined">notes</i> Doctor's Notes</span>
              <p>{{ r.doctorNotes }}</p>
            </div>
          </div>
        </div>
      </ng-container>

    </div>
  `,
  styles: [`
    .analytics-container { max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 35px; }
    .page-header h1 { font-size: 2.5rem; margin-bottom: 8px; }

    .tab-bar { display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 2px solid var(--border); padding-bottom: 0; }
    .tab-btn { background: none; border: none; padding: 12px 24px; font-size: 0.95rem; font-weight: 700; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 8px; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: 0.2s; }
    .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
    .tab-btn i { font-size: 1.1rem; }

    .report-row { padding: 20px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 15px; }
    .report-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .report-badge { padding: 3px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: #fff3cd; color: #856404; text-transform: uppercase; }
    .report-badge.diagnosed { background: #d1fae5; color: #065f46; }
    .report-findings { margin-bottom: 15px; }

    .diagnose-form { background: var(--bg-alt); padding: 20px; border-radius: 10px; margin-top: 15px; }
    .diagnose-form h4 { margin-bottom: 15px; font-size: 1rem; }
    .diagnose-form textarea { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; resize: vertical; }
    .diagnose-form .btn-primary { height: 44px; padding: 0 24px; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 8px; }

    .diagnosed-view { display: flex; flex-direction: column; gap: 8px; margin-top: 15px; }
    .guidance-chip { display: flex; align-items: flex-start; gap: 10px; padding: 10px 15px; border-radius: 8px; background: #f8fafc; border-left: 4px solid var(--primary); font-size: 0.9rem; }
    .guidance-chip.eat { border-left-color: #10b981; }
    .guidance-chip.avoid { border-left-color: #ef4444; }
    .guidance-chip.note { border-left-color: #f59e0b; }
    .guidance-chip i { font-size: 1.1rem; flex-shrink: 0; margin-top: 2px; }

    .upload-form .field-group { margin-bottom: 20px; }
    .upload-form label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
    .upload-form input, .upload-form select, .upload-form textarea { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; }
    .upload-form .btn-primary { height: 50px; padding: 0 30px; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px; }

    .patient-report-card { padding: 35px; margin-bottom: 25px; }
    .report-header-row { display: flex; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
    .report-header-row h3 { font-size: 1.4rem; margin: 0; }
    .findings-block { background: var(--bg-alt); padding: 15px 20px; border-radius: 10px; margin-bottom: 25px; }
    .findings-block strong { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }

    .prescription-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .rx-block { padding: 20px; border-radius: 12px; background: #f0f9ff; border-left: 5px solid var(--primary); }
    .rx-block.eat-block { background: #f0fdf4; border-left-color: #10b981; }
    .rx-block.avoid-block { background: #fff1f2; border-left-color: #ef4444; }
    .rx-block.note-block { background: #fffbeb; border-left-color: #f59e0b; }
    .rx-label { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 10px; color: var(--text-muted); }
    .rx-block p { font-size: 0.95rem; line-height: 1.6; margin: 0; color: var(--text-main); }

    .empty-state { padding: 60px; text-align: center; }
    .empty-state i { font-size: 4rem; color: var(--primary); opacity: 0.3; display: block; margin-bottom: 15px; }
    .empty-state p { color: var(--text-muted); }

    @media (max-width: 768px) {
      .prescription-grid { grid-template-columns: 1fr; }
      .tab-btn span { display: none; }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  activeTab = 'reports';
  allReports: any[] = [];
  myReports: any[] = [];
  allUsers: any[] = [];
  diagnosisMap: any = {};
  newReport = { userId: '', reportName: '', findings: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.isAdminOrDoctor()) {
      this.loadAllReports();
      this.loadAllUsers();
    } else {
      this.loadMyReports();
    }
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  isAdminOrDoctor() {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const role = JSON.parse(user).role;
    return role === 'admin' || role === 'doctor';
  }

  loadAllReports() {
    this.http.get<any[]>('/api/reports/all', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.allReports = res,
      error: (err) => console.error('Error loading reports', err)
    });
  }

  loadMyReports() {
    this.http.get<any[]>('/api/reports/my', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.myReports = res,
      error: (err) => console.error('Error loading my reports', err)
    });
  }

  loadAllUsers() {
    this.http.get<any[]>('/api/auth/users', { headers: this.getHeaders() }).subscribe({
      next: (res) => this.allUsers = res,
      error: (err) => console.error('Error loading users', err)
    });
  }

  submitReport() {
    if (!this.newReport.userId || !this.newReport.reportName) {
      alert('Please select a patient and enter a report name.');
      return;
    }
    this.http.post('/api/reports/upload', this.newReport, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert('Report indexed successfully!');
        this.newReport = { userId: '', reportName: '', findings: '' };
        this.activeTab = 'reports';
        this.loadAllReports();
      },
      error: (err) => alert(err.error?.msg || 'Failed to index report.')
    });
  }

  submitDiagnosis(reportId: string) {
    const payload = {
      medicines: this.diagnosisMap[reportId + '_medicines'] || '',
      foodToTake: this.diagnosisMap[reportId + '_foodToTake'] || '',
      foodToAvoid: this.diagnosisMap[reportId + '_foodToAvoid'] || '',
      doctorNotes: this.diagnosisMap[reportId + '_doctorNotes'] || ''
    };
    this.http.put(`/api/reports/${reportId}/diagnose`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert('Diagnosis finalized and saved to patient portfolio!');
        this.loadAllReports();
      },
      error: (err) => alert(err.error?.msg || 'Failed to submit diagnosis.')
    });
  }
}
