import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { GroupRequestService } from '../../../services/group-request.service';
import { GroupInterestRequest, GroupRequestsStats } from '../../../models/group.model';
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
    MatProgressSpinnerModule,
    MatTooltipModule,
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
              <button mat-icon-button (click)="refreshRequests()" matTooltip="Refresh Requests">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Section -->
        <app-group-requests-stats [stats]="statsData"></app-group-requests-stats>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading group requests...</p>
        </div>

        <!-- Requests Table -->
        <app-group-requests-table 
          *ngIf="!isLoading"
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      color: #666;
      font-size: 16px;
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
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private groupRequestService: GroupRequestService,
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
    // Load initial data
    this.loadRequests();
  }

  private loadRequests(): void {
    console.log('Loading group requests...');
    this.isLoading = true;

    this.groupRequestService.getGroupRequests({
      page: 1,
      limit: 100,
      sortBy: 'requestedAt',
      sortOrder: 'desc'
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Group requests API response:', response);
          this.isLoading = false;
          if (response.success) {
            this.requests = response.data.requests.map((apiRequest: any) => this.mapApiRequestToModel(apiRequest));
            this.updateStats();
          } else {
            this.snackBar.open(response.message || 'Failed to load group requests', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error loading group requests:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to load group requests. Please check your connection.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          // Don't redirect for permission errors
          if ((error as any)?.error?.message !== 'Insufficient permissions') {
            // Handle other errors if needed
          }
        }
      });
  }

  /**
   * Refresh requests data
   */
  refreshRequests(): void {
    this.loadRequests();
  }

  private updateStats(): void {
    this.statsData = {
      totalRequests: this.requests.length,
      pendingRequests: this.requests.filter(r => r.status === 'pending').length,
      approvedRequests: this.requests.filter(r => r.status === 'approved').length,
      rejectedRequests: this.requests.filter(r => r.status === 'rejected').length
    };
  }

  /**
   * Map API request to GroupInterestRequest model
   */
  private mapApiRequestToModel(apiRequest: any): GroupInterestRequest {
    return {
      id: apiRequest._id || apiRequest.id,
      userId: apiRequest.userId,
      username: apiRequest.username,
      userEmail: apiRequest.userEmail,
      groupId: apiRequest.groupId,
      groupName: apiRequest.groupName,
      requestType: apiRequest.requestType || 'register_interest',
      status: apiRequest.status || 'pending',
      requestedAt: new Date(apiRequest.requestedAt || apiRequest.createdAt),
      reviewedAt: apiRequest.reviewedAt ? new Date(apiRequest.reviewedAt) : undefined,
      reviewedBy: apiRequest.reviewedBy,
      reviewerName: apiRequest.reviewerName,
      reason: apiRequest.reason,
      message: apiRequest.message
    };
  }


  /**
   * Approve a user's request to join a group
   */
  async approveRequest(request: GroupInterestRequest): Promise<void> {
    if (confirm(`Approve ${request.username}'s request to join "${request.groupName}"?`)) {
      try {
        console.log('Approving request:', request.id);

        this.groupRequestService.approveRequest(request.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => {
              console.log('Approve request response:', result);
              if (result.success) {
                this.snackBar.open(result.message || 'Request approved successfully', 'Close', {
                  duration: 4000,
                  panelClass: ['success-snackbar']
                });
                // Update the request status locally
                const index = this.requests.findIndex(r => r.id === request.id);
                if (index !== -1) {
                  this.requests[index].status = 'approved';
                  this.requests[index].reviewedAt = new Date();
                  this.requests[index].reviewedBy = this.currentUser?.id;
                  this.requests[index].reviewerName = this.currentUser?.username || 'Admin';
                  this.updateStats();
                }

                // Refresh data to get updated user groups
                this.refreshRequests();
              } else {
                this.snackBar.open(result.message || 'Failed to approve request', 'Close', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            },
            error: (error) => {
              console.error('Error approving request:', error);
              this.snackBar.open('Failed to approve request. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
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
        console.log('Rejecting request:', request.id);

        this.groupRequestService.rejectRequest(request.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => {
              console.log('Reject request response:', result);
              if (result.success) {
                this.snackBar.open(result.message || 'Request rejected successfully', 'Close', {
                  duration: 4000,
                  panelClass: ['warning-snackbar']
                });
                // Update the request status locally
                const index = this.requests.findIndex(r => r.id === request.id);
                if (index !== -1) {
                  this.requests[index].status = 'rejected';
                  this.requests[index].reviewedAt = new Date();
                  this.requests[index].reviewedBy = this.currentUser?.id;
                  this.requests[index].reviewerName = this.currentUser?.username || 'Admin';
                  this.updateStats();
                }
              } else {
                this.snackBar.open(result.message || 'Failed to reject request', 'Close', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            },
            error: (error) => {
              console.error('Error rejecting request:', error);
              this.snackBar.open('Failed to reject request. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
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
