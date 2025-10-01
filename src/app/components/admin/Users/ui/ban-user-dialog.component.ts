import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../../../models/user.model';

export interface BanUserDialogData {
  channelName: string;
  availableUsers: User[];
  onBan: (userId: string, reason: string) => void;
}

@Component({
  selector: 'app-ban-user-dialog',
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
    <div class="ban-user-dialog">
      <h2 mat-dialog-title>Ban User from Channel</h2>
      <mat-dialog-content>
        <p class="dialog-description">
          Select a user to ban from <strong>{{ data.channelName }}</strong>
        </p>
        
        <form [formGroup]="banForm" class="ban-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Select User to Ban</mat-label>
            <mat-select formControlName="userId">
              <mat-option value="">Select User</mat-option>
              <mat-option *ngFor="let user of data.availableUsers" [value]="user.id">
                {{ user.username }} ({{ user.email }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="banForm.get('userId')?.hasError('required')">
              Please select a user to ban
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Ban</mat-label>
            <textarea matInput 
                      formControlName="reason" 
                      rows="3" 
                      placeholder="Enter reason for banning this user..."></textarea>
            <mat-error *ngIf="banForm.get('reason')?.hasError('maxlength')">
              Reason must not exceed 200 characters
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" 
                [disabled]="banForm.invalid" 
                (click)="onBan()">
          Ban User
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .ban-user-dialog {
      min-width: 500px;
    }

    .dialog-description {
      margin-bottom: 24px;
      color: #666;
    }

    .ban-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 600px) {
      .ban-user-dialog {
        min-width: 300px;
      }
    }
  `]
})
export class BanUserDialogComponent {
  banForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BanUserDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: BanUserDialogData
  ) {
    this.banForm = this.fb.group({
      userId: ['', Validators.required],
      reason: ['', [Validators.maxLength(200)]]
    });
  }

  onBan(): void {
    if (this.banForm.valid) {
      const { userId, reason } = this.banForm.value;
      this.data.onBan(userId, reason || 'No reason provided');
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
