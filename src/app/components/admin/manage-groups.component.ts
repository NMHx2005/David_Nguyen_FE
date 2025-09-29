import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GroupsManagementService } from '../../services/admin/groups-management.service';
import { GroupsTableComponent } from '../ui/admin/groups-table.component';
import { GroupsStatsComponent } from '../ui/admin/groups-stats.component';
import { User, UserRole } from '../../models/user.model';
import { Group, GroupStatus } from '../../models/group.model';

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
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category" required>
            <mat-option value="">Select Category</mat-option>
            <mat-option value="technology">Technology</mat-option>
            <mat-option value="business">Business</mat-option>
            <mat-option value="education">Education</mat-option>
            <mat-option value="entertainment">Entertainment</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
          <mat-error *ngIf="groupForm.get('category')?.hasError('required')">
            Category is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Max Members</mat-label>
          <input matInput type="number" formControlName="maxMembers" min="1" max="1000">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="createGroup()" [disabled]="!groupForm.valid">
        Create Group
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

  constructor(
    public dialogRef: MatDialogRef<CreateGroupDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { onCreate: (group: Partial<Group>) => void }
  ) {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)],
      category: ['', Validators.required],
      maxMembers: [100, [Validators.min(1), Validators.max(1000)]]
    });
  }

  createGroup(): void {
    if (this.groupForm.valid) {
      this.data.onCreate(this.groupForm.value);
      this.dialogRef.close();
    }
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
                    <mat-option value="ACTIVE">Active</mat-option>
                    <mat-option value="INACTIVE">Inactive</mat-option>
                    <mat-option value="PENDING">Pending</mat-option>
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

                <button mat-stroked-button (click)="clearFilters()">
                  <mat-icon>clear</mat-icon>
                  Clear Filters
                </button>
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
            <div class="table-container">
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
                    {{ group.memberCount || group.members.length }} / {{ group.maxMembers }}
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
export class ManageGroupsComponent implements OnInit {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  displayedColumns = ['name', 'category', 'status', 'members', 'channels', 'createdBy', 'created', 'actions'];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadGroups();
    this.filterGroups();
  }

  loadGroups(): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      this.groups = JSON.parse(storedGroups);
    } else {
      // Initialize with default groups if none exist
      this.initializeDefaultGroups();
    }
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
    localStorage.setItem('groups', JSON.stringify(this.groups));
  }

  filterGroups(): void {
    this.filteredGroups = this.groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || group.status === this.statusFilter;
      const matchesCategory = !this.categoryFilter || group.category === this.categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
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
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const creator = users.find((u: User) => u.id === creatorId);
    return creator ? creator.username : 'Unknown';
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
      return group.createdBy === this.currentUser.id;
    }
    return false;
  }

  canDeleteGroup(group: Group): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return group.createdBy === this.currentUser.id;
    }
    return false;
  }

  canToggleGroupStatus(group: Group): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return group.createdBy === this.currentUser.id;
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
      // Check if group has members
      if (group.members.length > 1) { // More than just the creator
        this.snackBar.open('Cannot delete group with active members. Remove all members first.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Remove group from all users' groups array
      this.removeGroupFromUsers(group.id);

      // Cascade delete: remove all channels that belong to this group
      this.removeChannelsByGroup(group.id);

      // Delete the group
      this.groups = this.groups.filter(g => g.id !== group.id);
      this.updateGroups();
      this.filterGroups();

      this.snackBar.open(`Group "${group.name}" deleted successfully`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
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
    group.status = newStatus;
    group.updatedAt = new Date();

    this.updateGroups();
    this.filterGroups();

    this.snackBar.open(`Group "${group.name}" status changed to ${this.getStatusDisplayName(newStatus)}`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  openCreateGroupDialog(): void {
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '500px',
      data: {
        onCreate: (groupData: Partial<Group>) => {
          const newGroup: Group = {
            id: Date.now().toString(),
            name: groupData.name!,
            description: groupData.description || '',
            category: groupData.category!,
            status: GroupStatus.ACTIVE,
            createdBy: this.currentUser!.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            admins: [this.currentUser!.id], // Creator becomes admin
            members: [this.currentUser!.id], // Creator becomes first member
            channels: ['general'], // Default general channel
            isActive: true,
            memberCount: 1,
            maxMembers: groupData.maxMembers || 100
          };

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
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach((user: User) => {
      user.groups = user.groups.filter(g => g !== groupId);
    });
    localStorage.setItem('users', JSON.stringify(users));
  }

  updateGroups(): void {
    localStorage.setItem('groups', JSON.stringify(this.groups));
  }

  /**
   * Remove all channels with the specified groupId from storage.
   * Also updates the channels list if present in memory.
   */
  removeChannelsByGroup(groupId: string): void {
    const storedChannels = localStorage.getItem('channels');
    if (!storedChannels) return;
    const channels = JSON.parse(storedChannels);
    const remaining = channels.filter((c: any) => c.groupId !== groupId);
    localStorage.setItem('channels', JSON.stringify(remaining));
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.categoryFilter = '';
    this.filterGroups();
  }

  // Statistics methods
  getTotalGroupsCount(): number {
    return this.groups.length;
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
}