import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container animate-fade">
      <div class="diagno-card auth-card">
        
        <!-- FORGOT PASSWORD VIEW -->
        <ng-container *ngIf="isForgot">
          <div class="auth-header">
            <div class="logo-circle"><i class="material-icons-outlined">lock_reset</i></div>
            <h2 class="gradient-text">Recover Access</h2>
            <p class="subtitle">Enter your clinical email to receive a recovery link.</p>
          </div>

          <form (submit)="onForgotSubmit()" class="auth-form">
            <div class="input-group">
              <label>Clinical Email Address</label>
              <input type="email" name="email" [(ngModel)]="authData.email" required placeholder="name@example.com">
            </div>
            <button type="submit" class="btn-primary full-width">Send Recovery Link</button>
            <button type="button" class="btn-secondary full-width" (click)="isForgot = false">Back to Login</button>
          </form>
        </ng-container>

        <!-- LOGIN / REGISTER VIEW -->
        <ng-container *ngIf="!isForgot">
          <div class="auth-header">
            <div class="logo-circle"><i class="material-icons-outlined">medical_information</i></div>
            <h2 class="gradient-text">
              {{ isLogin ? 'Clinical Access' : (otpSent ? 'Verify Account' : 'Create Account') }}
            </h2>
            <p class="subtitle">Secure authentication for the Diabetic Research Portal</p>
          </div>

          <!-- Alert/Error Display -->
          <div class="error-alert animate-shake" *ngIf="errorMsg">
            <i class="material-icons-outlined">error_outline</i>
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Google Auth Button (Only shown on login) -->
          <div class="social-auth" *ngIf="isLogin">
            <div id="googleBtn"></div>
            <div class="separator"><span>or continue with email</span></div>
          </div>

          <!-- REGISTRATION FORM / OTP VIEW -->
          <form (submit)="onSubmit()" class="auth-form">
            
            <!-- STEP 1: Registration Form -->
            <ng-container *ngIf="!isLogin && !otpSent">
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" name="name" [(ngModel)]="authData.name" required placeholder="Clinical Identifier">
              </div>
              
              <div class="input-group">
                <label>Email Address</label>
                <input type="email" name="email" [(ngModel)]="authData.email" required placeholder="patient@example.com">
              </div>

              <div class="input-group">
                <label>Mobile Number</label>
                <input type="tel" name="mobileNo" [(ngModel)]="authData.mobileNo" required placeholder="+91 00000 00000">
              </div>

              <div class="input-grid">
                <div class="input-group">
                  <label>Password</label>
                  <input type="password" name="password" [(ngModel)]="authData.password" required placeholder="••••••••">
                </div>
                <div class="input-group">
                  <label>Confirm Password</label>
                  <input type="password" name="confirmPassword" [(ngModel)]="authData.confirmPassword" required placeholder="••••••••">
                </div>
              </div>

              <button type="button" class="btn-primary full-width" (click)="onVerifyAccount()" 
                      [disabled]="!authData.email || !authData.password || loading">
                {{ loading ? 'Processing...' : 'Verify Your Account' }}
              </button>
            </ng-container>

            <!-- STEP 2: OTP Verification -->
            <ng-container *ngIf="!isLogin && otpSent">
              <div class="otp-instruction">
                <p>We've sent a 6-digit code to <strong>{{ authData.email }}</strong></p>
              </div>
              <div class="input-group">
                <label>Enter Verification Code</label>
                <input type="text" name="otp" [(ngModel)]="authData.otp" required 
                       placeholder="000000" maxlength="6" class="otp-input">
              </div>
              <button type="submit" class="btn-primary full-width" [disabled]="loading">
                {{ loading ? 'Verifying...' : 'Finalize Registration' }}
              </button>
              <button type="button" class="btn-secondary full-width" (click)="otpSent = false">Change Details</button>
            </ng-container>

            <!-- LOGIN FORM -->
            <ng-container *ngIf="isLogin">
              <div class="input-group">
                <label>Email Address</label>
                <input type="email" name="email" [(ngModel)]="authData.email" required placeholder="name@example.com">
              </div>

              <div class="input-group">
                <div class="label-flex">
                  <label>Password</label>
                  <a class="forgot-link" (click)="isForgot = true">Forgot Check?</a>
                </div>
                <input type="password" name="password" [(ngModel)]="authData.password" required placeholder="••••••••">
              </div>

              <button type="submit" class="btn-primary full-width" [disabled]="loading">
                <span>{{ loading ? 'Authorizing...' : 'Authorize Access' }}</span>
              </button>
            </ng-container>

          </form>

          <div class="toggle-link" *ngIf="!otpSent">
            {{ isLogin ? "New to the system?" : "Already registered?" }}
            <a (click)="toggleAuthMode()">{{ isLogin ? 'Register Now' : 'Sign In' }}</a>
          </div>
        </ng-container>

      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; background-color: var(--bg-main); }
    .auth-card { width: 100%; max-width: 520px; padding: 40px; border-radius: 20px; box-shadow: var(--shadow-md); background: white; }
    .auth-header { text-align: center; margin-bottom: 25px; }
    .logo-circle { width: 60px; height: 60px; background: rgba(37, 99, 235, 0.05); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 15px; }
    h2 { font-size: 1.8rem; margin-bottom: 5px; font-family: var(--font-title); }
    .subtitle { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px; }

    .error-alert { background: #fef2f2; color: #b91c1c; padding: 12px 15px; border-radius: 10px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 700; border: 1px solid #fee2e2; }
    .error-alert i { font-size: 1.2rem; }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }

    .social-auth { margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; }
    #googleBtn { width: 100%; display: flex; justify-content: center; }
    .separator { width: 100%; text-align: center; border-bottom: 1px solid var(--border); line-height: 0.1em; margin: 20px 0; }
    .separator span { background: #fff; padding: 0 10px; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }

    .role-selector { display: flex; gap: 8px; margin-bottom: 20px; background: var(--bg-alt); padding: 4px; border-radius: 10px; }
    .radio-tab { flex: 1; text-align: center; padding: 8px; cursor: pointer; border-radius: 8px; transition: 0.2s; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; position: relative; }
    .radio-tab.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .radio-tab input { position: absolute; opacity: 0; }
    
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .input-group { margin-bottom: 18px; }
    .label-flex { display: flex; justify-content: space-between; align-items: baseline; }
    label { display: block; margin-bottom: 6px; font-size: 0.75rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; }
    .forgot-link { font-size: 0.7rem; font-weight: 700; color: var(--primary); cursor: pointer; }
    
    .otp-instruction { text-align: center; margin-bottom: 20px; color: var(--text-muted); font-size: 0.9rem; }
    .otp-input { text-align: center; letter-spacing: 10px; font-size: 1.5rem; font-weight: 900; }

    .full-width { width: 100%; height: 50px; font-size: 0.95rem; margin-top: 5px; }
    
    .toggle-link { margin-top: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem; padding-top: 15px; border-top: 1px solid var(--border); }
    .toggle-link a { color: var(--primary); cursor: pointer; font-weight: 800; margin-left: 5px; }
  `]
})
export class AuthComponent implements OnInit {
  isLogin = true;
  isForgot = false;
  otpSent = false;
  loading = false;
  errorMsg = '';
  authData = { 
    name: '', email: '', mobileNo: '', password: '', 
    confirmPassword: '', role: 'user', otp: '' 
  };

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) { }

  ngOnInit() {
    this.initGoogleAuth();
  }

  private initGoogleAuth() {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(interval);
        google.accounts.id.initialize({
          client_id: '857013288806-jvt01uap0q0qjjcoui3nci9je9emvj5d.apps.googleusercontent.com',
          callback: (res: any) => this.handleGoogleLogin(res.credential)
        });
        
        if (this.isLogin) {
          const btnElem = document.getElementById('googleBtn');
          if (btnElem) {
            google.accounts.id.renderButton(btnElem, { theme: 'outline', size: 'large', width: '380' });
          }
        }
      }
    }, 100);
  }

  handleGoogleLogin(token: string) {
    this.loading = true;
    this.http.post<any>('/api/auth/google', { idToken: token }).subscribe({
      next: (res) => {
        this.saveSession(res);
      },
      error: (err) => {
        this.loading = false;
        const statusMsg = err.status === 0 ? 'Connection Refused (Is Backend Running?)' : `Error ${err.status}: ${err.statusText}`;
        this.errorMsg = err.error?.msg || `Google Authorization Failed. (${statusMsg})`;
      }
    });
  }

  onVerifyAccount() {
    this.errorMsg = '';
    
    // Validation
    if (!this.authData.name) { this.errorMsg = 'Full name is required.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.authData.email)) { this.errorMsg = 'Invalid email format.'; return; }
    if (!/^\+?(\d{10,12})$/.test(this.authData.mobileNo.replace(/\s/g, ''))) { this.errorMsg = 'Invalid mobile number (minimum 10 digits).'; return; }
    if (this.authData.password.length < 6) { this.errorMsg = 'Password must be at least 6 characters.'; return; }
    if (this.authData.password !== this.authData.confirmPassword) { this.errorMsg = 'Passwords do not match.'; return; }

    this.loading = true;
    this.http.post<any>('/api/auth/send-otp', { email: this.authData.email }).subscribe({
      next: (res) => {
        this.loading = false;
        this.otpSent = true;
        this.errorMsg = ''; // Clear errors on success
        alert(res.msg);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.msg || "Clinical verification service is currently unavailable.";
        console.error('Verification Error:', err);
      }
    });
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.otpSent = false;
    this.errorMsg = '';
    this.authData = { name: '', email: '', mobileNo: '', password: '', confirmPassword: '', role: 'user', otp: '' };
    if (this.isLogin) {
      setTimeout(() => this.initGoogleAuth(), 0);
    }
  }

  onForgotSubmit() {
    if (!this.authData.email) return;
    this.loading = true;
    this.http.post<any>('/api/auth/forgot-password', { email: this.authData.email }).subscribe({
      next: (res) => {
        this.loading = false;
        alert(res.msg);
        this.isForgot = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.msg || "Recovery process failed.";
      }
    });
  }

  onSubmit() {
    const endpoint = this.isLogin ? 'login' : 'register';
    this.loading = true;
    this.http.post<any>(`/api/auth/${endpoint}`, this.authData).subscribe({
      next: (res) => {
        this.saveSession(res);
      },
      error: (err) => {
        this.loading = false;
        const statusMsg = err.status === 0 ? 'Connection Refused (Is Backend Running?)' : `Error ${err.status}: ${err.statusText}`;
        this.errorMsg = err.error?.msg || `Clinical Authorization Failed. (${statusMsg})`;
      }
    });
  }

  private saveSession(res: any) {
    this.ngZone.run(() => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      if (res.user.role === 'admin' || res.user.role === 'doctor') {
        this.router.navigate(['/wearable']);
      } else {
        this.router.navigate(['/home']);
      }
    });
  }
}
