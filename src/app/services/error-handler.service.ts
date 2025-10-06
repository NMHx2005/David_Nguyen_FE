import { Injectable, ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';
import { Observable, throwError, timer, retry, retryWhen, mergeMap, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoadingService } from './loading.service';
import { environment } from '../../environments/environment';

export interface ErrorInfo {
    message: string;
    status?: number;
    statusText?: string;
    url?: string;
    timestamp: Date;
    userAgent?: string;
    userId?: string;
    stack?: string;
}

export interface RetryConfig {
    maxRetries: number;
    delay: number;
    backoffMultiplier: number;
    retryCondition?: (error: HttpErrorResponse) => boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);
    private authService = inject(AuthService);

    private errorLog: ErrorInfo[] = [];
    private isOnline = navigator.onLine;

    constructor() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });
    }

    /**
     * Global error handler for unhandled errors
     */
    handleError(error: any): void {
        console.error('Global error:', error);

        // Handle ChunkLoadError specifically
        if (this.isChunkLoadError(error)) {
            this.handleChunkLoadError(error);
            return;
        }

        const errorInfo: ErrorInfo = {
            message: this.getErrorMessage(error),
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            userId: this.authService.getCurrentUser()?.id,
            stack: error.stack
        };

        this.logError(errorInfo);
        this.showUserFriendlyError(errorInfo);
        this.handleErrorRouting(error);
    }

    /**
     * Handle HTTP errors
     */
    handleHttpError(error: HttpErrorResponse): Observable<never> {
        const errorInfo: ErrorInfo = {
            message: this.getHttpErrorMessage(error),
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            userId: this.authService.getCurrentUser()?.id
        };

        this.logError(errorInfo);

        // Handle specific HTTP status codes
        switch (error.status) {
            case 401:
                this.handleUnauthorized();
                break;
            case 403:
                this.handleForbidden();
                break;
            case 404:
                this.handleNotFound();
                break;
            case 500:
                this.handleServerError();
                break;
            case 0:
                this.handleNetworkError();
                break;
            default:
                this.showUserFriendlyError(errorInfo);
        }

        return throwError(() => error);
    }

    /**
     * Check if error is a ChunkLoadError
     */
    private isChunkLoadError(error: any): boolean {
        return error?.name === 'ChunkLoadError' ||
            error?.message?.includes('Loading chunk') ||
            error?.message?.includes('failed');
    }

    /**
     * Handle ChunkLoadError specifically
     */
    private handleChunkLoadError(error: any): void {
        console.warn('ChunkLoadError detected, attempting to reload page:', error);

        // Show user-friendly message
        this.snackBar.open(
            'Application update detected. Reloading page...',
            'Reload Now',
            {
                duration: 5000,
                panelClass: ['info-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
            }
        ).onAction().subscribe(() => {
            this.reloadPage();
        });

        // Auto-reload after 3 seconds
        setTimeout(() => {
            this.reloadPage();
        }, 3000);
    }

    /**
     * Reload the page to fix chunk loading issues
     */
    private reloadPage(): void {
        window.location.reload();
    }

    /**
     * Get user-friendly error message
     */
    private getErrorMessage(error: any): string {
        if (error?.message) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'An unexpected error occurred';
    }

    /**
     * Get HTTP error message
     */
    private getHttpErrorMessage(error: HttpErrorResponse): string {
        if (error.error?.message) {
            return error.error.message;
        }
        if (error.error?.error) {
            return error.error.error;
        }
        if (error.message) {
            return error.message;
        }

        switch (error.status) {
            case 400:
                return 'Bad request. Please check your input.';
            case 401:
                return 'You are not authorized. Please log in again.';
            case 403:
                return 'Access denied. You do not have permission.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'Conflict. The resource already exists.';
            case 422:
                return 'Validation error. Please check your input.';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
                return 'Internal server error. Please try again later.';
            case 502:
                return 'Bad gateway. The server is temporarily unavailable.';
            case 503:
                return 'Service unavailable. Please try again later.';
            case 504:
                return 'Gateway timeout. The request took too long.';
            case 0:
                return 'Network error. Please check your connection.';
            default:
                return `Error ${error.status}: ${error.statusText}`;
        }
    }

    /**
     * Log error for debugging
     */
    private logError(errorInfo: ErrorInfo): void {
        this.errorLog.push(errorInfo);

        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(-100);
        }

        // Log to console in development
        if (!environment.production) {
            console.error('Error logged:', errorInfo);
        }

        // Send to logging service in production
        if (environment.production) {
            this.sendErrorToLoggingService(errorInfo);
        }
    }

    /**
     * Show user-friendly error message
     */
    private showUserFriendlyError(errorInfo: ErrorInfo): void {
        const duration = this.getErrorDuration(errorInfo);
        const action = this.getErrorAction(errorInfo);

        this.snackBar.open(errorInfo.message, action, {
            duration: duration,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
    }

    /**
     * Get error duration based on severity
     */
    private getErrorDuration(errorInfo: ErrorInfo): number {
        if (errorInfo.status === 401 || errorInfo.status === 403) {
            return 5000; // 5 seconds for auth errors
        }
        if (errorInfo.status === 500 || errorInfo.status === 0) {
            return 8000; // 8 seconds for server/network errors
        }
        return 4000; // 4 seconds for other errors
    }

    /**
     * Get error action button
     */
    private getErrorAction(errorInfo: ErrorInfo): string {
        if (errorInfo.status === 401) {
            return 'Login';
        }
        if (errorInfo.status === 403) {
            return 'Go Home';
        }
        if (errorInfo.status === 0) {
            return 'Retry';
        }
        return 'Close';
    }

    /**
     * Handle unauthorized errors
     */
    private async handleUnauthorized(): Promise<void> {
        await this.authService.logout();
        this.router.navigate(['/login']);
        this.snackBar.open('Session expired. Please log in again.', 'Login', {
            duration: 5000,
            panelClass: ['warning-snackbar']
        });
    }

    /**
     * Handle forbidden errors
     */
    private handleForbidden(): void {
        // Don't show snackbar for login errors - let LoginComponent handle it
        const currentUrl = this.router.url;
        if (currentUrl.includes('/login')) {
            return;
        }

        this.router.navigate(['/']);
        this.snackBar.open('Access denied. You do not have permission.', 'Go Home', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    /**
     * Handle not found errors
     */
    private handleNotFound(): void {
        this.router.navigate(['/404']);
        this.snackBar.open('The requested page was not found.', 'Go Home', {
            duration: 4000,
            panelClass: ['warning-snackbar']
        });
    }

    /**
     * Handle server errors
     */
    private handleServerError(): void {
        this.snackBar.open('Server error. Please try again later.', 'Retry', {
            duration: 8000,
            panelClass: ['error-snackbar']
        });
    }

    /**
     * Handle network errors
     */
    private handleNetworkError(): void {
        this.snackBar.open('Network error. Please check your connection.', 'Retry', {
            duration: 8000,
            panelClass: ['error-snackbar']
        });
    }

    /**
     * Handle online status
     */
    private handleOnlineStatus(): void {
        this.snackBar.open('Connection restored!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }

    /**
     * Handle offline status
     */
    private handleOfflineStatus(): void {
        this.snackBar.open('You are offline. Some features may not work.', 'Close', {
            duration: 5000,
            panelClass: ['warning-snackbar']
        });
    }

    /**
     * Handle error routing
     */
    private handleErrorRouting(error: any): void {
        // Route to error page for critical errors
        if (error?.status === 500 || error?.status === 0) {
            this.router.navigate(['/error'], {
                queryParams: {
                    error: error.status,
                    message: this.getErrorMessage(error)
                }
            });
        }
    }

    /**
     * Send error to logging service
     */
    private sendErrorToLoggingService(errorInfo: ErrorInfo): void {
        // In a real application, you would send this to your logging service
        // For now, we'll just store it locally
        try {
            const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errors.push(errorInfo);
            localStorage.setItem('errorLog', JSON.stringify(errors.slice(-50))); // Keep last 50
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    }

    /**
     * Get error log
     */
    getErrorLog(): ErrorInfo[] {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    clearErrorLog(): void {
        this.errorLog = [];
        localStorage.removeItem('errorLog');
    }

    /**
     * Check if online
     */
    isOnlineStatus(): boolean {
        return this.isOnline;
    }

    /**
     * Get retry configuration
     */
    getRetryConfig(): RetryConfig {
        return {
            maxRetries: 3,
            delay: 1000,
            backoffMultiplier: 2,
            retryCondition: (error: HttpErrorResponse) => {
                // Retry for network errors and 5xx server errors
                return error.status === 0 || (error.status >= 500 && error.status < 600);
            }
        };
    }
}

/**
 * HTTP Error Interceptor Function
 */
export function httpErrorInterceptor(): HttpInterceptorFn {
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const errorHandler = inject(ErrorHandlerService);

        return next(req).pipe(
            catchError((error: HttpErrorResponse) => {
                return errorHandler.handleHttpError(error);
            })
        );
    };
}

/**
 * HTTP Retry Interceptor Function
 */
export function httpRetryInterceptor(): HttpInterceptorFn {
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const errorHandler = inject(ErrorHandlerService);
        const config = errorHandler.getRetryConfig();

        return next(req).pipe(
            retryWhen(errors =>
                errors.pipe(
                    mergeMap((error, index) => {
                        const retryAttempt = index + 1;

                        // Check if we should retry
                        if (retryAttempt > config.maxRetries || !config.retryCondition!(error)) {
                            return throwError(() => error);
                        }

                        // Calculate delay with exponential backoff
                        const delay = config.delay * Math.pow(config.backoffMultiplier, retryAttempt - 1);

                        console.log(`Retrying request (${retryAttempt}/${config.maxRetries}) after ${delay}ms`);

                        return timer(delay);
                    })
                )
            ),
            catchError((error: HttpErrorResponse) => {
                return errorHandler.handleHttpError(error);
            })
        );
    };
}

/**
 * Loading Interceptor Function
 */
export function loadingInterceptor(): HttpInterceptorFn {
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const loadingService = inject(LoadingService);

        loadingService.showLoading('Loading...');

        return next(req).pipe(
            finalize(() => {
                loadingService.hideLoading();
            })
        );
    };
}