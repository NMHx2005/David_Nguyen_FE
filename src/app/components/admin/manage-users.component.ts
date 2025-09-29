import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';
import { User, UserRole } from '../../models/user.model';

// Create User Dialog Component
@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule
  ],
  template: `
    <div class="create-user-dialog">
      <h2 mat-dialog-title>Create New User</h2>
      <mat-dialog-content>
        <form [formGroup]="userForm" class="user-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Enter username">
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
            <mat-error *ngIf="userForm.get('username')?.hasError('minlength')">
              Username must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email">
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Enter password">
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="USER">User</mat-option>
              <mat-option value="GROUP_ADMIN">Group Admin</mat-option>
              <mat-option value="SUPER_ADMIN" *ngIf="canCreateSuperAdmin">Super Admin</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('role')?.hasError('required')">
              Role is required
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="userForm.invalid" 
                (click)="onCreate()">
          Create User
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-user-dialog {
      min-width: 400px;
    }
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CreateUserDialogComponent {
  userForm: FormGroup;
  canCreateSuperAdmin = false;

  constructor(
    public dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      onCreate: (user: Partial<User>) => void,
      canCreateSuperAdmin: boolean
    }
  ) {
    this.canCreateSuperAdmin = data.canCreateSuperAdmin;
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }

  onCreate(): void {
    if (this.userForm.valid) {
      this.data.onCreate(this.userForm.value);
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

// Edit User Dialog Component
@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule
  ],
  template: `
    <div class="edit-user-dialog">
      <h2 mat-dialog-title>Edit User</h2>
      <mat-dialog-content>
        <form [formGroup]="userForm" class="user-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Enter username">
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
            <mat-error *ngIf="userForm.get('username')?.hasError('minlength')">
              Username must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email">
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="USER">User</mat-option>
              <mat-option value="GROUP_ADMIN">Group Admin</mat-option>
              <mat-option value="SUPER_ADMIN" *ngIf="canEditToSuperAdmin">Super Admin</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('role')?.hasError('required')">
              Role is required
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="userForm.invalid" 
                (click)="onSave()">
          Save Changes
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-user-dialog {
      min-width: 400px;
    }
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class EditUserDialogComponent {
  userForm: FormGroup;
  canEditToSuperAdmin = false;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      user: User,
      onSave: (user: Partial<User>) => void,
      canEditToSuperAdmin: boolean
    }
  ) {
    this.canEditToSuperAdmin = data.canEditToSuperAdmin;
    this.userForm = this.fb.group({
      username: [data.user.username, [Validators.required, Validators.minLength(3)]],
      email: [data.user.email, [Validators.required, Validators.email]],
      role: [data.user.roles[0], Validators.required]
    });
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.data.onSave(this.userForm.value);
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout [pageTitle]="'Manage Users'">
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
      <mat-card class="stats-card">
        <mat-card-content>
          <div class="stats-grid">
            <div class="stat-item">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-content">
                <span class="stat-number">{{ getTotalUsersCount() }}</span>
                <span class="stat-label">Total Users</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon class="stat-icon">admin_panel_settings</mat-icon>
              <div class="stat-content">
                <span class="stat-number">{{ getSuperAdminsCount() }}</span>
                <span class="stat-label">Super Admins</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon class="stat-icon">group_work</mat-icon>
              <div class="stat-content">
                <span class="stat-number">{{ getGroupAdminsCount() }}</span>
                <span class="stat-label">Group Admins</span>
              </div>
            </div>
            <div class="stat-item">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-content">
                <span class="stat-number">{{ getActiveUsersCount() }}</span>
                <span class="stat-label">Active Users</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Search and Filter Section -->
      <mat-card class="search-section-card">
        <mat-card-content>
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <input matInput
                     [(ngModel)]="searchTerm"
                     placeholder="Search by username, email, or role..."
                     (input)="filterUsers()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="filter-options">
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Role</mat-label>
                <mat-select [(ngModel)]="selectedRole" (selectionChange)="filterUsers()">
                  <mat-option value="">All Roles</mat-option>
                  <mat-option value="SUPER_ADMIN">Super Admin</mat-option>
                  <mat-option value="GROUP_ADMIN">Group Admin</mat-option>
                  <mat-option value="USER">User</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterUsers()">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                  <mat-option value="suspended">Suspended</mat-option>
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

      <!-- Users Table -->
      <mat-card class="users-table-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Users ({{ filteredUsers.length }})
          </mat-card-title>
          <div class="bulk-actions" *ngIf="selectedUsers.length > 0">
            <mat-chip color="accent">
              <mat-icon>check_circle</mat-icon>
              {{ selectedUsers.length }} selected
            </mat-chip>
            <button mat-raised-button color="warn" (click)="bulkDelete()">
              <mat-icon>delete</mat-icon>
              Delete Selected
            </button>
            <button mat-raised-button color="primary" (click)="bulkActivate()">
              <mat-icon>check_circle</mat-icon>
              Activate Selected
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="paginatedUsers" class="users-table">
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox 
                    [checked]="isAllSelected()" 
                    (change)="toggleSelectAll()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let user">
                  <mat-checkbox 
                    [checked]="isUserSelected(user.id)" 
                    (change)="toggleUserSelection(user.id)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- User Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="user-details">
                      <span class="username">{{ user.username }}</span>
                      <span class="email">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="getRoleColor(user.roles[0])" class="role-chip">
                    <mat-icon>{{ getRoleIcon(user.roles[0]) }}</mat-icon>
                    {{ getRoleDisplayName(user.roles[0]) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Groups Column -->
              <ng-container matColumnDef="groups">
                <th mat-header-cell *matHeaderCellDef>Groups</th>
                <td mat-cell *matCellDef="let user">
                  <div class="groups-list">
                    <mat-chip *ngFor="let groupId of user.groups.slice(0, 2)" class="group-chip">
                      {{ getGroupName(groupId) }}
                    </mat-chip>
                    <mat-chip *ngIf="user.groups.length > 2" class="more-chip">
                      +{{ user.groups.length - 2 }} more
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="getStatusColor(user.isActive)" class="status-chip">
                    <mat-icon>{{ getStatusIcon(user.isActive) }}</mat-icon>
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Created Column -->
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let user">
                  {{ user.createdAt | date:'shortDate' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="userMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #userMenu="matMenu">
                    <button mat-menu-item 
                            *ngIf="canEditUser(user)" 
                            (click)="editUser(user)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item 
                            *ngIf="canToggleUserStatus(user)" 
                            (click)="toggleUserStatus(user)">
                      <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
                    </button>
                    <button mat-menu-item 
                            *ngIf="canPromoteUser(user)" 
                            (click)="promoteUser(user)">
                      <mat-icon>trending_up</mat-icon>
                      <span>Promote to Group Admin</span>
                    </button>
                    <button mat-menu-item 
                            *ngIf="canDeleteUser(user)" 
                            (click)="deleteUser(user)" 
                            class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredUsers.length === 0" class="empty-state">
            <mat-icon class="empty-icon">people</mat-icon>
            <h3>No Users Found</h3>
            <p>Try adjusting your search criteria or create a new user.</p>
          </div>

          <!-- Pagination -->
          <mat-paginator 
            *ngIf="totalPages > 1"
            [length]="filteredUsers.length"
            [pageSize]="itemsPerPage"
            [pageIndex]="currentPage - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
    </app-admin-layout>
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

    .users-table-card {
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

    .bulk-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
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

    .email {
      font-size: 0.85rem;
      color: #666;
    }

    .role-chip, .status-chip, .group-chip {
      font-size: 0.8rem;
    }

    .more-chip {
      background-color: #f5f5f5;
      color: #666;
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

    .delete-action {
      color: #f44336;
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

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .filter-options {
        flex-direction: column;
      }

      .mat-card-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .bulk-actions {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class ManageUsersComponent implements OnInit {
  displayedColumns: string[] = ['select', 'user', 'role', 'groups', 'status', 'created', 'actions'];

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  selectedUsers: string[] = [];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  loadUsers(): void {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.allUsers = JSON.parse(storedUsers);
    } else {
      this.initializeDefaultUsers();
    }
    this.filterUsers();
  }

  initializeDefaultUsers(): void {
    this.allUsers = [
      {
        id: '1',
        username: 'super',
        email: 'super@example.com',
        roles: [UserRole.SUPER_ADMIN],
        groups: ['1', '2'], // Development Team, Design Team
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        username: 'admin',
        email: 'admin@example.com',
        roles: [UserRole.GROUP_ADMIN],
        groups: ['1', '3'], // Development Team, Marketing Team
        isActive: true,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date()
      },
      {
        id: '3',
        username: 'user',
        email: 'user@example.com',
        roles: [UserRole.USER],
        groups: ['1'], // Development Team
        isActive: true,
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date()
      },
      {
        id: '4',
        username: 'john_doe',
        email: 'john@example.com',
        roles: [UserRole.USER],
        groups: ['2'], // Design Team
        isActive: true,
        createdAt: new Date('2025-02-15'),
        updatedAt: new Date()
      },
      {
        id: '5',
        username: 'jane_smith',
        email: 'jane@example.com',
        roles: [UserRole.GROUP_ADMIN],
        groups: ['3'], // Marketing Team
        isActive: false,
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date()
      }
    ];
    this.updateUsers();
  }

  updateUsers(): void {
    localStorage.setItem('users', JSON.stringify(this.allUsers));
  }

  filterUsers(): void {
    let filtered = this.allUsers;

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.roles.some((role: string) => role.toLowerCase().includes(term))
      );
    }

    // Role filter
    if (this.selectedRole) {
      filtered = filtered.filter(user =>
        user.roles.includes(this.selectedRole as UserRole)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    this.filteredUsers = filtered;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedUsers();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.totalPages = Math.max(1, this.totalPages);
  }

  updatePaginatedUsers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.updatePaginatedUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filterUsers();
  }

  // Permission checks
  canCreateUser(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN) ||
      this.currentUser.roles.includes(UserRole.GROUP_ADMIN);
  }

  canEditUser(user: User): boolean {
    if (!this.currentUser) return false;
    // Super admin can edit anyone
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    // Group admin can edit users in their groups
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return this.currentUser.groups.some(groupId => user.groups.includes(groupId));
    }
    return false;
  }

  canDeleteUser(user: User): boolean {
    if (!this.currentUser) return false;
    // Cannot delete self
    if (user.id === this.currentUser.id) return false;
    // Super admin can delete anyone
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    // Group admin can delete users in their groups (but not other admins)
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return user.roles.includes(UserRole.USER) &&
        this.currentUser.groups.some(groupId => user.groups.includes(groupId));
    }
    return false;
  }

  canToggleUserStatus(user: User): boolean {
    if (!this.currentUser) return false;
    // Cannot toggle own status
    if (user.id === this.currentUser.id) return false;
    // Super admin can toggle anyone
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    // Group admin can toggle users in their groups
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      return this.currentUser.groups.some(groupId => user.groups.includes(groupId));
    }
    return false;
  }

  canPromoteUser(user: User): boolean {
    if (!this.currentUser) return false;
    // Only Super Admin can promote users
    if (!this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return false;
    // Can only promote regular users to Group Admin
    return user.roles.includes(UserRole.USER);
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = this.paginatedUsers.map(user => user.id);
    }
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.length > 0 && this.selectedUsers.length === this.paginatedUsers.length;
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers.includes(userId);
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'Super Admin';
      case UserRole.GROUP_ADMIN: return 'Group Admin';
      case UserRole.USER: return 'User';
      default: return 'Unknown';
    }
  }

  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'warn';
      case UserRole.GROUP_ADMIN: return 'accent';
      case UserRole.USER: return 'primary';
      default: return 'primary';
    }
  }

  getRoleIcon(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'admin_panel_settings';
      case UserRole.GROUP_ADMIN: return 'group_work';
      case UserRole.USER: return 'person';
      default: return 'person';
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'check_circle' : 'block';
  }

  getGroupName(groupId: string): string {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      const groups = JSON.parse(storedGroups);
      const group = groups.find((g: any) => g.id === groupId);
      return group ? group.name : groupId;
    }
    return groupId;
  }

  // Statistics methods
  getTotalUsersCount(): number {
    return this.allUsers.length;
  }

  getSuperAdminsCount(): number {
    return this.allUsers.filter(user => user.roles.includes(UserRole.SUPER_ADMIN)).length;
  }

  getGroupAdminsCount(): number {
    return this.allUsers.filter(user => user.roles.includes(UserRole.GROUP_ADMIN)).length;
  }

  getActiveUsersCount(): number {
    return this.allUsers.filter(user => user.isActive).length;
  }

  // CRUD operations
  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '500px',
      data: {
        onCreate: (userData: Partial<User>) => {
          const newUser: User = {
            id: Date.now().toString(),
            username: userData.username!,
            email: userData.email!,
            roles: [userData.role as UserRole],
            groups: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.allUsers.push(newUser);
          this.updateUsers();
          this.filterUsers();
          this.snackBar.open(`User "${newUser.username}" created successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        canCreateSuperAdmin: this.isSuperAdmin
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '500px',
      data: {
        user: user,
        onSave: (userData: Partial<User>) => {
          const userIndex = this.allUsers.findIndex(u => u.id === user.id);
          if (userIndex > -1) {
            this.allUsers[userIndex] = {
              ...this.allUsers[userIndex],
              username: userData.username!,
              email: userData.email!,
              roles: [userData.role as UserRole],
              updatedAt: new Date()
            };
            this.updateUsers();
            this.filterUsers();
            this.snackBar.open(`User "${user.username}" updated successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }
        },
        canEditToSuperAdmin: this.isSuperAdmin
      }
    });
  }

  async toggleUserStatus(user: User): Promise<void> {
    try {
      const userIndex = this.allUsers.findIndex(u => u.id === user.id);
      if (userIndex > -1) {
        this.allUsers[userIndex].isActive = !this.allUsers[userIndex].isActive;
        this.allUsers[userIndex].updatedAt = new Date();
        this.updateUsers();
        this.filterUsers();
        this.snackBar.open(`User "${user.username}" ${user.isActive ? 'deactivated' : 'activated'} successfully`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      this.snackBar.open('Failed to update user status. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async promoteUser(user: User): Promise<void> {
    if (!confirm(`Are you sure you want to promote "${user.username}" to Group Admin?`)) {
      return;
    }

    try {
      const userIndex = this.allUsers.findIndex(u => u.id === user.id);
      if (userIndex > -1) {
        this.allUsers[userIndex].roles = [UserRole.GROUP_ADMIN];
        this.allUsers[userIndex].updatedAt = new Date();
        this.updateUsers();
        this.filterUsers();

        this.snackBar.open(`User "${user.username}" promoted to Group Admin successfully`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      this.snackBar.open('Failed to promote user. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async deleteUser(user: User): Promise<void> {
    if (!confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Remove user from all groups
      this.removeUserFromGroups(user.id);

      this.allUsers = this.allUsers.filter(u => u.id !== user.id);
      this.selectedUsers = this.selectedUsers.filter(id => id !== user.id);
      this.updateUsers();
      this.filterUsers();

      this.snackBar.open(`User "${user.username}" deleted successfully`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async bulkDelete(): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${this.selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }

    try {
      // Remove users from all groups
      this.selectedUsers.forEach(userId => this.removeUserFromGroups(userId));

      this.allUsers = this.allUsers.filter(u => !this.selectedUsers.includes(u.id));
      this.selectedUsers = [];
      this.updateUsers();
      this.filterUsers();

      this.snackBar.open('Users deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to delete users. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async bulkActivate(): Promise<void> {
    try {
      this.allUsers.forEach(user => {
        if (this.selectedUsers.includes(user.id)) {
          user.isActive = true;
          user.updatedAt = new Date();
        }
      });

      this.selectedUsers = [];
      this.updateUsers();
      this.filterUsers();

      this.snackBar.open('Users activated successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to activate users. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Helper methods
  removeUserFromGroups(userId: string): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      const groups = JSON.parse(storedGroups);
      groups.forEach((group: any) => {
        group.members = group.members.filter((memberId: string) => memberId !== userId);
        group.admins = group.admins.filter((adminId: string) => adminId !== userId);
      });
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }
}