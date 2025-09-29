import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="successMessage" class="success-message">
            <mat-icon color="primary">check_circle</mat-icon>
            {{ successMessage }}
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter your username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Enter your password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              <mat-icon color="warn">error</mat-icon>
              {{ errorMessage }}
            </div>

            <button mat-raised-button color="primary" type="submit" class="btn-login"
              [disabled]="loginForm.invalid || isSubmitting">
              <mat-icon>login</mat-icon>
              {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <div class="demo-accounts">
            <h3>Demo Accounts</h3>
            <mat-grid-list cols="3" rowHeight="100px" gutterSize="16px">
              <mat-grid-tile>
                <div class="demo-account" (click)="useDemoAccount('super', '123')">
                  <span class="demo-role">Super Admin</span>
                  <span class="demo-credentials">super / 123</span>
                </div>
              </mat-grid-tile>
              <mat-grid-tile>
                <div class="demo-account" (click)="useDemoAccount('admin', '123')">
                  <span class="demo-role">Group Admin</span>
                  <span class="demo-credentials">admin / 123</span>
                </div>
              </mat-grid-tile>
              <mat-grid-tile>
                <div class="demo-account" (click)="useDemoAccount('user', '123')">
                  <span class="demo-role">User</span>
                  <span class="demo-credentials">user / 123</span>
                </div>
              </mat-grid-tile>
            </mat-grid-list>
          </div>

          <div class="register-link">
            Don't have an account?
            <a routerLink="/register" class="link">Create one here</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
    }

    .login-card {
      max-width: 450px;
      width: 100%;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      animation: slideUp 0.6s ease-out;
      background: white;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 2rem;
      font-weight: 500;
      color: #333;
    }

    mat-card-subtitle {
      font-size: 1rem;
      color: #666;
      opacity: 0.9;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #e8f5e8;
      color: #2e7d32;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 16px;
      text-align: center;
    }

    .btn-login {
      width: 100%;
      padding: 12px;
      font-size: 1.1rem;
      font-weight: 500;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    .btn-login:disabled {
      background: #95a5a6 !important;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .demo-accounts {
      margin-top: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .demo-accounts h3 {
      color: #333;
      font-size: 1.1rem;
      text-align: center;
      margin: 0 0 16px 0;
    }

    .demo-account {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
      text-align: center;
    }

    .demo-account:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .demo-account:hover .demo-role,
    .demo-account:hover .demo-credentials {
      color: white;
    }

    .demo-role {
      font-weight: 500;
      font-size: 0.9rem;
      color: #333;
    }

    .demo-credentials {
      font-family: monospace;
      font-size: 0.85rem;
      color: #666;
      opacity: 0.8;
    }

    .register-link {
      text-align: center;
      margin-top: 16px;
      color: #666;
      font-size: 0.9rem;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .link:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .login-container {
        padding: 16px;
      }

      .login-card {
        padding: 16px;
      }

      mat-card-title {
        font-size: 1.8rem;
      }

      mat-grid-list {
        grid-template-columns: 1fr !important;
      }

      .demo-account {
        padding: 16px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const success = await this.authService.login(
        this.loginForm.value.username!,
        this.loginForm.value.password!
      );

      if (success) {
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = 'Invalid username or password. Please try again.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred during login. Please try again.';
      console.error('Login error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  useDemoAccount(username: string, password: string): void {
    this.loginForm.setValue({ username, password });
    this.onSubmit();
  }
}