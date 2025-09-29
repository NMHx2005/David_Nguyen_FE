import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UsersManagementService, UserStats, UserFilters } from '../../services/admin/users-management.service';
import { UsersStatsComponent } from '../ui/admin/users-stats.component';
import { UsersFiltersComponent } from '../ui/admin/users-filters.component';
import { UsersTableComponent } from '../ui/admin/users-table.component';
import { UserFormDialogComponent, UserFormData } from '../ui/admin/user-form-dialog.component';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    UsersStatsComponent,
    UsersFiltersComponent,
    UsersTableComponent
  ],
  template: `
      <div class="manage-users-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Manage Users</h1>
              <p>View, edit, and manage user accounts</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/admin">
                <mat-icon>arrow_back</mat-icon>
                Back to Admin
              </button>
              <button mat-raised-button color="primary" 
                      *ngIf="canCreateUser()" 
                      (click)="openCreateUserDialog()">
                <mat-icon>person_add</mat-icon>
                Add User
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Section -->
        <app-users-stats [stats]="statsData"></app-users-stats>

        <!-- Search and Filter Section -->
        <app-users-filters 
          [filters]="filters"
          (onFiltersChange)="onFiltersChange($event)">
        </app-users-filters>

        <!-- Users Table -->
        <app-users-table 
          [users]="filteredUsers"
          [currentUser]="currentUser"
          [selectedUsers]="selectedUsers"
          [pageSize]="pageSize"
          [currentPage]="currentPage"
          (onEditUser)="editUser($event)"
          (onDeleteUser)="deleteUser($event)"
          (onToggleUserStatus)="toggleUserStatus($event)"
          (onBulkDelete)="bulkDelete($event)"
          (onBulkActivate)="bulkActivate($event)"
          (pageChange)="onPageChange($event)">
        </app-users-table>
      </div>
  `,
  styles: [`
    .manage-users-container {
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
      .manage-users-container {
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
export class ManageUsersComponent implements OnInit, OnDestroy {
  filteredUsers: User[] = [];
  statsData: UserStats = {
    totalUsers: 0,
    superAdmins: 0,
    groupAdmins: 0,
    activeUsers: 0
  };
  filters: UserFilters = {
    searchTerm: '',
    role: '',
    status: ''
  };
  selectedUsers: string[] = [];
  currentUser: User | null = null;
  pageSize = 10;
  currentPage = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private usersManagementService: UsersManagementService,
    private dialog: MatDialog,
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
    // Subscribe to filtered users
    this.usersManagementService.filteredUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.filteredUsers = users;
      });

    // Subscribe to statistics
    this.usersManagementService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.statsData = stats;
      });
  }

  /**
   * Handle filters change
   */
  onFiltersChange(filters: UserFilters): void {
    this.filters = filters;
    this.usersManagementService.filterUsers(filters);
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  /**
   * Check if current user can create users
   */
  canCreateUser(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN) ||
      this.currentUser.roles.includes(UserRole.GROUP_ADMIN);
  }

  /**
   * Open create user dialog
   */
  openCreateUserDialog(): void {
    const dialogData: UserFormData = {
      canCreateSuperAdmin: this.usersManagementService.canCreateSuperAdmin(this.currentUser!),
      isEditMode: false
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<void> {
    try {
      const result = await this.usersManagementService.createUser(userData, this.currentUser!);

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
      console.error('Error creating user:', error);
      this.snackBar.open('Failed to create user. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Edit user
   */
  editUser(user: User): void {
    const dialogData: UserFormData = {
      user: user,
      canCreateSuperAdmin: this.usersManagementService.canCreateSuperAdmin(this.currentUser!),
      isEditMode: true
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(user.id, result);
      }
    });
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const result = await this.usersManagementService.updateUser(userId, updates, this.currentUser!);

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
      console.error('Error updating user:', error);
      this.snackBar.open('Failed to update user. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(user: User): Promise<void> {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      try {
        const result = await this.usersManagementService.deleteUser(user.id, this.currentUser!);

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
        console.error('Error deleting user:', error);
        this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(user: User): Promise<void> {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
      try {
        const updates = { isActive: !user.isActive };
        const result = await this.usersManagementService.updateUser(user.id, updates, this.currentUser!);

        if (result.success) {
          this.snackBar.open(`User ${action}d successfully`, 'Close', {
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
        console.error('Error toggling user status:', error);
        this.snackBar.open('Failed to update user status. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Bulk delete users
   */
  async bulkDelete(userIds: string[]): Promise<void> {
    if (confirm(`Are you sure you want to delete ${userIds.length} users?`)) {
      try {
        const result = await this.usersManagementService.bulkDeleteUsers(userIds, this.currentUser!);

        if (result.success) {
          this.selectedUsers = [];
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
        console.error('Error bulk deleting users:', error);
        this.snackBar.open('Failed to delete users. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Bulk activate users
   */
  async bulkActivate(userIds: string[]): Promise<void> {
    try {
      const result = await this.usersManagementService.bulkActivateUsers(userIds, this.currentUser!);

      if (result.success) {
        this.selectedUsers = [];
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
      console.error('Error bulk activating users:', error);
      this.snackBar.open('Failed to activate users. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}