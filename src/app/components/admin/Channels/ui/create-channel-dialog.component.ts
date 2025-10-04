import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Group } from '../../../../models/group.model';
import { Channel, ChannelType } from '../../../../models/channel.model';

export interface CreateChannelDialogData {
  groups: Group[];
  onCreate: (channel: Partial<Channel>) => void;
}

@Component({
  selector: 'app-create-channel-dialog',
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
    <div class="create-channel-dialog">
      <h2 mat-dialog-title>Create New Channel</h2>
      <mat-dialog-content>
        <form [formGroup]="channelForm" class="channel-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Channel Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter channel name">
            <mat-error *ngIf="channelForm.get('name')?.hasError('required')">
              Channel name is required
            </mat-error>
            <mat-error *ngIf="channelForm.get('name')?.hasError('minlength')">
              Channel name must be at least 3 characters
            </mat-error>
            <mat-error *ngIf="channelForm.get('name')?.hasError('maxlength')">
              Channel name must not exceed 30 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Group</mat-label>
            <mat-select formControlName="groupId">
              <mat-option value="">Select Group</mat-option>
              <mat-option *ngFor="let group of data.groups" [value]="group.id">
                {{ group.name }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="channelForm.get('groupId')?.hasError('required')">
              Group is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Channel Type</mat-label>
            <mat-select formControlName="type">
              <mat-option [value]="ChannelType.TEXT">Text Channel</mat-option>
              <mat-option [value]="ChannelType.VOICE">Voice Channel</mat-option>
              <mat-option [value]="ChannelType.VIDEO">Video Channel</mat-option>
            </mat-select>
            <mat-error *ngIf="channelForm.get('type')?.hasError('required')">
              Channel type is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Enter channel description"></textarea>
            <mat-error *ngIf="channelForm.get('description')?.hasError('maxlength')">
              Description must not exceed 200 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Max Members</mat-label>
            <input matInput type="number" formControlName="maxMembers" placeholder="Maximum number of members">
            <mat-error *ngIf="channelForm.get('maxMembers')?.hasError('min')">
              Max members must be at least 1
            </mat-error>
            <mat-error *ngIf="channelForm.get('maxMembers')?.hasError('max')">
              Max members must not exceed 1000
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="channelForm.invalid" 
                (click)="onCreate()">
          Create Channel
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-channel-dialog {
      min-width: 500px;
    }

    .channel-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 600px) {
      .create-channel-dialog {
        min-width: 300px;
      }
    }
  `]
})
export class CreateChannelDialogComponent {
  channelForm: FormGroup;

  // Expose ChannelType enum to template
  ChannelType = ChannelType;

  constructor(
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: CreateChannelDialogData
  ) {
    this.channelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      groupId: ['', Validators.required],
      type: [ChannelType.TEXT, Validators.required],
      description: ['', Validators.maxLength(200)],
      maxMembers: [100, [Validators.min(1), Validators.max(1000)]]
    });
  }

  onCreate(): void {
    if (this.channelForm.valid) {
      this.data.onCreate(this.channelForm.value);
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
