import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { GroupService } from '../../../services/group.service';
import { Group, GroupStatus } from '../../../models/group.model';
import { UserRole } from '../../../models/user.model';
import { GroupsTableComponent } from './ui/groups-table.component';
import { GroupsStatsComponent } from './ui/groups-stats.component';

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Create New Group</h2>
    <mat-dialog-content>
      <form [formGroup]="groupForm" (ngSubmit)="createGroup()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Group Name</mat-label>
          <input matInput formControlName="name" required minlength="3" maxlength="50">
          <mat-error *ngIf="groupForm.get('name')?.hasError('required')">
            Group name is required
          </mat-error>
          <mat-error *ngIf="groupForm.get('name')?.hasError('minlength')">
            Group name must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" maxlength="200"></textarea>
          <mat-hint align="end">{{ groupForm.get('description')?.value?.length || 0 }}/200</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Privacy</mat-label>
          <mat-select formControlName="isPrivate">
            <mat-option [value]="false">Public</mat-option>
            <mat-option [value]="true">Private</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="createGroup()" [disabled]="!groupForm.valid || isSubmitting">
        <mat-icon *ngIf="!isSubmitting">add</mat-icon>
        <mat-icon *ngIf="isSubmitting" class="spinning">refresh</mat-icon>
        {{ isSubmitting ? 'Creating...' : 'Create Group' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class CreateGroupDialogComponent {
  groupForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<CreateGroupDialogComponent>,
    private fb: FormBuilder,
    private groupService: GroupService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { onCreate: (group: Partial<Group>) => void }
  ) {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)],
      isPrivate: [false]
    });
  }

  createGroup(): void {
    if (this.groupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const groupData = {
        name: this.groupForm.get('name')?.value,
        description: this.groupForm.get('description')?.value,
        isPrivate: this.groupForm.get('isPrivate')?.value
      };

      this.groupService.createGroup(groupData)
        .pipe(
          catchError(error => {
            console.error('Error creating group:', error);
            this.handleCreateError(error);
            throw error;
          }),
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.snackBar.open('Group created successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.data.onCreate(response.data);
              this.dialogRef.close();
            } else {
              this.snackBar.open(response.message || 'Failed to create group', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error: any) => {
            // Error already handled in catchError
          }
        });
    }
  }

  private handleCreateError(error: any): void {
    let errorMessage = 'Failed to create group. Please try again.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid group data. Please check your input.';
    } else if (error.status === 409) {
      errorMessage = 'Group name already exists. Please choose a different name.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

@Component({
  selector: 'app-manage-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  template: `
      <div class="manage-groups-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Manage Groups</h1>
              <p>Create, edit, and manage groups across the platform</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/admin">
                <mat-icon>arrow_back</mat-icon>
                Back to Admin
              </button>
              <button mat-stroked-button (click)="exportGroups()">
                <mat-icon>download</mat-icon>
                Export
              </button>
              <button mat-raised-button color="primary" (click)="openCreateGroupDialog()" 
                      [disabled]="!canCreateGroup()">
                <mat-icon>add</mat-icon>
                Create Group
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Grid -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">group_work</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getTotalGroupsCount() }}</h3>
                <p>Total Groups</p>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">check_circle</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getActiveGroupsCount() }}</h3>
                <p>Active Groups</p>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">people</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getTotalMembersCount() }}</h3>
                <p>Total Members</p>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">pending</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getPendingRequestsCount() }}</h3>
                <p>Pending Requests</p>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Search and Filter Section -->
        <mat-card class="search-section-card">
          <mat-card-content>
            <div class="search-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search groups</mat-label>
                <input matInput
                       [(ngModel)]="searchTerm"
                       placeholder="Search by name or description..."
                       (input)="filterGroups()">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <div class="filter-options">
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="statusFilter" (selectionChange)="filterGroups()">
                    <mat-option value="">All Status</mat-option>
                    <mat-option value="active">Active</mat-option>
                    <mat-option value="inactive">Inactive</mat-option>
                    <mat-option value="pending">Pending</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Category</mat-label>
                  <mat-select [(ngModel)]="categoryFilter" (selectionChange)="filterGroups()">
                    <mat-option value="">All Categories</mat-option>
                    <mat-option value="technology">Technology</mat-option>
                    <mat-option value="business">Business</mat-option>
                    <mat-option value="education">Education</mat-option>
                    <mat-option value="entertainment">Entertainment</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Privacy</mat-label>
                  <mat-select [(ngModel)]="privacyFilter" (selectionChange)="filterGroups()">
                    <mat-option value="">All Groups</mat-option>
                    <mat-option value="public">Public</mat-option>
                    <mat-option value="private">Private</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Member Count</mat-label>
                  <mat-select [(ngModel)]="memberCountFilter" (selectionChange)="filterGroups()">
                    <mat-option value="">Any Size</mat-option>
                    <mat-option value="small">Small (1-10)</mat-option>
                    <mat-option value="medium">Medium (11-50)</mat-option>
                    <mat-option value="large">Large (51+)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Sort By</mat-label>
                  <mat-select [(ngModel)]="sortBy" (selectionChange)="filterGroups()">
                    <mat-option value="createdAt">Created Date</mat-option>
                    <mat-option value="name">Name</mat-option>
                    <mat-option value="memberCount">Member Count</mat-option>
                    <mat-option value="updatedAt">Last Updated</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Order</mat-label>
                  <mat-select [(ngModel)]="sortOrder" (selectionChange)="filterGroups()">
                    <mat-option value="desc">Descending</mat-option>
                    <mat-option value="asc">Ascending</mat-option>
                  </mat-select>
                </mat-form-field>

                <button mat-stroked-button (click)="clearFilters()">
                  <mat-icon>clear</mat-icon>
                  Clear Filters
                </button>

                <button mat-stroked-button (click)="toggleAdvancedFilters()">
                  <mat-icon>{{ showAdvancedFilters ? 'expand_less' : 'expand_more' }}</mat-icon>
                  {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced
                </button>
              </div>

              <!-- Advanced Filters -->
              <div *ngIf="showAdvancedFilters" class="advanced-filters">
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Created Date From</mat-label>
                  <input matInput type="date" [(ngModel)]="dateFrom" (change)="filterGroups()">
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Created Date To</mat-label>
                  <input matInput type="date" [(ngModel)]="dateTo" (change)="filterGroups()">
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Created By</mat-label>
                  <mat-select [(ngModel)]="createdByFilter" (selectionChange)="filterGroups()">
                    <mat-option value="">All Creators</mat-option>
                    <mat-option *ngFor="let user of creators" [value]="user.id">
                      {{ user.username }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Has Channels</mat-label>
                  <mat-select [(ngModel)]="hasChannelsFilter" (selectionChange)="filterGroups()">
                    <mat-option value="">All Groups</mat-option>
                    <mat-option value="yes">With Channels</mat-option>
                    <mat-option value="no">Without Channels</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Groups Table -->
        <mat-card class="groups-table-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>group_work</mat-icon>
              Groups List
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <!-- Loading indicator -->
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading groups...</p>
            </div>

            <div *ngIf="!isLoading" class="table-container">
              <table mat-table [dataSource]="filteredGroups" class="groups-table">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Group Name</th>
                  <td mat-cell *matCellDef="let group">
                    <div class="group-info">
                      <strong>{{ group.name }}</strong>
                      <small>{{ group.description }}</small>
                    </div>
                  </td>
                </ng-container>

                <!-- Category Column -->
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let group">
                    <mat-chip class="category-{{ group.category }}">
                      {{ group.category }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let group">
                    <mat-chip [ngClass]="getStatusCss(group.status)">
                      {{ getStatusDisplayName(group.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Members Column -->
                <ng-container matColumnDef="members">
                  <th mat-header-cell *matHeaderCellDef>Members</th>
                  <td mat-cell *matCellDef="let group">
                    {{ group.memberCount || (group.members?.length || 0) }} / {{ group.maxMembers }}
                  </td>
                </ng-container>

                <!-- Channels Column -->
                <ng-container matColumnDef="channels">
                  <th mat-header-cell *matHeaderCellDef>Channels</th>
                  <td mat-cell *matCellDef="let group">
                    {{ (group.channels?.length || 0) }}
                  </td>
                </ng-container>

                <!-- Created By Column -->
                <ng-container matColumnDef="createdBy">
                  <th mat-header-cell *matHeaderCellDef>Created By</th>
                  <td mat-cell *matCellDef="let group">
                    {{ getCreatorName(group.createdBy) }}
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let group">
                    {{ group.createdAt | date:'shortDate' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let group">
                    <div class="action-buttons">
                      <button mat-icon-button matTooltip="View Group" (click)="viewGroup(group)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      
                      <button mat-icon-button matTooltip="Edit Group" 
                              (click)="editGroup(group)"
                              [disabled]="!canEditGroup(group)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      
                      <button mat-icon-button matTooltip="Toggle Status" 
                              (click)="toggleGroupStatus(group)"
                              [disabled]="!canToggleGroupStatus(group)">
                        <mat-icon>{{ group.status === 'ACTIVE' ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                      
                      <button mat-icon-button matTooltip="Delete Group" 
                              (click)="deleteGroup(group)"
                              [disabled]="!canDeleteGroup(group)"
                              class="delete-action">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <!-- Empty State -->
            <div *ngIf="filteredGroups.length === 0" class="empty-state">
              <mat-icon class="empty-icon">group_off</mat-icon>
              <h3>No Groups Found</h3>
              <p>Try adjusting your search criteria or create a new group.</p>
            </div>

            <!-- Paginator -->
            <mat-paginator 
              *ngIf="totalGroups > pageSize"
              [length]="totalGroups"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              [pageIndex]="currentPage"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
  `,
  styles: [`
    .manage-groups-container {
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

    .search-section-card {
      margin-bottom: 24px;
    }

    .search-section {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 300px;
      flex: 1;
    }

    .filter-options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 150px;
    }

    .groups-table-card {
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

    .groups-table {
      width: 100%;
    }

    .groups-table th.mat-header-cell {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tr.mat-row:hover {
      background-color: #f5f5f5;
    }

    .group-info {
      display: flex;
      flex-direction: column;
    }

    .group-info small {
      color: #7f8c8d;
      font-size: 11px;
      margin-top: 2px;
    }

    .category-technology {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .category-business {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .category-education {
      background: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .category-entertainment {
      background: #fce4ec !important;
      color: #c2185b !important;
    }

    .category-other {
      background: #f3e5f5 !important;
      color: #7b1fa2 !important;
    }

    .status-active {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-inactive {
      background: #ffebee !important;
      color: #c62828 !important;
    }

    .status-pending {
      background: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .stat-icon-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon {
      font-size: 32px;
      color: white;
      width: 32px;
      height: 32px;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .stat-details p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .delete-action {
      color: #e74c3c !important;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .empty-state p {
      margin: 0;
      opacity: 0.7;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 1rem;
    }

    .advanced-filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 16px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .advanced-filters .filter-field {
      min-width: 180px;
    }

    .filter-options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    @media (max-width: 768px) {
      .manage-groups-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
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
export class ManageGroupsComponent implements OnInit, OnDestroy {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';

  // New filter properties
  privacyFilter = '';
  memberCountFilter = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';
  showAdvancedFilters = false;
  dateFrom = '';
  dateTo = '';
  createdByFilter = '';
  hasChannelsFilter = '';
  creators: any[] = [];

  displayedColumns = ['name', 'category', 'status', 'members', 'channels', 'createdBy', 'created', 'actions'];
  currentUser: User | null = null;

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalGroups = 0;
  totalPages = 0;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private groupService: GroupService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Ensure user data is loaded from localStorage first
    this.authService.ensureUserLoaded();

    // Subscribe to currentUser$ observable to ensure we get updates when user data loads
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.debugUserPermissions();
        // Trigger change detection to update button states
        this.cdr.detectChanges();
      });

    // Also try to get current user immediately in case it's already loaded
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.debugUserPermissions();
    }

    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Debug user permissions
   */
  private debugUserPermissions(): void {
    console.log('🔍 ManageGroupsComponent.debugUserPermissions - currentUser:', this.currentUser);
    if (this.currentUser) {
      console.log('🔍 ManageGroupsComponent.debugUserPermissions - user roles:', this.currentUser.roles);
      console.log('🔍 ManageGroupsComponent.debugUserPermissions - canCreateGroup:', this.canCreateGroup());
      console.log('🔍 ManageGroupsComponent.debugUserPermissions - canEditGroup (first group):', this.groups.length > 0 ? this.canEditGroup(this.groups[0]) : 'No groups');
    } else {
      console.log('🔍 ManageGroupsComponent.debugUserPermissions - No current user');
    }
  }

  loadGroups(): void {
    this.isLoading = true;

    this.groupService.getAllGroups({
      page: this.currentPage + 1, // API uses 1-based pagination
      limit: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter,
      category: this.categoryFilter
    })
      .pipe(
        catchError(error => {
          console.error('Error loading groups:', error);
          this.snackBar.open('Failed to load groups.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.groups = [];
          this.filteredGroups = [];
          this.totalGroups = 0;
          throw error;
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.groups = response.data.groups.map((apiGroup: any) => this.mapApiGroupToModel(apiGroup));
            this.filteredGroups = [...this.groups];
            this.totalGroups = response.data.total;
            this.totalPages = response.data.pages;
          } else {
            this.snackBar.open(response.message || 'Failed to load groups', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.groups = [];
            this.filteredGroups = [];
            this.totalGroups = 0;
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });
  }

  initializeDefaultGroups(): void {
    this.groups = [
      {
        id: '1',
        name: 'Development Team',
        description: 'Main development team for the chat system project',
        category: 'technology',
        status: GroupStatus.ACTIVE,
        createdBy: '1', // super admin
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        admins: ['1'], // only creator by default
        members: ['1'], // only creator joined by default
        channels: [],
        isActive: true,
        memberCount: 1,
        maxMembers: 50
      },
      {
        id: '2',
        name: 'Design Team',
        description: 'Creative discussions and design feedback',
        category: 'design',
        status: GroupStatus.ACTIVE,
        createdBy: '2', // group admin
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date(),
        admins: ['2'], // creator only by default
        members: ['2'], // creator only by default
        channels: [],
        isActive: true,
        memberCount: 1,
        maxMembers: 30
      },
      {
        id: '3',
        name: 'Marketing Team',
        description: 'Marketing strategies and campaigns',
        category: 'business',
        status: GroupStatus.PENDING,
        createdBy: '2', // group admin
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date(),
        admins: ['2'], // creator only by default
        members: ['2'], // creator only by default
        channels: [],
        isActive: true,
        memberCount: 1,
        maxMembers: 25
      }
    ];
    // No need to store in localStorage - data comes from API
  }

  /**
   * Map API Group to models Group
   */
  private mapApiGroupToModel(apiGroup: any): Group {
    return {
      id: apiGroup._id || apiGroup.id,
      name: apiGroup.name,
      description: apiGroup.description,
      category: 'general', // Default category since API doesn't have it
      status: apiGroup.status || GroupStatus.ACTIVE, // Map from API response
      createdBy: apiGroup.createdBy,
      admins: apiGroup.admins || [],
      members: apiGroup.members?.map((m: any) => m.userId || m) || [],
      channels: [], // Default empty channels
      createdAt: new Date(apiGroup.createdAt),
      updatedAt: new Date(apiGroup.updatedAt),
      isActive: apiGroup.isActive !== false,
      memberCount: apiGroup.members?.length || 0,
      maxMembers: 100 // Default max members
    };
  }


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadGroups();
  }

  getStatusDisplayName(status: GroupStatus): string {
    switch (status) {
      case GroupStatus.ACTIVE: return 'Active';
      case GroupStatus.INACTIVE: return 'Inactive';
      case GroupStatus.PENDING: return 'Pending';
      default: return 'Unknown';
    }
  }

  getStatusCss(status: any): string {
    const s = (typeof status === 'string') ? status.toLowerCase() : (status?.toString()?.toLowerCase() || 'unknown');
    return `status-${s}`;
  }

  getCreatorName(creatorId: string): string {
    // This would typically come from UserService
    return 'Unknown';
  }

  // Business Logic: Permission checks
  canCreateGroup(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN) ||
      this.currentUser.roles.includes(UserRole.GROUP_ADMIN);
  }

  canEditGroup(group: Group): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return group.createdBy === (this.currentUser as any).id;
    }
    return false;
  }

  canDeleteGroup(group: Group): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return group.createdBy === (this.currentUser as any).id;
    }
    return false;
  }

  canToggleGroupStatus(group: Group): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return group.createdBy === (this.currentUser as any).id;
    }
    return false;
  }

  // CRUD Operations
  viewGroup(group: Group): void {
    this.router.navigate(['/admin/groups', group.id]);
  }

  editGroup(group: Group): void {
    this.router.navigate(['/admin/groups', group.id, 'edit']);
  }

  async deleteGroup(group: Group): Promise<void> {
    if (!confirm(`Are you sure you want to delete group "${group.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Allow deletion even with active members
      this.groupService.deleteGroup(group.id)
        .pipe(
          catchError(error => {
            console.error('Error deleting group:', error);
            this.snackBar.open('Failed to delete group. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            throw error;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Remove group from all users' groups array
              this.removeGroupFromUsers(group.id);

              // Cascade delete: remove all channels that belong to this group
              this.removeChannelsByGroup(group.id);

              // Delete the group from local array
              this.groups = this.groups.filter(g => g.id !== group.id);
              this.updateGroups();
              this.filterGroups();

              this.snackBar.open(`Group "${group.name}" deleted successfully`, 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            } else {
              this.snackBar.open(response.message || 'Failed to delete group', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            // Error already handled in catchError
          }
        });
    } catch (error) {
      this.snackBar.open('Failed to delete group. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  toggleGroupStatus(group: Group): void {
    const newStatus = group.status === GroupStatus.ACTIVE ? GroupStatus.INACTIVE : GroupStatus.ACTIVE;

    // Call API to update status
    this.groupService.updateGroup(group.id, { status: newStatus })
      .pipe(
        catchError(error => {
          console.error('Error updating group status:', error);
          this.snackBar.open('Failed to update group status. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          throw error;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Update local state
            group.status = newStatus;
            group.updatedAt = new Date();

            this.updateGroups();
            this.filterGroups();

            this.snackBar.open(`Group "${group.name}" status changed to ${this.getStatusDisplayName(newStatus)}`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          } else {
            this.snackBar.open(response.message || 'Failed to update group status', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error updating group status:', error);
          this.snackBar.open('Failed to update group status. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  openCreateGroupDialog(): void {
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '500px',
      data: {
        onCreate: (apiGroup: any) => {
          // Map API Group to models Group
          const newGroup = this.mapApiGroupToModel(apiGroup);

          this.groups.push(newGroup);
          this.updateGroups();
          this.filterGroups();

          this.snackBar.open(`Group "${newGroup.name}" created successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      }
    });
  }

  // Helper methods
  removeGroupFromUsers(groupId: string): void {
    // This would typically call UserService to remove group from users
  }

  updateGroups(): void {
    // No need to store in localStorage - data comes from API
  }

  /**
   * Remove all channels with the specified groupId from storage.
   * Also updates the channels list if present in memory.
   */
  removeChannelsByGroup(groupId: string): void {
    // This would typically call ChannelService to remove channels by group
  }


  // Statistics methods
  getTotalGroupsCount(): number {
    return this.totalGroups;
  }

  getActiveGroupsCount(): number {
    return this.groups.filter(group => group.status === GroupStatus.ACTIVE).length;
  }

  getTotalMembersCount(): number {
    return this.groups.reduce((total, group) => total + (group.memberCount || 0), 0);
  }

  getPendingRequestsCount(): number {
    // Mock implementation - in real app, this would count actual pending join requests
    return this.groups.filter(group => group.status === GroupStatus.PENDING).length;
  }

  // New filter methods
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    if (this.showAdvancedFilters && this.creators.length === 0) {
      this.loadCreators();
    }
  }

  loadCreators(): void {
    // Load unique creators from groups
    const uniqueCreators = new Map();
    this.groups.forEach(group => {
      if (group.createdBy && !uniqueCreators.has(group.createdBy)) {
        uniqueCreators.set(group.createdBy, {
          id: group.createdBy,
          username: this.getCreatorName(group.createdBy)
        });
      }
    });
    this.creators = Array.from(uniqueCreators.values());
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.categoryFilter = '';
    this.privacyFilter = '';
    this.memberCountFilter = '';
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.dateFrom = '';
    this.dateTo = '';
    this.createdByFilter = '';
    this.hasChannelsFilter = '';
    this.filterGroups();
  }

  // Enhanced filterGroups method
  filterGroups(): void {
    // Reset to first page when filtering
    this.currentPage = 0;

    // Build filter object for API call
    const filters: any = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter,
      category: this.categoryFilter,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    // Add privacy filter
    if (this.privacyFilter) {
      filters.isPrivate = this.privacyFilter === 'private';
    }

    // Add member count filter
    if (this.memberCountFilter) {
      switch (this.memberCountFilter) {
        case 'small':
          filters.memberCountMin = 1;
          filters.memberCountMax = 10;
          break;
        case 'medium':
          filters.memberCountMin = 11;
          filters.memberCountMax = 50;
          break;
        case 'large':
          filters.memberCountMin = 51;
          break;
      }
    }

    // Add date filters
    if (this.dateFrom) {
      filters.dateFrom = new Date(this.dateFrom).toISOString();
    }
    if (this.dateTo) {
      filters.dateTo = new Date(this.dateTo).toISOString();
    }

    // Add creator filter
    if (this.createdByFilter) {
      filters.createdBy = this.createdByFilter;
    }

    // Add channels filter
    if (this.hasChannelsFilter) {
      filters.hasChannels = this.hasChannelsFilter === 'yes';
    }

    this.loadGroupsWithFilters(filters);
  }

  loadGroupsWithFilters(filters: any): void {
    this.isLoading = true;

    this.groupService.getAllGroups(filters)
      .pipe(
        catchError(error => {
          console.error('Error loading groups with filters:', error);
          this.snackBar.open('Failed to load groups.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.groups = [];
          this.filteredGroups = [];
          this.totalGroups = 0;
          throw error;
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.groups = response.data.groups.map((apiGroup: any) => this.mapApiGroupToModel(apiGroup));
            this.filteredGroups = [...this.groups];
            this.totalGroups = response.data.total;
            this.totalPages = response.data.pages;
          } else {
            this.snackBar.open(response.message || 'Failed to load groups', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.groups = [];
            this.filteredGroups = [];
            this.totalGroups = 0;
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });
  }

  // Export filtered data
  exportGroups(): void {
    const data = this.filteredGroups.map(group => ({
      Name: group.name,
      Description: group.description,
      Category: group.category,
      Status: group.status,
      'Member Count': group.memberCount || 0,
      'Channel Count': group.channels?.length || 0,
      Privacy: group.isPrivate ? 'Private' : 'Public',
      'Created By': this.getCreatorName(group.createdBy),
      'Created Date': new Date(group.createdAt).toLocaleDateString(),
      'Last Updated': new Date(group.updatedAt).toLocaleDateString()
    }));

    const csv = this.convertToCSV(data);
    this.downloadCSV(csv, 'groups-export.csv');
  }

  convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}