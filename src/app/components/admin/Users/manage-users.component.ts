import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { AdminService, AdminResponse } from '../../../services/admin.service';
import { UserService } from '../../../services/user.service';
import { UsersStatsComponent } from './ui/users-stats.component';
import { UsersFiltersComponent } from './ui/users-filters.component';
import { UsersTableComponent } from './ui/users-table.component';
import { UserFormDialogComponent, UserFormData } from './ui/user-form-dialog.component';
import { User, UserRole, UserStats, UserFilters } from '../../../models/user.model';

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
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
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
              <p *ngIf="!isReadOnly()">View, edit, and manage user accounts</p>
              <p *ngIf="isReadOnly()" class="read-only-notice">
                <mat-icon>visibility</mat-icon>
                Read-only access - You can view user information but cannot make changes
              </p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/admin">
                <mat-icon>arrow_back</mat-icon>
                Back to Admin
              </button>
              <button mat-icon-button (click)="refreshUsers()" matTooltip="Refresh Users">
                <mat-icon>refresh</mat-icon>
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

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading users...</p>
        </div>

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
          [isReadOnly]="isReadOnly()"
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

    .read-only-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff9800;
      font-weight: 500;
    }

    .read-only-notice mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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
  // Component state
  filteredUsers: User[] = [];
  allUsers: User[] = [];
  statsData: UserStats = {
    totalUsers: 0,
    superAdmins: 0,
    groupAdmins: 0,
    activeUsers: 0
  };
  filters: UserFilters = {
    searchTerm: '',
    role: 'all',
    isActive: 'all',
    sortBy: 'username',
    sortOrder: 'asc'
  };
  selectedUsers: string[] = [];
  currentUser: User | null = null;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  totalUsers = 0;
  totalPages = 0;

  // Pagination and search
  private searchSubject = new BehaviorSubject<string>('');
  private currentSearchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load users from AdminService
   */
  private loadUsers(): void {
    this.isLoading = true;

    this.adminService.getAllUsers({
      search: this.currentSearchTerm
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AdminResponse<{
          users: any[];
          total: number;
          page: number;
          pages: number;
        }>) => {
          if (response.success) {
            this.allUsers = this.mapApiUsersToLocalUsers(response.data.users);
            this.filteredUsers = this.allUsers;
            this.totalUsers = response.data.total;
            this.totalPages = response.data.pages;
            this.updateStats();
            this.isLoading = false;
          } else {
            this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  /**
   * Setup search subscription with debounce
   */
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.currentSearchTerm = searchTerm;
        this.currentPage = 0; // Reset to first page
        this.loadUsers();
      });
  }

  /**
   * Map API users to local User model
   */
  private mapApiUsersToLocalUsers(apiUsers: any[]): User[] {
    return apiUsers.map(apiUser => ({
      id: apiUser._id || apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      roles: apiUser.roles || [UserRole.USER],
      groups: apiUser.groups || [],
      isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
      createdAt: new Date(apiUser.createdAt || apiUser.created_at),
      updatedAt: new Date(apiUser.updatedAt || apiUser.updated_at)
    }));
  }

  /**
   * Update statistics based on current users
   */
  private updateStats(): void {
    // Load stats from API
    this.adminService.getUserStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.statsData = {
              totalUsers: response.data.totalUsers,
              superAdmins: response.data.superAdmins,
              groupAdmins: response.data.groupAdmins,
              activeUsers: response.data.activeUsers
            };
          }
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
          // Fallback to local calculation
          this.statsData = {
            totalUsers: this.allUsers.length,
            superAdmins: this.allUsers.filter(user => user.roles.includes(UserRole.SUPER_ADMIN)).length,
            groupAdmins: this.allUsers.filter(user => user.roles.includes(UserRole.GROUP_ADMIN)).length,
            activeUsers: this.allUsers.filter(user => user.isActive).length
          };
        }
      });
  }

  /**
   * Handle filters change
   */
  onFiltersChange(filters: UserFilters): void {
    this.filters = filters;
    this.searchSubject.next(filters.searchTerm);
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  /**
   * Refresh users data
   */
  refreshUsers(): void {
    this.loadUsers();
    this.snackBar.open('Users refreshed', 'Close', { duration: 2000 });
  }

  /**
   * Check if current user can create users
   */
  canCreateUser(): boolean {
    if (!this.currentUser) return false;
    // Only Super Admin can create users
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  /**
   * Check if current user can edit users
   */
  canEditUser(): boolean {
    if (!this.currentUser) return false;
    // Only Super Admin can edit users
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  /**
   * Check if current user can delete users
   */
  canDeleteUser(): boolean {
    if (!this.currentUser) return false;
    // Only Super Admin can delete users
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  /**
   * Check if current user can perform bulk operations
   */
  canPerformBulkOperations(): boolean {
    if (!this.currentUser) return false;
    // Only Super Admin can perform bulk operations
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  /**
   * Check if current user is read-only (Group Admin)
   */
  isReadOnly(): boolean {
    if (!this.currentUser) return true;
    // Group Admin has read-only access
    return this.currentUser.roles.includes(UserRole.GROUP_ADMIN) &&
      !this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  /**
   * Open create user dialog
   */
  openCreateUserDialog(): void {
    const dialogData: UserFormData = {
      canCreateSuperAdmin: this.canCreateSuperAdmin(),
      canCreateGroupAdmin: this.canCreateGroupAdmin(),
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
  createUser(userData: Partial<User>): void {
    this.adminService.createUser({
      username: userData.username!,
      email: userData.email!,
      password: userData.password || 'defaultPassword123',
      roles: userData.roles || [UserRole.USER]
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AdminResponse<any>) => {
          if (response.success) {
            this.snackBar.open('User created successfully', 'Close', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.loadUsers(); // Refresh the list
          } else {
            this.snackBar.open(response.message || 'Failed to create user', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.snackBar.open('Failed to create user. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Edit user
   */
  editUser(user: User): void {
    const dialogData: UserFormData = {
      user: user,
      canCreateSuperAdmin: this.canCreateSuperAdmin(),
      canCreateGroupAdmin: this.canCreateGroupAdmin(),
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
  updateUser(userId: string, updates: Partial<User>): void {
    this.adminService.updateUser(userId, {
      username: updates.username,
      email: updates.email,
      roles: updates.roles,
      isActive: updates.isActive
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AdminResponse<any>) => {
          if (response.success) {
            this.snackBar.open('User updated successfully', 'Close', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.loadUsers(); // Refresh the list
          } else {
            this.snackBar.open(response.message || 'Failed to update user', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Failed to update user. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Delete user
   */
  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.adminService.deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: AdminResponse<{ deleted: boolean }>) => {
            if (response.success) {
              this.snackBar.open('User deleted successfully', 'Close', {
                duration: 4000,
                panelClass: ['success-snackbar']
              });
              this.loadUsers(); // Refresh the list
            } else {
              this.snackBar.open(response.message || 'Failed to delete user', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  /**
   * Toggle user status
   */
  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} user "${user.username}"?`)) {
      this.adminService.updateUser(user.id, { isActive: !user.isActive })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: AdminResponse<any>) => {
            if (response.success) {
              this.snackBar.open(`User ${action}d successfully`, 'Close', {
                duration: 4000,
                panelClass: ['success-snackbar']
              });
              this.loadUsers(); // Refresh the list
            } else {
              this.snackBar.open(response.message || `Failed to ${action} user`, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Error toggling user status:', error);
            this.snackBar.open('Failed to update user status. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  /**
   * Bulk delete users
   */
  bulkDelete(userIds: string[]): void {
    if (confirm(`Are you sure you want to delete ${userIds.length} users?`)) {
      this.adminService.bulkDeleteUsers(userIds)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: AdminResponse<{ deletedCount: number }>) => {
            if (response.success) {
              this.selectedUsers = [];
              this.snackBar.open(`${response.data.deletedCount} users deleted successfully`, 'Close', {
                duration: 4000,
                panelClass: ['success-snackbar']
              });
              this.loadUsers(); // Refresh the list
            } else {
              this.snackBar.open(response.message || 'Failed to delete users', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Error bulk deleting users:', error);
            this.snackBar.open('Failed to delete users. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  /**
   * Bulk activate users
   */
  bulkActivate(userIds: string[]): void {
    this.adminService.bulkUpdateUsers(userIds, { isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AdminResponse<{ updatedCount: number }>) => {
          if (response.success) {
            this.selectedUsers = [];
            this.snackBar.open(`${response.data.updatedCount} users activated successfully`, 'Close', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.loadUsers(); // Refresh the list
          } else {
            this.snackBar.open(response.message || 'Failed to activate users', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error bulk activating users:', error);
          this.snackBar.open('Failed to activate users. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Bulk deactivate users
   */
  bulkDeactivate(userIds: string[]): void {
    this.adminService.bulkUpdateUsers(userIds, { isActive: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AdminResponse<{ updatedCount: number }>) => {
          if (response.success) {
            this.selectedUsers = [];
            this.snackBar.open(`${response.data.updatedCount} users deactivated successfully`, 'Close', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.loadUsers(); // Refresh the list
          } else {
            this.snackBar.open(response.message || 'Failed to deactivate users', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error bulk deactivating users:', error);
          this.snackBar.open('Failed to deactivate users. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Check if current user can create super admin
   */
  private canCreateSuperAdmin(): boolean {
    return this.currentUser?.roles.includes(UserRole.SUPER_ADMIN) || false;
  }

  /**
   * Check if current user can create group admin
   */
  private canCreateGroupAdmin(): boolean {
    return this.currentUser?.roles.includes(UserRole.SUPER_ADMIN) || false;
  }
}