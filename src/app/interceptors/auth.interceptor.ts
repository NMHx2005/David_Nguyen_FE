import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../components/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    // Clone request and add authorization header if token exists
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expired or invalid
                authService.logout().then(() => {
                    router.navigate(['/login']);
                }).catch(() => {
                    router.navigate(['/login']);
                });
            }
            return throwError(() => error);
        })
    );
};
