import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Group } from '../../models';
import { ClientLayoutComponent } from '../layouts/client-layout.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    ClientLayoutComponent
  ],
  template: `
    <app-client-layout [pageTitle]="'Profile'" [pageDescription]="'Manage your account and preferences'">
    <div class="profile-container">
      <mat-card class="profile-card">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="header-content">
            <mat-icon class="profile-avatar">account_circle</mat-icon>
            <h1>{{ currentUser?.username || 'User' }}</h1>
            <p>{{ getRoleDisplayName() }}</p>
          </div>
        </div>

        <mat-card-content class="profile-content">
          <!-- Personal Information Section -->
          <div class="section">
            <div class="section-header">
              <mat-icon>person</mat-icon>
              <h2>Personal Information</h2>
            </div>
            <mat-divider></mat-divider>
            
            <div class="info-grid">
              <mat-card class="info-card">
                <mat-card-content>
                  <div class="info-item">
                    <mat-icon>account_circle</mat-icon>
                    <div>
                      <label>Username</label>
                      <div class="info-value">{{ currentUser?.username || 'N/A' }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="info-card">
                <mat-card-content>
                  <div class="info-item">
                    <mat-icon>email</mat-icon>
                    <div>
                      <label>Email</label>
                      <div class="info-value">{{ currentUser?.email || 'N/A' }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="info-card">
                <mat-card-content>
                  <div class="info-item">
                    <mat-icon>security</mat-icon>
                    <div>
                      <label>Role</label>
                      <mat-chip-set>
                        <mat-chip [color]="getRoleColor()" selected>
                          {{ getRoleDisplayName() }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="info-card">
                <mat-card-content>
                  <div class="info-item">
                    <mat-icon>calendar_today</mat-icon>
                    <div>
                      <label>Member Since</label>
                      <div class="info-value">{{ formatDate(currentUser?.createdAt) }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Edit Profile Section -->
          <div class="section">
            <div class="section-header">
              <mat-icon>edit</mat-icon>
              <h2>Edit Profile</h2>
            </div>
            <mat-divider></mat-divider>

            <mat-card class="edit-card">
              <mat-card-content>
                <form (ngSubmit)="onSubmit()" #editForm="ngForm" class="edit-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>New Username</mat-label>
                      <input
                        matInput
                        id="newUsername"
                        name="newUsername"
                        [(ngModel)]="editData.newUsername"
                        placeholder="Enter new username">
                      <mat-icon matSuffix>person</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>New Email</mat-label>
                      <input
                        matInput
                        type="email"
                        id="newEmail"
                        name="newEmail"
                        [(ngModel)]="editData.newEmail"
                        placeholder="Enter new email">
                      <mat-icon matSuffix>email</mat-icon>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="form-field full-width">
                    <mat-label>Current Password</mat-label>
                    <input
                      matInput
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      [(ngModel)]="editData.currentPassword"
                      required
                      placeholder="Enter current password to confirm changes">
                    <mat-icon matSuffix>lock</mat-icon>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="!editData.currentPassword || isSubmitting"
                      matTooltip="Update profile information">
                      <mat-icon *ngIf="!isSubmitting">save</mat-icon>
                      <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                      {{ isSubmitting ? 'Updating...' : 'Update Profile' }}
                    </button>
                    <button
                      mat-stroked-button
                      color="accent"
                      type="button"
                      (click)="resetForm()"
                      matTooltip="Reset form">
                      <mat-icon>refresh</mat-icon>
                      Reset
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- My Groups Section -->
          <div class="section">
            <div class="section-header">
              <mat-icon>groups</mat-icon>
              <h2>My Groups</h2>
            </div>
            <mat-divider></mat-divider>

            <div class="groups-container">
              <div *ngIf="myGroups.length > 0; else emptyGroups" class="groups-list">
                <mat-card *ngFor="let group of myGroups" class="group-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar>group</mat-icon>
                    <mat-card-title>{{ group.name }}</mat-card-title>
                    <mat-card-subtitle>{{ group.description || 'No description' }}</mat-card-subtitle>
                  </mat-card-header>

                  <mat-card-content>
                    <div class="group-stats">
                      <mat-chip-set>
                        <mat-chip>
                          <mat-icon matChipAvatar>people</mat-icon>
                          {{ group.members.length }} members
                        </mat-chip>
                        <mat-chip *ngIf="isGroupAdmin(group)" color="accent" selected>
                          <mat-icon matChipAvatar>admin_panel_settings</mat-icon>
                          Admin
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button
                      mat-button
                      color="primary"
                      (click)="viewGroup(group.id)"
                      matTooltip="View group details">
                      <mat-icon>visibility</mat-icon>
                      View Group
                    </button>
                    <button
                      *ngIf="!isGroupAdmin(group)"
                      mat-button
                      color="warn"
                      (click)="confirmLeaveGroup(group)"
                      matTooltip="Leave this group">
                      <mat-icon>exit_to_app</mat-icon>
                      Leave
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>

              <ng-template #emptyGroups>
                <div class="empty-state">
                  <mat-icon class="empty-icon">group_off</mat-icon>
                  <h3>No Groups Yet</h3>
                  <p>You haven't joined any groups yet.</p>
                  <button
                    mat-raised-button
                    color="primary"
                    routerLink="/admin"
                    matTooltip="Browse available groups">
                    <mat-icon>explore</mat-icon>
                    Browse Groups
                  </button>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Account Actions Section -->
          <div class="section">
            <div class="section-header">
              <mat-icon>settings</mat-icon>
              <h2>Account Actions</h2>
            </div>
            <mat-divider></mat-divider>

            <div class="actions-container">
              <button
                mat-raised-button
                color="accent"
                (click)="logout()"
                matTooltip="Sign out of your account">
                <mat-icon>logout</mat-icon>
                Logout
              </button>

              <button
                mat-raised-button
                color="warn"
                (click)="openDeleteConfirmDialog()"
                matTooltip="Delete your account permanently">
                <mat-icon>delete_forever</mat-icon>
                Delete Account
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
    </app-client-layout>

    <!-- Delete Confirmation Dialog Template -->
    <ng-template #deleteConfirmDialog>
      <div mat-dialog-content class="dialog-content">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>Delete Account</h2>
        <p>Are you sure you want to delete your account? This action cannot be undone and will permanently remove:</p>
        <ul>
          <li>Your profile information</li>
          <li>All your messages</li>
          <li>Group memberships</li>
        </ul>
      </div>
      <div mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          color="primary"
          (click)="closeDialog()"
          matTooltip="Cancel deletion">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="deleteAccount()"
          matTooltip="Confirm account deletion">
          <mat-icon>delete_forever</mat-icon>
          Delete Account
        </button>
      </div>
    </ng-template>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .profile-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }

    .header-content mat-icon.profile-avatar {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .header-content h1 {
      margin: 16px 0 8px 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .profile-content {
      padding: 24px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-header mat-icon {
      color: #667eea;
    }

    .section-header h2 {
      margin: 0;
      color: #424242;
      font-size: 1.5rem;
      font-weight: 400;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .info-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .info-item mat-icon {
      color: #667eea;
    }

    .info-item label {
      font-weight: 500;
      color: #757575;
      font-size: 0.9rem;
      margin-bottom: 4px;
      display: block;
    }

    .info-value {
      color: #424242;
      font-size: 1rem;
    }

    .edit-card {
      margin-top: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    .groups-container {
      margin-top: 16px;
    }

    .groups-list {
      display: grid;
      gap: 16px;
    }

    .group-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .group-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .group-stats {
      margin-top: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #757575;
    }

    .empty-state .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #424242;
    }

    .empty-state p {
      margin-bottom: 24px;
      font-size: 1rem;
    }

    .actions-container {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }

    .dialog-content {
      text-align: center;
      padding: 24px;
    }

    .warning-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .dialog-content h2 {
      margin: 16px 0;
      color: #424242;
    }

    .dialog-content p {
      margin-bottom: 16px;
      color: #757575;
      line-height: 1.5;
    }

    .dialog-content ul {
      text-align: left;
      color: #757575;
      margin: 16px 0;
    }

    .dialog-actions {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .actions-container {
        flex-direction: column;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Material Design color overrides */
    .mat-mdc-raised-button.mat-primary {
      --mdc-protected-button-container-color: #667eea;
    }

    .mat-mdc-raised-button.mat-accent {
      --mdc-protected-button-container-color: #764ba2;
    }

    .mat-mdc-chip.mat-mdc-standard-chip.mat-accent {
      --mdc-chip-elevated-container-color: #764ba2;
    }
  `]
})
export class ProfileComponent implements OnInit {
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

