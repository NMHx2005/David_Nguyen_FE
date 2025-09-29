import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="register-form-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join our chat community</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onFormSubmit()" class="register-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput 
                     formControlName="username" 
                     placeholder="Enter username"
                     [class.error]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
                Username must be at least 3 characters
              </mat-error>
              <mat-error *ngIf="registerForm.get('username')?.hasError('pattern')">
                Username can only contain letters, numbers, and underscores
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput 
                     type="email" 
                     formControlName="email" 
                     placeholder="Enter your email"
                     [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput 
                     type="password" 
                     formControlName="password" 
                     placeholder="Create a password"
                     [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput 
                     type="password" 
                     formControlName="confirmPassword" 
                     placeholder="Confirm your password"
                     [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="registerForm.invalid || isLoading"
                      class="register-button">
                <mat-icon *ngIf="!isLoading">person_add</mat-icon>
                <mat-icon *ngIf="isLoading" class="spinning">refresh</mat-icon>
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>
          </form>

          <div class="auth-links">
            <p>Already have an account? 
              <button mat-button color="primary" (click)="onLoginClick.emit()">
                Sign in here
              </button>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .register-card {
      width: 100%;
      max-width: 450px;
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

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 24px;
    }

    .register-button {
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
      .register-form-container {
        padding: 10px;
      }
    }
  `]
})
export class RegisterFormComponent implements OnInit {
  @Input() isLoading = false;

  @Output() onSubmit = new EventEmitter<RegisterFormData>();
  @Output() onLoginClick = new EventEmitter<void>();

  registerForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onFormSubmit(): void {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      // Remove confirmPassword from the data
      const { confirmPassword, ...registrationData } = formData;
      this.onSubmit.emit(registrationData as RegisterFormData);
    }
  }
}

