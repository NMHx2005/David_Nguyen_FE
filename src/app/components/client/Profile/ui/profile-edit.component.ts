import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface EditData {
  newUsername: string;
  newEmail: string;
  currentPassword: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="section">
      <div class="section-header">
        <mat-icon>edit</mat-icon>
        <h2>Edit Profile</h2>
      </div>
      <mat-divider></mat-divider>

      <mat-card class="edit-card">
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #editForm="ngForm" class="edit-form">
            <!-- Avatar Upload Section -->
            <div class="avatar-section">
              <h3>Profile Picture</h3>
              <div class="avatar-upload">
                <input 
                  type="file" 
                  #fileInput 
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  style="display: none;">
                <button 
                  mat-button 
                  type="button"
                  (click)="fileInput.click()"
                  class="upload-button">
                  <mat-icon>cloud_upload</mat-icon>
                  Upload Avatar
                </button>
                <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Basic Information -->
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

            <mat-divider></mat-divider>

            <!-- Password Change Section -->
            <div class="password-section">
              <h3>Change Password (Optional)</h3>
              <mat-form-field appearance="outline" class="password-field">
                <mat-label>Current Password</mat-label>
                <input
                  matInput
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  [(ngModel)]="editData.currentPassword"
                  placeholder="Enter your current password">
                <mat-icon matSuffix>lock</mat-icon>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>New Password</mat-label>
                  <input
                    matInput
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    [(ngModel)]="editData.newPassword"
                    placeholder="Enter new password">
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Confirm New Password</mat-label>
                  <input
                    matInput
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    [(ngModel)]="editData.confirmPassword"
                    placeholder="Confirm new password">
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="isSubmitting || !isFormValid()">
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                <span *ngIf="!isSubmitting">Update Profile</span>
              </button>
              
              <button 
                mat-button 
                type="button" 
                (click)="onReset()"
                [disabled]="isSubmitting">
                Reset
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
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
      font-size: 24px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .edit-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-top: 16px;
    }

    .edit-form {
      padding: 16px 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field, .password-field {
      width: 100%;
    }

    .avatar-section, .password-section {
      margin-bottom: 24px;
    }

    .avatar-section h3, .password-section h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
    }

    .avatar-upload {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .upload-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-name {
      color: #666;
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .form-actions button {
      min-width: 120px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class ProfileEditComponent {
  @Input() editData: EditData = {
    newUsername: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  @Input() currentUser: any = null;
  @Input() isSubmitting: boolean = false;

  @Output() submit = new EventEmitter<EditData>();
  @Output() reset = new EventEmitter<void>();
  @Output() avatarUpload = new EventEmitter<File>();

  selectedFile: File | null = null;

  onSubmit(): void {
    this.submit.emit(this.editData);
  }

  onReset(): void {
    this.reset.emit();
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      this.selectedFile = file;
      this.avatarUpload.emit(file);
    }
  }

  isFormValid(): boolean {
    if (!this.currentUser) return false;

    // Check if there are any changes to username or email compared to current values
    const usernameChanged = (this.editData.newUsername?.trim() || '') !== (this.currentUser.username || '');
    const emailChanged = (this.editData.newEmail?.trim() || '') !== (this.currentUser.email || '');
    const hasBasicChanges = usernameChanged || emailChanged;

    // Check if password change is attempted
    const hasPasswordChange = (this.editData.newPassword?.trim() || '') !== '' || (this.editData.confirmPassword?.trim() || '') !== '';

    // If password change is attempted, current password is required
    if (hasPasswordChange) {
      return (this.editData.currentPassword?.trim() || '') !== '' &&
        (this.editData.newPassword?.trim() || '') !== '' &&
        (this.editData.confirmPassword?.trim() || '') !== '';
    }

    // If only basic changes, no password required
    return hasBasicChanges;
  }
}
