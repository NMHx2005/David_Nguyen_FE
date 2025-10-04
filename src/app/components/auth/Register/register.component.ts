import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '../auth.service';
import { RegisterRequest, LoginResponse } from '../../../services/api.service';
import { RegisterFormComponent, RegisterFormData } from './ui/register-form.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        MatSnackBarModule,
        RegisterFormComponent
    ],
    template: `
    <app-register-form
      [isLoading]="isLoading"
      (onSubmit)="onRegisterSubmit($event)"
      (onLoginClick)="navigateToLogin()">
    </app-register-form>
  `,
    styles: [``]
})
export class RegisterComponent implements OnInit, OnDestroy {
    isLoading = false;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        // Check if user is already authenticated
        if (this.authService.isAuthenticated()) {
            this.redirectToAppropriatePage();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async onRegisterSubmit(formData: RegisterFormData): Promise<void> {
        this.isLoading = true;

        try {
            const success = await this.authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (success) {
                this.snackBar.open('Registration successful! Please sign in.', 'Close', {
                    duration: 5000,
                    panelClass: ['success-snackbar']
                });

                // Redirect to login with success message
                this.router.navigate(['/login'], {
                    queryParams: { registered: 'true' }
                });
            } else {
                this.snackBar.open('Registration failed. Please try again.', 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.handleRegistrationError(error);
        } finally {
            this.isLoading = false;
        }
    }

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }


    private handleRegistrationError(error: any): void {
        let errorMessage = 'Registration failed. Please try again.';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 409) {
            errorMessage = 'Username or email already exists. Please try a different one.';
        } else if (error.status === 400) {
            errorMessage = 'Invalid registration data. Please check your input.';
        } else if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
        }

        this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    private redirectToAppropriatePage(): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            this.router.navigate(['/home']);
            return;
        }

        // Redirect based on user role
        if (this.authService.isSuperAdmin()) {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate(['/home']);
        }
    }
}
