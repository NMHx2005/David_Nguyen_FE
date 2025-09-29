import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';

interface GroupInterestRequest {
  id: string;
  groupId: string;
  groupName: string;
  userId: string;
  username: string;
  requestType: 'register_interest' | 'request_invite';
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: Date | null;
}

@Component({
  selector: 'app-manage-group-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout [pageTitle]="'Group Requests'">
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
        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon class="stat-icon">pending_actions</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ getPendingRequestsCount() }}</span>
                  <span class="stat-label">Pending Requests</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon class="stat-icon">check_circle</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ getApprovedRequestsCount() }}</span>
                  <span class="stat-label">Approved</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon class="stat-icon">cancel</mat-icon>
                <div class="stat-content">
                  <span class="stat-number">{{ getRejectedRequestsCount() }}</span>
                  <span class="stat-label">Rejected</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Requests Table -->
        <mat-card class="requests-table-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>group_add</mat-icon>
              Join Requests ({{ filteredRequests.length }})
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="filteredRequests" class="requests-table">
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
                      <button mat-raised-button color="primary" 
                              (click)="approveRequest(request)"
                              matTooltip="Approve request">
                        <mat-icon>check</mat-icon>
                        Approve
                      </button>
                      <button mat-raised-button color="warn" 
                              (click)="rejectRequest(request)"
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
            <div *ngIf="filteredRequests.length === 0" class="empty-state">
              <mat-icon class="empty-icon">inbox</mat-icon>
              <h3>No Requests Found</h3>
              <p>There are no group join requests at the moment.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-admin-layout>
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

    .stats-card {
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-icon {
      font-size: 2rem;
      color: #667eea;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }

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
      .manage-requests-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ManageGroupRequestsComponent implements OnInit {
  allRequests: GroupInterestRequest[] = [];
  filteredRequests: GroupInterestRequest[] = [];
  displayedColumns = ['user', 'group', 'type', 'status', 'requestedAt', 'actions'];
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRequests();
  }

  /**
   * Load all join/invite requests from localStorage and normalize date fields.
   */
  loadRequests(): void {
    const storedRequests = localStorage.getItem('groupInterestRequests');
    if (storedRequests) {
      this.allRequests = JSON.parse(storedRequests).map((req: any) => ({
        ...req,
        requestedAt: new Date(req.requestedAt),
        reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : null
      }));
    }
    this.filteredRequests = this.allRequests;
  }

  /**
   * Approve a user's request to join a group.
   * - Marks the request as approved with reviewer and timestamp
   * - Ensures the group exists, adds user to group.members
   * - Removes the request from user's pending requests bucket
   * - Persists all changes to localStorage
   */
  approveRequest(request: GroupInterestRequest): void {
    if (confirm(`Approve ${request.username}'s request to join "${request.groupName}"?`)) {
      try {
        // Update request status
        const requestIndex = this.allRequests.findIndex(r => r.id === request.id);
        if (requestIndex > -1) {
          this.allRequests[requestIndex].status = 'approved';
          this.allRequests[requestIndex].reviewedBy = this.currentUser.id;
          this.allRequests[requestIndex].reviewedAt = new Date();
        }

        // Add user to group (auto-create group if not existing)
        this.addUserToGroup(request.userId, request.groupId, request.groupName);
        // Sync user's groups list
        this.addGroupToUser(request.userId, request.groupId);

        // Remove from pending requests
        this.removeFromPendingRequests(request.userId, request.groupId);

        // Save changes
        this.saveRequests();

        this.snackBar.open(`Request approved! ${request.username} has been added to "${request.groupName}"`, 'Close', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      } catch (error) {
        this.snackBar.open('Failed to approve request. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Reject a user's request to join a group and persist the decision.
   */
  rejectRequest(request: GroupInterestRequest): void {
    if (confirm(`Reject ${request.username}'s request to join "${request.groupName}"?`)) {
      try {
        // Update request status
        const requestIndex = this.allRequests.findIndex(r => r.id === request.id);
        if (requestIndex > -1) {
          this.allRequests[requestIndex].status = 'rejected';
          this.allRequests[requestIndex].reviewedBy = this.currentUser.id;
          this.allRequests[requestIndex].reviewedAt = new Date();
        }

        // Remove from pending requests
        this.removeFromPendingRequests(request.userId, request.groupId);

        // Save changes
        this.saveRequests();

        this.snackBar.open(`Request rejected for ${request.username}`, 'Close', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
      } catch (error) {
        this.snackBar.open('Failed to reject request. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Idempotently add a user to the specified group. Creates the group if missing.
   * @param userId User id to be added
   * @param groupId Target group id
   * @param groupName Optional group name used when creating the group lazily
   */
  addUserToGroup(userId: string, groupId: string, groupName?: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    let groupIndex = groups.findIndex((g: any) => g.id === groupId);

    if (groupIndex === -1) {
      // Group not found (could be removed from seed). Create a minimal group entry
      const newGroup = {
        id: groupId,
        name: groupName || `Group ${groupId}`,
        description: '',
        category: 'general',
        status: 'active',
        createdBy: this.currentUser?.id || 'system',
        admins: [this.currentUser?.id || 'system'],
        members: [],
        channels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 0,
        maxMembers: 100
      };
      groups.push(newGroup);
      groupIndex = groups.length - 1;
    }

    // Add user to group members if not already a member
    if (!Array.isArray(groups[groupIndex].members)) {
      groups[groupIndex].members = [];
    }
    if (!groups[groupIndex].members.includes(userId)) {
      groups[groupIndex].members.push(userId);
      groups[groupIndex].memberCount = (groups[groupIndex].members?.length) || 0;
      groups[groupIndex].updatedAt = new Date();
    }
    localStorage.setItem('groups', JSON.stringify(groups));
  }

  /**
   * Ensure the user record in localStorage contains the newly approved groupId.
   */
  addGroupToUser(userId: string, groupId: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx > -1) {
      if (!Array.isArray(users[idx].groups)) users[idx].groups = [];
      if (!users[idx].groups.includes(groupId)) {
        users[idx].groups.push(groupId);
      }
      users[idx].updatedAt = new Date();
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  /**
   * Remove an approved/rejected group id from the user's local pending list.
   */
  removeFromPendingRequests(userId: string, groupId: string): void {
    const pendingRequests = JSON.parse(localStorage.getItem(`pendingRequests_${userId}`) || '[]');
    const updatedRequests = pendingRequests.filter((id: string) => id !== groupId);
    localStorage.setItem(`pendingRequests_${userId}`, JSON.stringify(updatedRequests));
  }

  /**
   * Persist requests back to localStorage and refresh the in-memory list.
   */
  saveRequests(): void {
    localStorage.setItem('groupInterestRequests', JSON.stringify(this.allRequests));
    this.loadRequests();
  }

  getPendingRequestsCount(): number {
    return this.allRequests.filter(r => r.status === 'pending').length;
  }

  getApprovedRequestsCount(): number {
    return this.allRequests.filter(r => r.status === 'approved').length;
  }

  getRejectedRequestsCount(): number {
    return this.allRequests.filter(r => r.status === 'rejected').length;
  }

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
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const reviewer = users.find((u: any) => u.id === reviewerId);
    return reviewer ? reviewer.username : 'Unknown';
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
