import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@Component({
    selector: 'app-error-page',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
    ],
    template: `
    <div class="error-page-container">
      <div class="error-content">
        <mat-card class="error-card">
          <mat-card-content>
            <div class="error-icon">
              <mat-icon [class]="'error-icon-' + errorType">{{ getErrorIcon() }}</mat-icon>
            </div>
            
            <div class="error-title">
              {{ getErrorTitle() }}
            </div>
            
            <div class="error-message">
              {{ errorMessage }}
            </div>
            
            <div class="error-details" *ngIf="errorDetails">
              <h4>Error Details:</h4>
              <div class="error-detail-item">
                <strong>Status:</strong> {{ errorStatus }}
              </div>
              <div class="error-detail-item" *ngIf="errorTimestamp">
                <strong>Time:</strong> {{ errorTimestamp | date:'medium' }}
              </div>
              <div class="error-detail-item" *ngIf="errorUrl">
                <strong>URL:</strong> {{ errorUrl }}
              </div>
            </div>
            
            <div class="error-actions">
              <button mat-raised-button color="primary" (click)="goHome()">
                <mat-icon>home</mat-icon>
                Go Home
              </button>
              
              <button mat-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
                Go Back
              </button>
              
              <button mat-button (click)="retry()" *ngIf="canRetry">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
              
              <button mat-button (click)="reportError()">
                <mat-icon>bug_report</mat-icon>
                Report Issue
              </button>
            </div>
            
            <div class="error-help" *ngIf="showHelp">
              <h4>What you can do:</h4>
              <ul>
                <li *ngIf="errorType === 'network'">Check your internet connection</li>
                <li *ngIf="errorType === 'server'">Try again in a few minutes</li>
                <li *ngIf="errorType === 'auth'">Log in again</li>
                <li *ngIf="errorType === 'permission'">Contact your administrator</li>
                <li>Clear your browser cache</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .error-page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .error-content {
      width: 100%;
      max-width: 600px;
    }

    .error-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .error-card mat-card-content {
      padding: 40px;
      text-align: center;
    }

    .error-icon {
      margin-bottom: 24px;
    }

    .error-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
    }

    .error-icon-network {
      color: #f44336;
    }

    .error-icon-server {
      color: #ff9800;
    }

    .error-icon-auth {
      color: #2196f3;
    }

    .error-icon-permission {
      color: #9c27b0;
    }

    .error-icon-generic {
      color: #666;
    }

    .error-title {
      font-size: 32px;
      font-weight: 700;
      color: #333;
      margin-bottom: 16px;
    }

    .error-message {
      font-size: 18px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .error-details {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 32px;
      text-align: left;
    }

    .error-details h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }

    .error-detail-item {
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .error-detail-item strong {
      color: #333;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .error-actions button {
      min-width: 120px;
    }

    .error-help {
      background: #e3f2fd;
      border-radius: 8px;
      padding: 20px;
      text-align: left;
    }

    .error-help h4 {
      margin: 0 0 16px 0;
      color: #1976d2;
      font-size: 16px;
    }

    .error-help ul {
      margin: 0;
      padding-left: 20px;
    }

    .error-help li {
      margin-bottom: 8px;
      font-size: 14px;
      color: #333;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .error-page-container {
        padding: 10px;
      }

      .error-card mat-card-content {
        padding: 24px;
      }

      .error-title {
        font-size: 24px;
      }

      .error-message {
        font-size: 16px;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
      }

      .error-actions button {
        width: 100%;
        max-width: 200px;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .error-card {
        background: #2d2d2d;
        color: white;
      }

      .error-title {
        color: white;
      }

      .error-message {
        color: #ccc;
      }

      .error-details {
        background: #3d3d3d;
      }

      .error-details h4 {
        color: white;
      }

      .error-detail-item {
        color: #ccc;
      }

      .error-detail-item strong {
        color: white;
      }

      .error-help {
        background: #1e3a5f;
      }

      .error-help h4 {
        color: #64b5f6;
      }

      .error-help li {
        color: white;
      }
    }
  `]
})
export class ErrorPageComponent implements OnInit {
    // Services
    router = inject(Router);
    route = inject(ActivatedRoute);
    errorHandler = inject(ErrorHandlerService);
    snackBar = inject(MatSnackBar);

    // Component state
    errorType: 'network' | 'server' | 'auth' | 'permission' | 'generic' = 'generic';
    errorMessage: string = 'An unexpected error occurred';
    errorStatus: string = '';
    errorTimestamp: Date | null = null;
    errorUrl: string = '';
    errorDetails: boolean = false;
    showHelp: boolean = true;
    canRetry: boolean = false;

    ngOnInit(): void {
        // Get error details from query parameters
        this.route.queryParams.subscribe(params => {
            const error = params['error'];
            const message = params['message'];

            if (error) {
                this.errorStatus = error;
                this.errorType = this.determineErrorType(parseInt(error));
                this.errorMessage = message || this.getDefaultErrorMessage(this.errorType);
                this.errorDetails = true;
                this.canRetry = this.errorType === 'network' || this.errorType === 'server';
            }

            this.errorTimestamp = new Date();
            this.errorUrl = window.location.href;
        });
    }

    /**
     * Determine error type from status code
     */
    private determineErrorType(status: number): 'network' | 'server' | 'auth' | 'permission' | 'generic' {
        if (status === 0) return 'network';
        if (status >= 500) return 'server';
        if (status === 401) return 'auth';
        if (status === 403) return 'permission';
        return 'generic';
    }

    /**
     * Get default error message for error type
     */
    private getDefaultErrorMessage(type: 'network' | 'server' | 'auth' | 'permission' | 'generic'): string {
        switch (type) {
            case 'network':
                return 'Network connection error. Please check your internet connection.';
            case 'server':
                return 'Server error. Please try again later.';
            case 'auth':
                return 'Authentication error. Please log in again.';
            case 'permission':
                return 'Access denied. You do not have permission to access this resource.';
            default:
                return 'An unexpected error occurred.';
        }
    }

    /**
     * Get error icon
     */
    getErrorIcon(): string {
        switch (this.errorType) {
            case 'network':
                return 'wifi_off';
            case 'server':
                return 'error_outline';
            case 'auth':
                return 'lock';
            case 'permission':
                return 'block';
            default:
                return 'error';
        }
    }

    /**
     * Get error title
     */
    getErrorTitle(): string {
        switch (this.errorType) {
            case 'network':
                return 'Connection Error';
            case 'server':
                return 'Server Error';
            case 'auth':
                return 'Authentication Error';
            case 'permission':
                return 'Access Denied';
            default:
                return 'Error';
        }
    }

    /**
     * Go to home page
     */
    goHome(): void {
        this.router.navigate(['/']);
    }

    /**
     * Go back to previous page
     */
    goBack(): void {
        window.history.back();
    }

    /**
     * Retry the failed operation
     */
    retry(): void {
        window.location.reload();
    }

    /**
     * Report error
     */
    reportError(): void {
        const errorInfo = {
            type: this.errorType,
            message: this.errorMessage,
            status: this.errorStatus,
            timestamp: this.errorTimestamp,
            url: this.errorUrl,
            userAgent: navigator.userAgent
        };

        // In a real application, you would send this to your error reporting service
        console.error('Error reported:', errorInfo);

        this.snackBar.open('Error reported successfully', 'Close', {
            duration: 3000
        });
    }
}
