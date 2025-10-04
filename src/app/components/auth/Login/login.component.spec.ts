import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, User } from '../../../services/auth.service';
import { TestHelpers } from '../../../testing/test-helpers';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;
    let activatedRoute: any;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', [
            'isAuthenticated', 'login', 'getCurrentUser', 'isSuperAdmin'
        ]);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParams: {} } } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        activatedRoute = TestBed.inject(ActivatedRoute);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect if user is already authenticated', () => {
        authService.isAuthenticated.and.returnValue(true);
        authService.getCurrentUser.and.returnValue(TestHelpers.createMockUser());
        authService.isSuperAdmin.and.returnValue(false);

        component.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should show success message when coming from registration', () => {
        authService.isAuthenticated.and.returnValue(false);
        activatedRoute.queryParams = of({ registered: 'true' });

        component.ngOnInit();

        expect(component.successMessage).toBe('Registration successful! Please sign in.');
    });

    it('should navigate to register', () => {
        component.navigateToRegister();
        expect(router.navigate).toHaveBeenCalledWith(['/register']);
    });

    it('should redirect admin users to admin panel', () => {
        authService.isAuthenticated.and.returnValue(true);
        authService.getCurrentUser.and.returnValue(TestHelpers.createMockUser());
        authService.isSuperAdmin.and.returnValue(true);

        component.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle return URL', () => {
        authService.isAuthenticated.and.returnValue(true);
        authService.getCurrentUser.and.returnValue(TestHelpers.createMockUser());
        authService.isSuperAdmin.and.returnValue(false);
        activatedRoute.snapshot.queryParams = { returnUrl: '/groups' };

        component.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(['/groups']);
    });
});
