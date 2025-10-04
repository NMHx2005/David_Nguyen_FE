import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { GroupInterestRequest } from '../../../../models/group.model';

@Component({
  selector: 'app-group-requests-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule
  ],
  template: `
    <mat-card class="requests-table-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>group_add</mat-icon>
          Join Requests ({{ requests.length }})
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="requests" class="requests-table">
            <!-- User Column -->
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let request">
                <div class="user-info">
                  <div class="user-avatar">
                    {{ request.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="user-details">
                    <span class="username">{{ request.username }}</span>
                    <span class="user-id">ID: {{ request.userId }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Group Column -->
            <ng-container matColumnDef="group">
              <th mat-header-cell *matHeaderCellDef>Group</th>
              <td mat-cell *matCellDef="let request">
                <div class="group-info">
                  <strong>{{ request.groupName }}</strong>
                </div>
              </td>
            </ng-container>

            <!-- Request Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Request Type</th>
              <td mat-cell *matCellDef="let request">
                <mat-chip [color]="getRequestTypeColor(request.requestType)" class="type-chip">
                  <mat-icon>{{ getRequestTypeIcon(request.requestType) }}</mat-icon>
                  {{ getRequestTypeLabel(request.requestType) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let request">
                <mat-chip [color]="getStatusColor(request.status)" class="status-chip">
                  <mat-icon>{{ getStatusIcon(request.status) }}</mat-icon>
                  {{ getStatusLabel(request.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Requested Date Column -->
            <ng-container matColumnDef="requestedAt">
              <th mat-header-cell *matHeaderCellDef>Requested</th>
              <td mat-cell *matCellDef="let request">
                {{ formatDate(request.requestedAt) }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let request">
                <div class="action-buttons" *ngIf="request.status === 'pending'">
                  <button mat-raised-button 
                          color="primary" 
                          (click)="onApproveRequest.emit(request)"
                          matTooltip="Approve request">
                    <mat-icon>check</mat-icon>
                    Approve
                  </button>
                  <button mat-raised-button 
                          color="warn" 
                          (click)="onRejectRequest.emit(request)"
                          matTooltip="Reject request">
                    <mat-icon>close</mat-icon>
                    Reject
                  </button>
                </div>
                <div *ngIf="request.status !== 'pending'" class="reviewed-info">
                  <small>Reviewed by: {{ getReviewerName(request.reviewedBy) }}</small>
                  <br>
                  <small>{{ formatDate(request.reviewedAt) }}</small>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="requests.length === 0" class="empty-state">
          <mat-icon class="empty-icon">inbox</mat-icon>
          <h3>No Requests Found</h3>
          <p>There are no group join requests at the moment.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .requests-table-card {
      margin-bottom: 24px;
    }

    .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .requests-table {
      width: 100%;
    }

    .requests-table th.mat-header-cell {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tr.mat-row:hover {
      background-color: #f5f5f5;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-weight: 600;
      color: #333;
    }

    .user-id {
      font-size: 0.85rem;
      color: #666;
    }

    .group-info {
      font-weight: 500;
      color: #333;
    }

    .type-chip, .status-chip {
      font-size: 0.8rem;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .reviewed-info {
      color: #666;
      font-size: 0.85rem;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class GroupRequestsTableComponent {
  @Input() requests: GroupInterestRequest[] = [];
  @Output() onApproveRequest = new EventEmitter<GroupInterestRequest>();
  @Output() onRejectRequest = new EventEmitter<GroupInterestRequest>();

  displayedColumns = ['user', 'group', 'type', 'status', 'requestedAt', 'actions'];

  constructor() { }

  getRequestTypeColor(type: string): string {
    switch (type) {
      case 'register_interest': return 'primary';
      case 'request_invite': return 'accent';
      default: return 'primary';
    }
  }

  getRequestTypeIcon(type: string): string {
    switch (type) {
      case 'register_interest': return 'person_add';
      case 'request_invite': return 'mail';
      default: return 'help';
    }
  }

  getRequestTypeLabel(type: string): string {
    switch (type) {
      case 'register_interest': return 'Register Interest';
      case 'request_invite': return 'Request Invite';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'approved': return 'primary';
      case 'rejected': return 'accent';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'check_circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  }

  getReviewerName(reviewerId: string | null): string {
    if (!reviewerId) return 'Unknown';
    // This would typically come from UserService
    return 'Unknown';
  }

  formatDate(date: Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
