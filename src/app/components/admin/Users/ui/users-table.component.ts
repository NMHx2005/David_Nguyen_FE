import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { User, UserRole } from '../../../../models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatCardModule,
    MatPaginatorModule
  ],
  template: `
    <mat-card class="users-table-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>people</mat-icon>
          Users ({{ users.length }})
        </mat-card-title>
        <div class="bulk-actions" *ngIf="selectedUsers.length > 0">
          <mat-chip color="accent">
            <mat-icon>check_circle</mat-icon>
            {{ selectedUsers.length }} selected
          </mat-chip>
          <button mat-raised-button color="warn" 
                  *ngIf="!isReadOnly" 
                  (click)="onBulkDelete.emit(selectedUsers)">
            <mat-icon>delete</mat-icon>
            Delete Selected
          </button>
          <button mat-raised-button color="primary" 
                  *ngIf="!isReadOnly" 
                  (click)="onBulkActivate.emit(selectedUsers)">
            <mat-icon>check_circle</mat-icon>
            Activate Selected
          </button>
          <mat-chip *ngIf="isReadOnly" color="warn" class="read-only-chip">
            <mat-icon>visibility</mat-icon>
            Read-only mode
          </mat-chip>
        </div>
      </mat-card-header>
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="paginatedUsers" class="users-table">
            <!-- Checkbox Column -->
            <ng-container matColumnDef="select" *ngIf="!isReadOnly">
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
            <ng-container matColumnDef="actions" *ngIf="!isReadOnly">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="userMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #userMenu="matMenu">
                  <button mat-menu-item 
                          *ngIf="canEditUser(user)" 
                          (click)="onEditUser.emit(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item 
                          *ngIf="canDeleteUser(user)" 
                          (click)="onDeleteUser.emit(user)"
                          class="delete-action">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                  <button mat-menu-item 
                          *ngIf="canToggleUserStatus(user)" 
                          (click)="onToggleUserStatus.emit(user)">
                    <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                    <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="users.length > pageSize"
          [length]="users.length"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="pageChange.emit($event)"
          showFirstLastButtons>
        </mat-paginator>

        <!-- Empty State -->
        <div *ngIf="users.length === 0" class="empty-state">
          <mat-icon class="empty-icon">people_off</mat-icon>
          <h3>No Users Found</h3>
          <p>Try adjusting your search criteria or create a new user.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
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
      gap: 12px;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .users-table th.mat-header-cell {
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

    .read-only-chip {
      background-color: #ff9800;
      color: white;
      font-weight: 500;
    }

    .delete-action {
      color: #f44336;
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
export class UsersTableComponent implements OnInit, OnDestroy {
  @Input() users: User[] = [];
  @Input() currentUser: User | null = null;
  @Input() selectedUsers: string[] = [];
  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Input() isReadOnly = false;

  @Output() onEditUser = new EventEmitter<User>();
  @Output() onDeleteUser = new EventEmitter<User>();
  @Output() onToggleUserStatus = new EventEmitter<User>();
  @Output() onBulkDelete = new EventEmitter<string[]>();
  @Output() onBulkActivate = new EventEmitter<string[]>();
  @Output() pageChange = new EventEmitter<any>();

  get displayedColumns(): string[] {
    const baseColumns = ['user', 'role', 'status', 'created'];
    if (!this.isReadOnly) {
      return ['select', ...baseColumns, 'actions'];
    }
    return baseColumns;
  }

  private destroy$ = new Subject<void>();

  get paginatedUsers(): User[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.users.slice(startIndex, endIndex);
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.length > 0 && this.selectedUsers.length === this.paginatedUsers.length;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      // Remove all users from current page
      this.paginatedUsers.forEach(user => {
        const index = this.selectedUsers.indexOf(user.id);
        if (index > -1) {
          this.selectedUsers.splice(index, 1);
        }
      });
    } else {
      // Add all users from current page
      this.paginatedUsers.forEach(user => {
        if (!this.selectedUsers.includes(user.id)) {
          this.selectedUsers.push(user.id);
        }
      });
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers.includes(userId);
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }


  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'warn';
      case UserRole.GROUP_ADMIN: return 'primary';
      case UserRole.USER: return 'accent';
      default: return 'primary';
    }
  }

  getRoleIcon(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'admin_panel_settings';
      case UserRole.GROUP_ADMIN: return 'group_work';
      case UserRole.USER: return 'person';
      default: return 'help';
    }
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'Super Admin';
      case UserRole.GROUP_ADMIN: return 'Group Admin';
      case UserRole.USER: return 'User';
      default: return role;
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'check_circle' : 'cancel';
  }

  canEditUser(user: User): boolean {
    if (!this.currentUser || this.isReadOnly) return false;
    // Only Super Admin can edit users
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  canDeleteUser(user: User): boolean {
    if (!this.currentUser || this.isReadOnly) return false;
    if (this.currentUser.id === user.id) return false; // Can't delete self
    // Only Super Admin can delete users
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }

  canToggleUserStatus(user: User): boolean {
    if (!this.currentUser || this.isReadOnly) return false;
    if (this.currentUser.id === user.id) return false; // Can't toggle own status
    // Only Super Admin can toggle user status
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN);
  }
}