  currentUser: any = null;
  myGroups: any[] = [];
  editData = {
    newUsername: '',
    newEmail: '',
    currentPassword: ''
  };
  isSubmitting = false;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserGroups();
  }

  getRoleDisplayName(): string {
    if (this.authService.isSuperAdmin()) return 'Super Administrator';
    if (this.authService.isGroupAdmin()) return 'Group Administrator';
    return 'User';
  }

  getRoleColor(): string {
    if (this.authService.isSuperAdmin()) return 'warn';
    if (this.authService.isGroupAdmin()) return 'accent';
    return 'primary';
  }

  isGroupAdmin(group: any): boolean {
    return group.admins.includes(this.currentUser.username);
  }

  loadUserGroups(): void {
    // Mock data for Phase 1
    this.myGroups = [
      {
        id: '1',
        name: 'Development Team',
        description: 'Main development team for the chat system project.',
        members: ['super', 'admin', 'user'],
        admins: ['super', 'admin']
      },
      {
        id: '2',
        name: 'Design Team',
        description: 'Creative discussions and design feedback.',
        members: ['admin', 'user'],
        admins: ['admin']
      }
    ];
  }

  async onSubmit(): Promise<void> {
    if (!this.editData.currentPassword) {
      this.showSnackBar('Please enter your current password.', 'error');
      return;
    }

    this.isSubmitting = true;

    try {
      // Mock update for Phase 1
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.showSnackBar('Profile updated successfully!', 'success');
      this.resetForm();
    } catch (error) {
      this.showSnackBar('Failed to update profile. Please try again.', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm(): void {
    this.editData = {
      newUsername: '',
      newEmail: '',
      currentPassword: ''
    };
  }

  viewGroup(groupId: string): void {
    this.router.navigate(['/admin'], { queryParams: { group: groupId } });
  }

  confirmLeaveGroup(group: any): void {
    const dialogRef = this.dialog.open(this.deleteConfirmDialog);
    // Custom confirmation for leaving group
    const snackBarRef = this.snackBar.open(
      `Leave "${group.name}"?`,
      'LEAVE',
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.leaveGroup(group.id);
    });
  }

  leaveGroup(groupId: string): void {
    // Mock leave group for Phase 1
    this.myGroups = this.myGroups.filter(g => g.id !== groupId);
    this.showSnackBar('Successfully left the group.', 'success');
  }

  openDeleteConfirmDialog(): void {
    this.dialogRef = this.dialog.open(this.deleteConfirmDialog, {
      width: '400px',
      disableClose: true
    });
  }

  deleteAccount(): void {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.snackBar.open('No user found to delete', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Remove user from all groups
      this.removeUserFromAllGroups(currentUser.id);

      // Remove user from all channels
      this.removeUserFromAllChannels(currentUser.id);

      // Remove user from users list
      this.removeUserFromUsersList(currentUser.id);

      // Clear user data
      this.closeDialog();
      this.authService.logout();

      this.snackBar.open('Account deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.router.navigate(['/login']);
    } catch (error) {
      this.snackBar.open('Failed to delete account. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeUserFromAllGroups(userId: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    groups.forEach((group: any) => {
      group.members = group.members.filter((id: string) => id !== userId);
      group.admins = group.admins.filter((id: string) => id !== userId);
    });
    localStorage.setItem('groups', JSON.stringify(groups));
  }

  removeUserFromAllChannels(userId: string): void {
    const channels = JSON.parse(localStorage.getItem('channels') || '[]');
    channels.forEach((channel: any) => {
      channel.members = channel.members.filter((id: string) => id !== userId);
      channel.bannedUsers = channel.bannedUsers.filter((id: string) => id !== userId);
      channel.memberCount = channel.members.length;
    });
    localStorage.setItem('channels', JSON.stringify(channels));
  }

  removeUserFromUsersList(userId: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((user: any) => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'CLOSE', {
      duration: 4000,
      panelClass: [`snack-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}