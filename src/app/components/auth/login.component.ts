import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginFormComponent, LoginFormData } from '../ui/auth/login-form.component';

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
      [showDemoAccounts]="true"
      (onSubmit)="onLoginSubmit($event)"
      (onRegisterClick)="navigateToRegister()">
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
                this.snackBar.open('Login successful!', 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
                this.redirectToAppropriatePage();
            } else {
                this.snackBar.open('Invalid username or password. Please try again.', 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            this.snackBar.open('Login failed. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
            });
        } finally {
            this.isLoading = false;
        }
    }

    navigateToRegister(): void {
        this.router.navigate(['/register']);
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
        if (this.authService.isSuperAdmin() || this.authService.isGroupAdmin()) {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate([returnUrl]);
        }
    }
}
