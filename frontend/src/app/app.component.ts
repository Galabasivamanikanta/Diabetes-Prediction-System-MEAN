import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  template: `
    <div class="app-layout" [class.no-nav]="!showNav()">
      <!-- Clinical Healthcare Header -->
      <nav class="navbar animate-fade" *ngIf="showNav()">
        <div class="nav-content">
          <div class="logo-box" routerLink="/home">
            <div class="logo-circle"><i class="material-icons-outlined">biotech</i></div>
            <span class="logo-text">Diabetes Prediction System</span>
          </div>

          <div class="nav-links">
            <a routerLink="/home" routerLinkActive="active">Home</a>
            <a routerLink="/predict" routerLinkActive="active">Diagnostics</a>
            <a routerLink="/history" routerLinkActive="active">Records</a>
            <a routerLink="/analytics" routerLinkActive="active" *ngIf="isAdminOrDoctor()">Admin Board</a>
          </div>

          <div class="nav-user">
             <!-- Notification Bell -->
             <div class="notif-box">
                <button class="icon-btn-plain" (click)="toggleNotifications()">
                  <i class="material-icons-outlined">notifications</i>
                  <span class="bad-dot" *ngIf="notificationCount > 0"></span>
                </button>
                
                <div class="diagno-card notif-pop animate-fade" *ngIf="toggleNotif">
                  <div class="notif-head">Recent Clinical Alerts</div>
                  <div class="notif-body">
                    <div class="notif-item" *ngFor="let n of notifications">
                      <p>{{ n.message }}</p>
                      <span>{{ n.createdAt | date:'shortTime' }}</span>
                    </div>
                    <div class="empty-notif" *ngIf="notifications.length === 0">No notifications found.</div>
                  </div>
                  <div class="notif-footer">
                     <button class="btn-primary mini" (click)="toggleComposerModal = true; toggleNotif = false">
                       <i class="material-icons-outlined">medical_services</i> {{ isAdmin() ? 'Medical Guidance Dispatch' : 'Request Doctor Consultation' }}
                     </button>
                  </div>
                </div>
             </div>

             <!-- User Identity -->
             <div class="user-trigger" (click)="toggleMenu = !toggleMenu">
                <div class="u-text">
                  <span class="u-name">{{ getUserName() }}</span>
                  <span class="u-role">{{ getUserRole() === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'PATIENT PROFILE' }}</span>
                </div>
                <div class="u-avatar">{{ getUserName().charAt(0).toUpperCase() }}</div>
                
                <div class="diagno-card dropdown animate-fade" *ngIf="toggleMenu">
                  <a routerLink="/profile" (click)="toggleMenu = false"><i class="material-icons-outlined">account_circle</i> Profile</a>
                  <a routerLink="/wellness" (click)="toggleMenu = false"><i class="material-icons-outlined">health_and_safety</i> Wellness</a>
                  <hr class="divider">
                  <button (click)="logout()" class="logout-btn"><i class="material-icons-outlined">logout</i> Sign Out</button>
                </div>
             </div>
          </div>
        </div>
      </nav>

      <main class="content-container">
        <router-outlet></router-outlet>
      </main>

      <footer class="clinical-footer" *ngIf="showNav()">
         <div class="footer-wrap">
            <p>Specialized Diabetic Analytics & Laboratory Portal © {{ currentYear }}</p>
            <div class="footer-tags">
               <span>HIPAA Compliant</span>
               <span>Clinical Intelligence v5.0</span>
            </div>
         </div>
      </footer>

      <!-- COMMUNICATION COMPOSER MODAL -->
      <div class="modal-overlay animate-fade" *ngIf="toggleComposerModal" (click)="toggleComposerModal = false">
        <div class="modal-content diagno-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isAdmin() ? 'Medical Guidance Broadcast' : 'Clinical Consultation Request' }}</h3>
            <button class="close-btn" (click)="toggleComposerModal = false"><i class="material-icons-outlined">close</i></button>
          </div>
          <div class="modal-body">
            <p class="instr text-muted">{{ isAdmin() ? 'Broadcast specialized medical guidelines or clinical content to the global patient dashboard.' : 'Initiate a direct request to connect with a clinical specialist for biomass review.' }}</p>
            
            <div class="input-group">
              <label>Communication Content</label>
              <textarea placeholder="Type your professional content here..." [(ngModel)]="composerMsg"></textarea>
            </div>
            
            <div class="input-group">
              <label>Intensity Level</label>
              <select [(ngModel)]="composerType">
                <option value="alert">🚨 High Alert (Immediate Action)</option>
                <option value="update">📋 Medical Resource</option>
                <option value="request">💬 Request Doctor Contact</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="toggleComposerModal = false">Archive</button>
            <button class="btn-primary" (click)="$event.stopPropagation(); sendManualNotification()" [disabled]="!composerMsg">
              <i class="material-icons-outlined">send</i> {{ isAdmin() ? 'Broadcast Medical Guidance' : 'Request Doctor Contact' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { min-height: 100vh; background: var(--bg-main); display: flex; flex-direction: column; }
    .no-nav .content-container { padding: 0; }

    .navbar { height: 90px; border-bottom: 1px solid var(--border); background: white; position: sticky; top: 0; z-index: 1000; display: flex; align-items: center; padding: 0 40px; }
    .nav-content { width: 100%; max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    
    .logo-box { display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 1.5rem; font-weight: 800; color: var(--text-main); font-family: var(--font-title); }
    .logo-circle { width: 44px; height: 44px; border-radius: 12px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .text-blue { color: var(--primary); }

    .nav-links { display: flex; gap: 30px; }
    .nav-links a { text-decoration: none; font-weight: 700; color: var(--text-muted); font-size: 1rem; transition: 0.2s; padding: 8px 12px; border-radius: 10px; }
    .nav-links a.active { color: var(--primary); background: rgba(37, 99, 235, 0.05); }
    .nav-links a:hover { color: var(--primary); background: rgba(37, 99, 235, 0.03); }

    .nav-user { display: flex; align-items: center; gap: 20px; position: relative; }
    .user-trigger { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px 12px; border-radius: 14px; position: relative; }
    .u-text { text-align: right; }
    .u-name { display: block; font-weight: 800; font-size: 0.95rem; color: var(--text-main); }
    .u-role { font-size: 0.7rem; font-weight: 800; color: var(--primary); }
    .u-avatar { width: 44px; height: 44px; border-radius: 50%; background: #e0f2fe; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }

    .dropdown { position: absolute; top: 110%; right: 0; width: 220px; padding: 10px; box-shadow: var(--shadow-md); z-index: 2000; }
    .dropdown a, .logout-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 700; border-radius: 10px; width: 100%; border: none; background: transparent; cursor: pointer; }
    .dropdown a:hover { background: var(--bg-alt); color: var(--primary); }
    .logout-btn:hover { background: #fee2e2; color: var(--accent); }
    .divider { border: 0; border-top: 1px solid var(--border); margin: 6px 0; }

    .icon-btn-plain { background: transparent; border: none; font-size: 1.7rem; color: var(--text-muted); cursor: pointer; position: relative; display: flex; align-items: center; }
    .icon-btn-plain:hover { color: var(--primary); }
    .bad-dot { position: absolute; top: 2px; right: 2px; width: 10px; height: 10px; background: var(--accent); border-radius: 50%; border: 2px solid white; }
    
    .notif-pop { position: absolute; top: 110%; right: 0; width: 320px; padding: 0; overflow: hidden; box-shadow: var(--shadow-md); z-index: 2000; }
    .notif-head { padding: 18px; background: var(--bg-alt); font-weight: 800; color: var(--text-main); font-size: 0.9rem; }
    .notif-item { padding: 15px 20px; border-bottom: 1px solid var(--border); }
    .notif-item p { font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
    .notif-item span { font-size: 0.75rem; color: var(--text-muted); }
    .empty-notif { padding: 30px; text-align: center; font-size: 0.9rem; color: var(--text-muted); }
    .notif-footer { padding: 15px; text-align: center; border-top: 1px solid var(--border); }
    .btn-primary.mini { width: 100%; height: 40px; font-size: 0.8rem; border-radius: 10px; }

    .content-container { flex: 1; padding: 40px; max-width: 1400px; width: 100%; margin: 0 auto; }
    
    .clinical-footer { padding: 40px; border-top: 1px solid var(--border); background: white; }
    .footer-wrap { display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; color: var(--text-muted); font-size: 0.9rem; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
    .modal-content { width: 100%; max-width: 500px; padding: 0; background: white; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md); }
    .modal-header { padding: 25px 30px; background: var(--bg-alt); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 800; }
    .modal-body { padding: 30px; }
    .instr { font-size: 0.85rem; margin-bottom: 25px; line-height: 1.5; }
    
    .input-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 10px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--text-main); }
    textarea { width: 100%; height: 120px; border: 1px solid var(--border); border-radius: 10px; padding: 15px; font-size: 0.95rem; resize: none; background: var(--bg-main); transition: 0.2s; }
    textarea:focus { background: white; border-color: var(--primary); outline: none; }
    select { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: white; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
    
    .modal-footer { padding: 20px 30px; background: var(--bg-alt); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 15px; }
    .close-btn { background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
  `]
})
export class AppComponent implements OnInit {
  currentYear = new Date().getFullYear();
  toggleMenu = false;
  toggleNotif = false;
  toggleComposerModal = false;
  notificationCount = 0;
  notifications: any[] = [];

