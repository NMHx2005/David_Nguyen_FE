import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-password-reset',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    template: `
    <div class="password-reset-container">
        <mat-card class="password-reset-card">
            <mat-card-header>
                <mat-card-title>
                    <mat-icon>lock_reset</mat-icon>
                    Reset Password
                </mat-card-title>
                <mat-card-subtitle>
                    Enter your email address and we'll send you a link to reset your password.
                </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
                <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!emailSent">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Email Address</mat-label>
                        <input matInput 
                               type="email" 
                               formControlName="email"
                               placeholder="Enter your email address"
                               autocomplete="email">
                        <mat-icon matSuffix>email</mat-icon>
                        <mat-error *ngIf="resetForm.get('email')?.hasError('required')">
                            Email is required
                        </mat-error>
                        <mat-error *ngIf="resetForm.get('email')?.hasError('email')">
                            Please enter a valid email address
                        </mat-error>
                    </mat-form-field>

                    <div class="form-actions">
                        <button mat-raised-button 
                                color="primary" 
                                type="submit"
                                [disabled]="resetForm.invalid || isLoading"
                                class="full-width">
                            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                            <span *ngIf="!isLoading">Send Reset Link</span>
                        </button>

                        <button mat-button 
                                type="button"
                                (click)="navigateToLogin()"
                                class="full-width">
                            <mat-icon>arrow_back</mat-icon>
                            Back to Login
                        </button>
                    </div>
                </form>

                <div *ngIf="emailSent" class="success-message">
                    <mat-icon class="success-icon">check_circle</mat-icon>
                    <h3>Reset Link Sent!</h3>
                    <p>We've sent a password reset link to <strong>{{ resetForm.get('email')?.value }}</strong></p>
                    <p>Please check your email and follow the instructions to reset your password.</p>
                    
                    <div class="success-actions">
                        <button mat-raised-button 
                                color="primary"
                                (click)="resendEmail()"
                                [disabled]="isLoading">
                            <mat-icon>refresh</mat-icon>
                            Resend Email
                        </button>
                        
                        <button mat-button 
                                (click)="navigateToLogin()">
                            <mat-icon>arrow_back</mat-icon>
                            Back to Login
                        </button>
                    </div>
                </div>
            </mat-card-content>
        </mat-card>
    </div>
    `,
    styles: [`
    .password-reset-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .password-reset-card {
        width: 100%;
        max-width: 400px;
        padding: 0;
    }

    .password-reset-card mat-card-header {
        text-align: center;
        padding: 24px 24px 0 24px;
    }

    .password-reset-card mat-card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 24px;
        font-weight: 500;
        color: #333;
    }

    .password-reset-card mat-card-subtitle {
        text-align: center;
        color: #666;
        margin-top: 8px;
    }

    .password-reset-card mat-card-content {
        padding: 24px;
    }

    .full-width {
        width: 100%;
        margin-bottom: 16px;
    }

    .form-actions {
        margin-top: 24px;
    }

    .form-actions button {
        margin-bottom: 12px;
    }

    .success-message {
        text-align: center;
        padding: 20px 0;
    }

    .success-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #4caf50;
        margin-bottom: 16px;
    }

    .success-message h3 {
        color: #333;
        margin-bottom: 16px;
    }

    .success-message p {
        color: #666;
        margin-bottom: 12px;
        line-height: 1.5;
    }

    .success-actions {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .success-actions button {
        width: 100%;
    }

    mat-spinner {
        margin-right: 8px;
    }
    `]
})
export class PasswordResetComponent implements OnInit, OnDestroy {
    resetForm: FormGroup;
    isLoading = false;
    emailSent = false;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.resetForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit(): void {
        // Check if user is already authenticated
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/home']);
            return;
        }

        // Check for email parameter from URL
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                if (params['email']) {
                    this.resetForm.patchValue({ email: params['email'] });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.resetForm.invalid) {
            return;
        }

        this.isLoading = true;
        const email = this.resetForm.get('email')?.value;

        this.authService.forgotPassword(email)
            .pipe(
                takeUntil(this.destroy$),
                catchError(error => {
                    console.error('Password reset error:', error);
                    this.handleResetError(error);
                    throw error;
                }),
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (response) => {
                    this.handleResetSuccess();
                },
                error: (error) => {
                    // Error already handled in catchError
                }
            });
    }

    resendEmail(): void {
        this.emailSent = false;
        this.onSubmit();
    }

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }

    private handleResetSuccess(): void {
        this.emailSent = true;
        this.snackBar.open('Password reset link sent successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
        });
    }

    private handleResetError(error: any): void {
        let errorMessage = 'Failed to send reset link. Please try again.';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 404) {
            errorMessage = 'Email address not found. Please check your email or register for a new account.';
        } else if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
        }

        this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }
}
