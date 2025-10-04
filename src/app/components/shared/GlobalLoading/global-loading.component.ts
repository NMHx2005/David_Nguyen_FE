import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService, LoadingState } from '../../../services/loading.service';
import { OfflineService } from '../../../services/offline.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <div *ngIf="loadingState.isLoading" class="global-loading-overlay">
      <div class="loading-container">
        <mat-card class="loading-card">
          <mat-card-content>
            <div class="loading-content">
              <!-- Loading Spinner -->
              <div class="spinner-container">
                <mat-spinner 
                  [diameter]="loadingState.showProgress ? 40 : 60"
                  [color]="loadingState.showProgress ? 'primary' : 'accent'">
                </mat-spinner>
              </div>

              <!-- Loading Text -->
              <div *ngIf="loadingState.loadingText" class="loading-text">
                {{ loadingState.loadingText }}
              </div>

              <!-- Progress Bar -->
              <div *ngIf="loadingState.showProgress && loadingState.progress !== undefined" class="progress-container">
                <mat-progress-bar 
                  [value]="loadingState.progress"
                  mode="determinate"
                  color="primary">
                </mat-progress-bar>
                <div class="progress-text">
                  {{ roundProgress(loadingState.progress || 0) }}%
                </div>
              </div>

              <!-- Offline Indicator -->
              <div *ngIf="!isOnline" class="offline-indicator">
                <mat-icon>wifi_off</mat-icon>
                <span>You are offline</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .loading-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      min-width: 300px;
      max-width: 400px;
      animation: slideUp 0.3s ease-out;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-text {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      text-align: center;
      line-height: 1.4;
    }

    .progress-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-text {
      font-size: 14px;
      color: #666;
      text-align: center;
      font-weight: 500;
    }

    .offline-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(244, 67, 54, 0.2);
    }

    .offline-indicator mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .loading-card {
        min-width: 280px;
        margin: 20px;
      }

      .loading-content {
        padding: 20px;
        gap: 12px;
      }

      .loading-text {
        font-size: 14px;
      }

      .progress-text {
        font-size: 12px;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .loading-card {
        background: #2d2d2d;
        color: white;
      }

      .loading-text {
        color: white;
      }

      .progress-text {
        color: #ccc;
      }
    }
  `]
})
export class GlobalLoadingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services
  loadingService = inject(LoadingService);
  offlineService = inject(OfflineService);

  // Component state
  loadingState: LoadingState = { isLoading: false };
  isOnline: boolean = true;

  ngOnInit(): void {
    // Subscribe to loading state
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loadingState = state;
        }, 0);
      });

    // Subscribe to online status
    this.offlineService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isOnline = status.isOnline;
        }, 0);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Round progress value
   */
  roundProgress(progress: number): number {
    return Math.round(progress);
  }
}