  composerMsg: string = '';
  composerType: string = 'request';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.toggleMenu = false;
      this.toggleNotif = false;
      this.fetchNotifications();
    });
    this.fetchNotifications();
  }

  fetchNotifications() {
    if (!localStorage.getItem('token')) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
    this.http.get<any[]>('/api/notifications', { headers }).subscribe({
      next: (res) => {
        this.notifications = res;
        this.notificationCount = res.filter(n => !n.isRead).length;
      },
      error: () => {}
    });
  }

  toggleNotifications() {
    this.toggleNotif = !this.toggleNotif;
    if (this.toggleNotif) {
      this.fetchNotifications();
      // Mark all as read when opened
      this.notifications.forEach(n => {
        if (!n.isRead) this.markRead(n._id);
      });
    }
  }

  markRead(id: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
    this.http.put(`/api/notifications/${id}/read`, {}, { headers }).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n._id === id);
        if (notif) notif.isRead = true;
        this.notificationCount = this.notifications.filter(n => !n.isRead).length;
      }
    });
  }

  isAdminOrDoctor() {
    const userString = localStorage.getItem('user');
    if (!userString) return false;
    try {
      const role = JSON.parse(userString).role;
      return role === 'admin' || role === 'doctor';
    } catch { return false; }
  }

  isAdmin() {
     const user = localStorage.getItem('user');
     return user ? JSON.parse(user).role === 'admin' : false;
  }

  sendManualNotification() {
     if (!this.composerMsg) return;
     const user = JSON.parse(localStorage.getItem('user') || '{}');
     const payload = {
        message: this.composerMsg,
        type: this.composerType,
        user: user.id
     };

     const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
     this.http.post('/api/notifications', payload, { headers }).subscribe({
        next: () => {
           alert(this.isAdmin() ? 'Clinical System Alert Dispatched!' : 'Clinical Request Posted Successfully.');
           this.composerMsg = '';
           this.toggleComposerModal = false;
           this.fetchNotifications();
        },
        error: () => alert('Failed to transmit communication.')
     });
  }

  showNav() {
    return !['/login', '/register', ''].includes(this.router.url);
  }

  getUserName() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).name : 'Patient';
  }

  getUserRole() {
    const user = localStorage.getItem('user');
    if (!user) return 'user';
    try {
      return JSON.parse(user).role || 'user';
    } catch { return 'user'; }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
