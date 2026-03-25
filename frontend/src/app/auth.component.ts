import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
            <h2 class="gradient-text">{{ isLogin ? 'Clinical Access' : 'Create Account' }}</h2>
            <p class="subtitle">Secure authentication for the Diabetic Research Portal</p>
          </div>

          <div class="role-selector" *ngIf="!isLogin">
            <label class="radio-tab" [class.active]="authData.role === 'user'">
              <input type="radio" name="role" value="user" [(ngModel)]="authData.role">
              <span>Patient</span>
            </label>
            <label class="radio-tab" [class.active]="authData.role === 'admin'">
              <input type="radio" name="role" value="admin" [(ngModel)]="authData.role">
              <span>Admin</span>
            </label>
          </div>

          <form (submit)="onSubmit()" class="auth-form">
            <div class="input-group" *ngIf="!isLogin">
              <label>Full Name</label>
              <input type="text" name="name" [(ngModel)]="authData.name" required placeholder="Clinical Identifier">
            </div>
            
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" name="email" [(ngModel)]="authData.email" required 
                     [placeholder]="authData.role === 'admin' ? 'admin@example.com' : 'patient@example.com'">
            </div>

            <div class="input-group">
              <div class="label-flex">
                <label>Password</label>
                <a class="forgot-link" *ngIf="isLogin" (click)="isForgot = true">Forgot Check?</a>
              </div>
              <input type="password" name="password" [(ngModel)]="authData.password" required placeholder="••••••••">
            </div>

            <button type="submit" class="btn-primary full-width">
              <span>{{ isLogin ? 'Authorize Access' : 'Register Account' }}</span>
            </button>
          </form>

          <div class="toggle-link">
            {{ isLogin ? "New to the system?" : "Already registered?" }}
            <a (click)="toggleAuthMode()">{{ isLogin ? 'Register Now' : 'Sign In' }}</a>
          </div>
        </ng-container>

      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; background-color: var(--bg-main); }
    .auth-card { width: 100%; max-width: 480px; padding: 60px 50px; border-radius: 20px; box-shadow: var(--shadow-md); background: white; }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .logo-circle { width: 70px; height: 70px; background: rgba(37, 99, 235, 0.05); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 20px; }
    h2 { font-size: 2.2rem; margin-bottom: 8px; font-family: var(--font-title); }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; }

    .role-selector { display: flex; gap: 10px; margin-bottom: 30px; background: var(--bg-alt); padding: 5px; border-radius: 12px; }
    .radio-tab { flex: 1; text-align: center; padding: 10px; cursor: pointer; border-radius: 8px; transition: 0.2s; font-weight: 700; color: var(--text-muted); font-size: 0.9rem; position: relative; }
    .radio-tab.active { background: white; color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .radio-tab input { position: absolute; opacity: 0; }
    
    .input-group { margin-bottom: 20px; }
    .label-flex { display: flex; justify-content: space-between; align-items: baseline; }
    label { display: block; margin-bottom: 8px; font-size: 0.8rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; }
    .forgot-link { font-size: 0.75rem; font-weight: 700; color: var(--primary); cursor: pointer; }
    
    .full-width { width: 100%; height: 52px; font-size: 1rem; margin-top: 15px; }
    
    .toggle-link { margin-top: 30px; text-align: center; color: var(--text-muted); font-size: 0.9rem; padding-top: 20px; border-top: 1px solid var(--border); }
    .toggle-link a { color: var(--primary); cursor: pointer; font-weight: 800; margin-left: 8px; }
    .hint { font-size: 0.7rem; color: var(--primary); font-weight: 700; }
  `]
})
export class AuthComponent {
  isLogin = true;
  isForgot = false;
  authData = { name: '', email: '', password: '', role: 'user' };

  constructor(private http: HttpClient, private router: Router) { }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.authData = { name: '', email: '', password: '', role: 'user' };
  }

  onForgotSubmit() {
    if (!this.authData.email) return;
    this.http.post<any>('/api/auth/forgot-password', { email: this.authData.email }).subscribe({
      next: (res) => {
        alert(res.msg);
        this.isForgot = false;
      },
      error: (err) => {
        alert(err.error?.msg || "Recovery process failed.");
      }
    });
  }

  onSubmit() {
    const endpoint = this.isLogin ? 'login' : 'register';
    this.http.post<any>(`/api/auth/${endpoint}`, this.authData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert(err.error?.msg || "Clinical Authorization Failed");
      }
    });
  }
}
