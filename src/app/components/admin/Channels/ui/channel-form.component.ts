import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Channel, ChannelType } from '../../../../models/channel.model';
import { Group } from '../../../../models/group.model';

/**
 * Pure UI Component - Channel Form
 * Handles channel form display and validation with no business logic
 */
@Component({
  selector: 'app-channel-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>edit</mat-icon>
          {{ isEditMode ? 'Edit Channel' : 'Create Channel' }}
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="channelForm" (ngSubmit)="onSubmit.emit(channelForm.value)">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Channel Name</mat-label>
              <input matInput 
                     formControlName="name" 
                     required 
                     minlength="2" 
                     maxlength="50"
                     placeholder="Enter channel name">
              <mat-error *ngIf="channelForm.get('name')?.hasError('required')">
                Channel name is required
              </mat-error>
              <mat-error *ngIf="channelForm.get('name')?.hasError('minlength')">
                Channel name must be at least 2 characters
              </mat-error>
              <mat-error *ngIf="channelForm.get('name')?.hasError('maxlength')">
                Channel name must not exceed 50 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput 
                        formControlName="description" 
                        rows="3"
                        maxlength="200"
                        placeholder="Enter channel description (optional)"></textarea>
              <mat-error *ngIf="channelForm.get('description')?.hasError('maxlength')">
                Description must not exceed 200 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Group</mat-label>
              <mat-select formControlName="groupId" required>
                <mat-option *ngFor="let group of groups" [value]="group.id">
                  {{ group.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="channelForm.get('groupId')?.hasError('required')">
                Group selection is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Channel Type</mat-label>
              <mat-select formControlName="type" required>
                <mat-option [value]="ChannelType.TEXT">Text Channel</mat-option>
                <mat-option [value]="ChannelType.VOICE">Voice Channel</mat-option>
                <mat-option [value]="ChannelType.VIDEO">Video Channel</mat-option>
              </mat-select>
              <mat-error *ngIf="channelForm.get('type')?.hasError('required')">
                Channel type is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Max Members</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="maxMembers" 
                     min="1" 
                     max="1000"
                     placeholder="Maximum number of members">
              <mat-error *ngIf="channelForm.get('maxMembers')?.hasError('min')">
                Max members must be at least 1
              </mat-error>
              <mat-error *ngIf="channelForm.get('maxMembers')?.hasError('max')">
                Max members must not exceed 1000
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="isEditMode">
              <mat-label>Status</mat-label>
              <mat-select formControlName="isActive">
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Privacy</mat-label>
              <mat-select formControlName="isPrivate">
                <mat-option [value]="false">Public</mat-option>
                <mat-option [value]="true">Private</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Settings Section -->
          <div class="settings-section" *ngIf="isEditMode">
            <h3>Channel Settings</h3>
            <div class="settings-grid">
              <mat-form-field appearance="outline">
                <mat-label>Slow Mode (seconds)</mat-label>
                <input matInput 
                       type="number" 
                       formControlName="slowMode" 
                       min="0" 
                       max="3600"
                       placeholder="Delay between messages">
                <mat-error *ngIf="channelForm.get('slowMode')?.hasError('min')">
                  Slow mode must be at least 0 seconds
                </mat-error>
                <mat-error *ngIf="channelForm.get('slowMode')?.hasError('max')">
                  Slow mode must not exceed 3600 seconds
                </mat-error>
              </mat-form-field>

              <div class="checkbox-group">
                <mat-checkbox formControlName="requireApproval">
                  Require approval for new members
                </mat-checkbox>
                <mat-checkbox formControlName="allowReactions">
                  Allow reactions on messages
                </mat-checkbox>
                <mat-checkbox formControlName="allowPolls">
                  Allow polls in channel
                </mat-checkbox>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="onCancel.emit()">
              Cancel
            </button>
            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    [disabled]="!channelForm.valid || (isEditMode && channelForm.pristine)">
              <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
              {{ isEditMode ? 'Update Channel' : 'Create Channel' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-card {
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-form-field {
      width: 100%;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .settings-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #f0f0f0;
    }

    .settings-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .checkbox-group mat-checkbox {
      margin: 0;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .settings-grid {
        grid-template-columns: 1fr;
        gap: 12px;
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
export class ChannelFormComponent implements OnInit, OnChanges {
  @Input() channel: Channel | null = null;
  @Input() groups: Group[] = [];
  @Input() isEditMode: boolean = true;
  @Input() isLoading: boolean = false;

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  channelForm!: FormGroup;
  ChannelType = ChannelType;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
    if (this.channel && this.isEditMode) {
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if channel input has changed
    if (changes['channel'] && this.channel && this.isEditMode && this.channelForm) {
      console.log('Channel data changed, populating form:', this.channel);
      this.populateForm();
    }

    // Also check if groups changed
    if (changes['groups'] && this.groups && this.groups.length > 0) {
      console.log('Groups loaded:', this.groups.length);
    }
  }

  private initializeForm(): void {
    this.channelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      groupId: ['', Validators.required],
      type: [ChannelType.TEXT, Validators.required],
      maxMembers: [100, [Validators.min(1), Validators.max(1000)]],
      isActive: [true],
      isPrivate: [false],
      slowMode: [0, [Validators.min(0), Validators.max(3600)]],
      requireApproval: [false],
      allowReactions: [true],
      allowPolls: [true]
    });
  }

  private populateForm(): void {
    if (this.channel) {
      console.log('Populating form with channel data:', this.channel);
      const formData = {
        name: this.channel.name,
        description: this.channel.description || '',
        groupId: this.channel.groupId,
        type: this.channel.type,
        maxMembers: this.channel.maxMembers || 100,
        isActive: this.channel.isActive,
        isPrivate: this.channel.isPrivate,
        slowMode: this.channel.settings?.slowMode || 0,
        requireApproval: this.channel.settings?.requireApproval || false,
        allowReactions: this.channel.settings?.allowReactions || true,
        allowPolls: this.channel.settings?.allowPolls || true
      };
      console.log('Form data to populate:', formData);
      this.channelForm.patchValue(formData);
      console.log('Form after population:', this.channelForm.value);
    } else {
      console.log('No channel data to populate form');
    }
  }
}
