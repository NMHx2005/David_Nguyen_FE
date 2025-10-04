import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoginRequest, LoginResponse } from '../../../services/api.service';
import { LoginFormComponent, LoginFormData } from './ui/login-form.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        MatSnackBarModule,
        LoginFormComponent
    ],
    template: `
    <app-login-form
      [isLoading]="isLoading"
      [successMessage]="successMessage"
      (onSubmit)="onLoginSubmit($event)"
      (onRegisterClick)="navigateToRegister()"
      (onForgotPasswordClick)="navigateToPasswordReset()">
    </app-login-form>
  `,
    styles: [``]
})
export class LoginComponent implements OnInit, OnDestroy {
    isLoading = false;
    successMessage = '';

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        // Check if user is already authenticated
        if (this.authService.isAuthenticated()) {
            this.redirectToAppropriatePage();
            return;
        }

        // Check for success message from registration
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                if (params['registered'] === 'true') {
                    this.successMessage = 'Registration successful! Please sign in.';
                    // Clear the query parameter
                    this.router.navigate([], {
                        relativeTo: this.route,
                        queryParams: {}
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async onLoginSubmit(formData: LoginFormData): Promise<void> {
        this.isLoading = true;
        this.successMessage = '';

        try {
            const success = await this.authService.login(formData.username, formData.password);

            if (success) {
                this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
                this.redirectToAppropriatePage();
            } else {
                this.snackBar.open('Invalid credentials. Please try again.', 'Close', { duration: 5000 });
            }
        } catch (error) {
            console.error('Login error:', error);
            this.handleLoginError(error);
        } finally {
            this.isLoading = false;
        }
    }

    navigateToRegister(): void {
        this.router.navigate(['/register']);
    }

    navigateToPasswordReset(): void {
        this.router.navigate(['/password-reset']);
    }


    private handleLoginError(error: any): void {
        let errorMessage = 'Login failed. Please try again.';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 401) {
            errorMessage = 'Invalid email or password. Please try again.';
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

        // Check for return URL
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        // Redirect based on user role
        if (this.authService.isSuperAdmin()) {
            this.router.navigate(['/admin']);
        } else if (this.authService.isGroupAdmin()) {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate([returnUrl]);
        }
    }
}
