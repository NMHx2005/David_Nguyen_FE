import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

export interface LoginFormData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  template: `
    <div class="login-form-container">
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

          <form [formGroup]="loginForm" (ngSubmit)="onFormSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput 
                     formControlName="username" 
                     placeholder="Enter your username"
                     [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput 
                     type="password" 
                     formControlName="password" 
                     placeholder="Enter your password"
                     [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="forgot-password">
              <button mat-button 
                      type="button"
                      (click)="onForgotPasswordClick.emit()"
                      class="forgot-password-link">
                <mat-icon>help</mat-icon>
                Forgot Password?
              </button>
            </div>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="loginForm.invalid || isLoading"
                      class="login-button">
                <mat-icon *ngIf="!isLoading">login</mat-icon>
                <mat-icon *ngIf="isLoading" class="spinning">refresh</mat-icon>
                {{ isLoading ? 'Signing In...' : 'Sign In' }}
              </button>
            </div>
          </form>


          <div class="auth-links">
            <p>Don't have an account? 
              <button mat-button color="primary" (click)="onRegisterClick.emit()">
                Sign up here
              </button>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .mat-card-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .mat-card-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
    }

    .mat-card-subtitle {
      color: #666;
      margin-top: 8px;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 4px;
      color: #2e7d32;
      margin-bottom: 20px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .forgot-password {
      text-align: right;
      margin-bottom: 16px;
    }

    .forgot-password-link {
      color: #1976d2;
      font-size: 0.875rem;
    }

    .forgot-password-link:hover {
      background-color: rgba(25, 118, 210, 0.04);
    }

    .form-actions {
      margin-top: 24px;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 1rem;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }


    .auth-links {
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .auth-links p {
      margin: 0;
      color: #666;
    }

    .error {
      border-color: #f44336 !important;
    }

    @media (max-width: 480px) {
      .login-form-container {
        padding: 10px;
      }

    }
  `]
})
export class LoginFormComponent implements OnInit {
  @Input() isLoading = false;
  @Input() successMessage = '';

  @Output() onSubmit = new EventEmitter<LoginFormData>();
  @Output() onRegisterClick = new EventEmitter<void>();
  @Output() onForgotPasswordClick = new EventEmitter<void>();

  loginForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onFormSubmit(): void {
    if (this.loginForm.valid) {
      this.onSubmit.emit(this.loginForm.value);
    }
  }

}

