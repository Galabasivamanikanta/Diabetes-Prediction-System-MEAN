import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthBridgeService } from './health-bridge.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="glass-card profile-card">
        <div class="profile-header">
          <div class="avatar-circle">
            {{ user.name?.charAt(0) || 'P' }}
          </div>
          <div class="header-info">
            <h2 class="gradient-text">{{ user.name }}</h2>
            <p class="subtitle">Patient Profile #{{ user._id?.slice(-6) }}</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="label">Email</span>
            <span class="value">{{ user.email }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Account Created</span>
            <span class="value">{{ user.createdAt | date:'mediumDate' }}</span>
          </div>
        </div>

        <div class="biodata-section">
          <h3>Personal Health Metrics</h3>
          <p class="section-desc">Keep your base metrics updated for more accurate long-term analysis.</p>
          <div class="input-grid">
            <div class="input-group">
              <label>Age (Years)</label>
              <input type="number" [(ngModel)]="biodata.age" placeholder="e.g. 33">
            </div>
            <div class="input-group">
              <label>Weight (kg)</label>
              <input type="number" [(ngModel)]="biodata.weight" placeholder="e.g. 70">
            </div>
            <div class="input-group">
              <label>Height (cm)</label>
              <input type="number" [(ngModel)]="biodata.height" placeholder="e.g. 175">
            </div>
            <div class="input-group">
              <label>Blood Group</label>
              <select [(ngModel)]="biodata.bloodGroup">
                <option value="">Select</option>
                <option *ngFor="let group of bloodGroups" [value]="group">{{ group }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Chronic History</label>
              <select [(ngModel)]="biodata.chronicHistory">
                <option value="None">None</option>
                <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                <option value="Hypertension">Hypertension</option>
              </select>
            </div>
          </div>
          <button class="btn-primary" (click)="saveProfile()" [disabled]="loading">
            {{ loading ? 'Updating...' : 'Update Health Profile' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
    .profile-card { padding: 40px; margin-bottom: 30px; }
    .profile-header { display: flex; align-items: center; gap: 25px; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #e2e8f0; }
    .avatar-circle { width: 80px; height: 80px; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
    .stat-item .label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
    .stat-item .value { font-size: 1.1rem; font-weight: 600; }
    .biodata-section h3 { font-size: 1.25rem; }
    .section-desc { color: #64748b; font-size: 0.9rem; margin-bottom: 30px; }
    .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    label { display: block; margin-bottom: 8px; font-size: 0.85rem; color: #64748b; }
    .btn-primary { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = {};
  biodata = { weight: 70, height: 175, age: 33, bloodGroup: 'O+', chronicHistory: 'None' };
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  loading = false;

  constructor(private healthService: HealthBridgeService) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.healthService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        if (res.weight) {
          this.biodata = {
            weight: res.weight,
            height: res.height,
            age: res.age || 33,
            bloodGroup: res.bloodGroup || 'O+',
            chronicHistory: res.chronicHistory || 'None'
          };
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  saveProfile() {
    this.loading = true;
    this.healthService.updateProfile(this.biodata).subscribe({
      next: (res) => {
        this.user = res;
        alert('Medical Profile securely synced to cloud!');
        this.loading = false;
      },
      error: () => {
        alert('Failed to update profile.');
        this.loading = false;
      }
    });
  }
}
