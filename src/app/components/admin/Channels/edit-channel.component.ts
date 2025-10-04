import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ChannelService } from '../../../services/channel.service';
import { GroupService } from '../../../services/group.service';
import { ChannelFormComponent } from './ui/channel-form.component';
import { User, UserRole } from '../../../models/user.model';
import { Group } from '../../../models/group.model';
import { Channel, ChannelType } from '../../../models/channel.model';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ChannelFormComponent
  ],
  template: `
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

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <mat-icon class="loading-icon">refresh</mat-icon>
          <p>Loading channel details...</p>
        </div>

        <!-- Channel Form -->
        <app-channel-form
          *ngIf="!isLoading"
          [channel]="channel"
          [groups]="groups"
          (onSubmit)="updateChannel($event)"
          (onCancel)="goBack()">
        </app-channel-form>
      </div>
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

    .loading-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .loading-state p {
      margin: 0;
      font-size: 1.1rem;
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

      .header-actions {
        justify-content: center;
      }
    }
  `]
})
export class EditChannelComponent implements OnInit, OnDestroy {
  channel: Channel | null = null;
  groups: Group[] = [];
  currentUser: User | null = null;
  isLoading = false;
  private channelId = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private channelService: ChannelService,
    private groupService: GroupService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.channelId = this.route.snapshot.paramMap.get('channelId') || '';
    console.log('Edit Channel - Channel ID:', this.channelId);
    console.log('Route params:', this.route.snapshot.params);
    this.loadChannel();
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // Load groups from localStorage for now
    this.loadGroups();
  }

  /**
   * Load groups from API
   */
  private loadGroups(): void {
    this.groupService.getAllGroups({ limit: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data?.groups) {
            // Map API groups to model groups
            this.groups = response.data.groups.map((apiGroup: any) => ({
              id: apiGroup._id || apiGroup.id,
              name: apiGroup.name || '',
              description: apiGroup.description || '',
              isPrivate: apiGroup.isPrivate || false,
              isActive: apiGroup.status === 'active',
              members: apiGroup.members || [],
              admins: apiGroup.admins || [],
              createdBy: apiGroup.createdBy || '',
              createdAt: apiGroup.createdAt ? new Date(apiGroup.createdAt) : new Date(),
              updatedAt: apiGroup.updatedAt ? new Date(apiGroup.updatedAt) : new Date(),
              category: apiGroup.category || 'General',
              tags: apiGroup.tags || [],
              maxMembers: apiGroup.maxMembers || 100,
              memberCount: apiGroup.memberCount || 0
            }));
            console.log('Loaded groups:', this.groups.length);
          } else {
            console.warn('Failed to load groups:', response.message);
            this.groups = [];
          }
        },
        error: (error) => {
          console.error('Error loading groups:', error);
          this.groups = [];
          this.snackBar.open('Failed to load groups. Using cached data.', 'Close', {
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
        }
      });
  }

  /**
   * Load channel data
   */
  private loadChannel(): void {
    if (!this.channelId) {
      console.error('No channel ID provided');
      this.snackBar.open('Invalid channel ID', 'Close', { duration: 3000 });
      this.router.navigate(['/admin/channels']);
      return;
    }

    console.log('Loading channel with ID:', this.channelId);
    this.isLoading = true;
    this.channelService.getChannelById(this.channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Channel API response:', response);
          if (response.success) {
            // Map API Channel to models Channel
            this.channel = this.mapApiChannelToModel(response.data);
            console.log('Mapped channel data:', this.channel);
          } else {
            this.snackBar.open(response.message || 'Channel not found', 'Close', { duration: 3000 });
            // Only redirect if it's not a permission error
            if (response.message !== 'Insufficient permissions') {
              this.router.navigate(['/admin/channels']);
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading channel:', error);
          this.snackBar.open('Failed to load channel', 'Close', { duration: 3000 });
          // Only redirect if it's not a permission error
          if ((error as any)?.error?.message !== 'Insufficient permissions') {
            this.router.navigate(['/admin/channels']);
          }
          this.isLoading = false;
        }
      });
  }

  /**
   * Map API Channel to models Channel
   */
  private mapApiChannelToModel(apiChannel: any): Channel {
    console.log('Mapping API channel:', apiChannel);

    // Map type string to ChannelType enum
    let channelType: ChannelType;
    console.log('API channel type:', apiChannel.type);
    if (apiChannel.type) {
      switch (apiChannel.type.toLowerCase()) {
        case 'text':
          channelType = ChannelType.TEXT;
          break;
        case 'voice':
          channelType = ChannelType.VOICE;
          break;
        case 'video':
          channelType = ChannelType.VIDEO;
          break;
        default:
          channelType = ChannelType.TEXT;
      }
    } else {
      // Default to text if no type is provided
      channelType = ChannelType.TEXT;
    }

    return {
      id: apiChannel._id || apiChannel.id,
      name: apiChannel.name || '',
      description: apiChannel.description || '',
      groupId: apiChannel.groupId || '',
      type: channelType,
      createdBy: apiChannel.createdBy || '',
      members: apiChannel.members || [],
      admins: apiChannel.admins || [],
      bannedUsers: apiChannel.bannedUsers || [],
      createdAt: apiChannel.createdAt ? new Date(apiChannel.createdAt) : new Date(),
      updatedAt: apiChannel.updatedAt ? new Date(apiChannel.updatedAt) : new Date(),
      isActive: apiChannel.isActive !== false,
      isPrivate: apiChannel.isPrivate || false,
      memberCount: apiChannel.memberCount || apiChannel.members?.length || 0,
      maxMembers: apiChannel.maxMembers || 100,
      settings: apiChannel.settings || {
        slowMode: 0,
        requireApproval: false,
        allowReactions: true,
        allowPolls: true
      }
    };
  }

  /**
   * Update channel
   */
  async updateChannel(formData: any): Promise<void> {
    if (!this.channel || !this.currentUser) {
      this.snackBar.open('Invalid channel or user data', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const channelUpdateData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      groupId: formData.groupId, // Include groupId in update data
      isPrivate: formData.isPrivate || false,
      maxMembers: formData.maxMembers || 100,
      isActive: formData.isActive !== false,
      settings: {
        slowMode: formData.slowMode || 0,
        requireApproval: formData.requireApproval || false,
        allowReactions: formData.allowReactions !== false,
        allowPolls: formData.allowPolls !== false
      }
    };

    console.log('Updating channel with data:', channelUpdateData);
    console.log('Form data received:', formData);

    this.channelService.updateChannel(this.channelId, channelUpdateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.snackBar.open('Channel updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/channels']);
          } else {
            this.snackBar.open(response.message || 'Failed to update channel', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            // Don't redirect for permission errors
            if (response.message !== 'Insufficient permissions') {
              this.router.navigate(['/admin/channels']);
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating channel:', error);
          this.snackBar.open('Failed to update channel', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          // Don't redirect for permission errors
          if ((error as any)?.error?.message !== 'Insufficient permissions') {
            this.router.navigate(['/admin/channels']);
          }
          this.isLoading = false;
        }
      });
  }

  /**
   * Go back to channels list
   */
  goBack(): void {
    this.router.navigate(['/admin/channels']);
  }
}