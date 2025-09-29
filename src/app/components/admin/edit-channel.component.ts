import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';
import { User, UserRole } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { Channel, ChannelType } from '../../models/channel.model';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout [pageTitle]="'Edit Channel'">
      <div class="edit-channel-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Edit Channel</h1>
              <p>Update channel information and settings</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button [routerLink]="['/admin/channels']">
                <mat-icon>arrow_back</mat-icon>
                Back to Channels
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Edit Form -->
        <mat-card class="edit-form-card" *ngIf="channel">
          <mat-card-content>
            <form [formGroup]="editForm" (ngSubmit)="updateChannel()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Channel Name</mat-label>
                  <input matInput 
                         formControlName="name" 
                         required 
                         minlength="3" 
                         maxlength="30"
                         placeholder="Enter channel name">
                  <mat-error *ngIf="editForm.get('name')?.hasError('required')">
                    Channel name is required
                  </mat-error>
                  <mat-error *ngIf="editForm.get('name')?.hasError('minlength')">
                    Channel name must be at least 3 characters
                  </mat-error>
                  <mat-error *ngIf="editForm.get('name')?.hasError('maxlength')">
                    Channel name must not exceed 30 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput 
                            formControlName="description" 
                            rows="3" 
                            maxlength="200"
                            placeholder="Enter channel description"></textarea>
                  <mat-error *ngIf="editForm.get('description')?.hasError('maxlength')">
                    Description must not exceed 200 characters
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Group</mat-label>
                  <mat-select formControlName="groupId" required>
                    <mat-option value="">Select Group</mat-option>
                    <mat-option *ngFor="let group of groups" [value]="group.id">
                      {{ group.name }}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="editForm.get('groupId')?.hasError('required')">
                    Group is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Channel Type</mat-label>
                  <mat-select formControlName="type" required>
                    <mat-option [value]="ChannelType.TEXT">Text Channel</mat-option>
                    <mat-option [value]="ChannelType.VOICE">Voice Channel</mat-option>
                    <mat-option [value]="ChannelType.VIDEO">Video Channel</mat-option>
                  </mat-select>
                  <mat-error *ngIf="editForm.get('type')?.hasError('required')">
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
                  <mat-error *ngIf="editForm.get('maxMembers')?.hasError('min')">
                    Max members must be at least 1
                  </mat-error>
                  <mat-error *ngIf="editForm.get('maxMembers')?.hasError('max')">
                    Max members must not exceed 1000
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="isActive">
                    <mat-option [value]="true">Active</mat-option>
                    <mat-option [value]="false">Inactive</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" [routerLink]="['/admin/channels']">
                  Cancel
                </button>
                <button mat-raised-button 
                        color="primary" 
                        type="submit" 
                        [disabled]="!editForm.valid || editForm.pristine">
                  <mat-icon>save</mat-icon>
                  Update Channel
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Loading State -->
        <div *ngIf="!channel" class="loading-state">
          <mat-icon class="loading-icon">refresh</mat-icon>
          <p>Loading channel details...</p>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .edit-channel-container {
      margin: 0 auto;
      padding: 24px;
      max-width: 800px;
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

    .edit-form-card {
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading-icon {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 16px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .edit-channel-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class EditChannelComponent implements OnInit {
  editForm: FormGroup;
  channel: Channel | null = null;
  groups: Group[] = [];
  channelId: string = '';
  currentUser: User | null = null;

  // Expose enums to template
  ChannelType = ChannelType;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      description: ['', Validators.maxLength(200)],
      groupId: ['', Validators.required],
      type: [ChannelType.TEXT, Validators.required],
      maxMembers: [100, [Validators.min(1), Validators.max(1000)]],
      isActive: [true]
    });
  }

  /**
   * Lifecycle: initialize current user, load groups, and subscribe to route params for channel.
   */
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadGroups();
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      if (this.channelId) {
        this.loadChannel();
      }
    });
  }

  /**
   * Load list of groups from localStorage for the group selector.
   */
  loadGroups(): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      this.groups = JSON.parse(storedGroups);
    }
  }

  /**
   * Load channel details by id from localStorage and populate the form.
   */
  loadChannel(): void {
    const storedChannels = localStorage.getItem('channels');
    if (storedChannels) {
      const channels: Channel[] = JSON.parse(storedChannels);
      this.channel = channels.find(c => c.id === this.channelId) || null;

      if (this.channel) {
        this.populateForm();
      } else {
        this.snackBar.open('Channel not found', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/admin/channels']);
      }
    }
  }

  /**
   * Populate reactive form with selected channel's data.
   */
  populateForm(): void {
    if (this.channel) {
      this.editForm.patchValue({
        name: this.channel.name,
        description: this.channel.description || '',
        groupId: this.channel.groupId,
        type: this.channel.type,
        maxMembers: this.channel.maxMembers || 100,
        isActive: this.channel.isActive
      });
    }
  }

  /**
   * Validate and persist channel updates to localStorage; update group-channel relation if group changed.
   */
  updateChannel(): void {
    if (this.editForm.valid && this.channel) {
      try {
        // Check permissions
        if (!this.canEditChannel(this.channel)) {
          this.snackBar.open('You do not have permission to edit this channel', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        // Check for name conflicts within the same group
        const newName = this.editForm.value.name;
        const newGroupId = this.editForm.value.groupId;

        if (newName !== this.channel.name || newGroupId !== this.channel.groupId) {
          const storedChannels = localStorage.getItem('channels');
          if (storedChannels) {
            const channels: Channel[] = JSON.parse(storedChannels);
            const nameExists = channels.some(c =>
              c.name === newName &&
              c.groupId === newGroupId &&
              c.id !== this.channelId
            );
            if (nameExists) {
              this.snackBar.open('Channel name already exists in this group', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
              return;
            }
          }
        }

        // Update channel
        const updatedChannel: Channel = {
          ...this.channel,
          name: this.editForm.value.name,
          description: this.editForm.value.description,
          groupId: this.editForm.value.groupId,
          type: this.editForm.value.type,
          maxMembers: this.editForm.value.maxMembers,
          isActive: this.editForm.value.isActive,
          updatedAt: new Date()
        };

        // Save to localStorage
        const storedChannels = localStorage.getItem('channels');
        if (storedChannels) {
          const channels: Channel[] = JSON.parse(storedChannels);
          const index = channels.findIndex(c => c.id === this.channelId);
          if (index > -1) {
            channels[index] = updatedChannel;
            localStorage.setItem('channels', JSON.stringify(channels));
          }
        }

        // Update group's channels array if group changed
        if (this.channel.groupId !== newGroupId) {
          this.updateGroupChannels(this.channel.groupId, newGroupId);
        }

        this.snackBar.open('Channel updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.router.navigate(['/admin/channels']);

      } catch (error) {
        this.snackBar.open('Failed to update channel. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Check whether the current user can edit the given channel.
   * @param channel Channel to check.
   * @returns True when permitted; otherwise false.
   */
  canEditChannel(channel: Channel): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      // Check if user is admin of the group that contains this channel
      const group = this.groups.find(g => g.id === channel.groupId);
      return group ? group.createdBy === this.currentUser.id : false;
    }
    return false;
  }

  /**
   * Maintain channel references when the channel moves between groups.
   * @param oldGroupId Previous group id.
   * @param newGroupId New group id.
   */
  updateGroupChannels(oldGroupId: string, newGroupId: string): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      const groups: Group[] = JSON.parse(storedGroups);

      // Remove channel from old group
      const oldGroup = groups.find(g => g.id === oldGroupId);
      if (oldGroup) {
        oldGroup.channels = oldGroup.channels.filter(c => c !== this.channelId);
      }

      // Add channel to new group
      const newGroup = groups.find(g => g.id === newGroupId);
      if (newGroup && !newGroup.channels.includes(this.channelId)) {
        newGroup.channels.push(this.channelId);
      }

      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }
}
