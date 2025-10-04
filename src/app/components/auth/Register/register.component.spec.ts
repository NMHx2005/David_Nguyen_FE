import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { TestHelpers } from '../../../testing/test-helpers';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle successful registration', async () => {
        authService.register.and.returnValue(Promise.resolve(true));

        const formData = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(authService.register).toHaveBeenCalledWith(formData);
        expect(snackBar.open).toHaveBeenCalledWith('Registration successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
            queryParams: { registered: 'true' }
        });
    });

    it('should handle registration failure', async () => {
        authService.register.and.returnValue(Promise.resolve(false));

        const formData = {
            username: 'existinguser',
            email: 'existing@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(snackBar.open).toHaveBeenCalledWith(
            'Registration failed. Please try again.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
        );
    });

    it('should handle registration error', async () => {
        authService.register.and.returnValue(Promise.reject(new Error('Network error')));

        const formData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(snackBar.open).toHaveBeenCalledWith(
            'Registration failed. Please try again.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
        );
    });

    it('should navigate to login', () => {
        component.navigateToLogin();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set loading state during registration', async () => {
        authService.register.and.returnValue(new Promise(resolve => setTimeout(() => resolve(true), 100)));

        const formData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        const promise = component.onRegisterSubmit(formData);
        expect(component.isLoading).toBe(true);

        await promise;
        expect(component.isLoading).toBe(false);
    });
});
