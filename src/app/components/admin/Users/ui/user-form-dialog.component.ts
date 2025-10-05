import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { User, UserRole } from '../../../../models/user.model';

export interface UserFormData {
  user?: User;
  canCreateSuperAdmin: boolean;
  canCreateGroupAdmin: boolean;
  isEditMode: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
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
    <div class="user-form-dialog">
      <h2 mat-dialog-title>{{ data.isEditMode ? 'Edit User' : 'Create New User' }}</h2>
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

          <mat-form-field appearance="outline" class="full-width" *ngIf="!data.isEditMode">
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
              <mat-option value="user">User</mat-option>
              <mat-option value="group_admin" *ngIf="data.canCreateGroupAdmin">Group Admin</mat-option>
              <mat-option value="super_admin" *ngIf="data.canCreateSuperAdmin">Super Admin</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('role')?.hasError('required')">
              Role is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" *ngIf="data.isEditMode">
            <mat-label>Status</mat-label>
            <mat-select formControlName="isActive">
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="userForm.invalid" 
                (click)="onSubmit()">
          {{ data.isEditMode ? 'Update User' : 'Create User' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-form-dialog {
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

    @media (max-width: 480px) {
      .user-form-dialog {
        min-width: 300px;
      }
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.isEditMode && this.data.user) {
      // Populate form for editing
      this.userForm.patchValue({
        username: this.data.user.username,
        email: this.data.user.email,
        role: this.data.user.roles[0] || 'user',
        isActive: this.data.user.isActive
      });

      // Remove password validation for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      // Convert role string to array for API compatibility
      if (formData.role) {
        formData.roles = [formData.role];
        delete formData.role;
      }
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
