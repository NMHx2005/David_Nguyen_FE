import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { GroupRequestsService, GroupInterestRequest, GroupRequestsStats } from './services/group-requests.service';
import { GroupRequestsStatsComponent } from './ui/group-requests-stats.component';
import { GroupRequestsTableComponent } from './ui/group-requests-table.component';


@Component({
  selector: 'app-manage-group-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    GroupRequestsStatsComponent,
    GroupRequestsTableComponent
  ],
  template: `
      <div class="manage-requests-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Group Join Requests</h1>
              <p>Review and manage user requests to join groups</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/admin">
                <mat-icon>arrow_back</mat-icon>
                Back to Admin
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Section -->
        <app-group-requests-stats [stats]="statsData"></app-group-requests-stats>

        <!-- Requests Table -->
        <app-group-requests-table 
          [requests]="requests"
          (onApproveRequest)="approveRequest($event)"
          (onRejectRequest)="rejectRequest($event)">
        </app-group-requests-table>
      </div>
  `,
  styles: [`
    .manage-requests-container {
      margin: 0 auto;
      padding: 24px;
    }

    .page-header-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }


    @media (max-width: 768px) {
      .manage-requests-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class ManageGroupRequestsComponent implements OnInit, OnDestroy {
  requests: GroupInterestRequest[] = [];
  statsData: GroupRequestsStats = {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  };
  currentUser: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private groupRequestsService: GroupRequestsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // Subscribe to requests data
    this.groupRequestsService.requests$
      .pipe(takeUntil(this.destroy$))
      .subscribe(requests => {
        this.requests = requests;
      });

    // Subscribe to statistics
    this.groupRequestsService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.statsData = stats;
      });
  }


  /**
   * Approve a user's request to join a group
   */
  async approveRequest(request: GroupInterestRequest): Promise<void> {
    if (confirm(`Approve ${request.username}'s request to join "${request.groupName}"?`)) {
      try {
        const result = await this.groupRequestsService.approveRequest(request, this.currentUser);

        if (result.success) {
          this.snackBar.open(result.message, 'Close', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open(result.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        console.error('Error approving request:', error);
        this.snackBar.open('Failed to approve request. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Reject a user's request to join a group
   */
  async rejectRequest(request: GroupInterestRequest): Promise<void> {
    if (confirm(`Reject ${request.username}'s request to join "${request.groupName}"?`)) {
      try {
        const result = await this.groupRequestsService.rejectRequest(request, this.currentUser);

        if (result.success) {
          this.snackBar.open(result.message, 'Close', {
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
        } else {
          this.snackBar.open(result.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
        this.snackBar.open('Failed to reject request. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

}
