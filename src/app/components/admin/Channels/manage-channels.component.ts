import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ChannelsManagementService, ChannelStats, ChannelFilters } from './services/channels-management.service';
import { ChannelsStatsComponent } from './ui/channels-stats.component';
import { ChannelsFiltersComponent } from './ui/channels-filters.component';
import { ChannelsTableComponent } from './ui/channels-table.component';
import { CreateChannelDialogComponent } from './ui/create-channel-dialog.component';
import { BanUserDialogComponent } from '../Users/ui/ban-user-dialog.component';
import { User } from '../../../models/user.model';
import { Group } from '../../../models/group.model';
import { Channel } from '../../../models/channel.model';

@Component({
    selector: 'app-manage-channels',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        ChannelsStatsComponent,
        ChannelsFiltersComponent,
        ChannelsTableComponent
    ],
    template: `
      <div class="manage-channels-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Manage Channels</h1>
              <p>Create, edit, and manage channels across all groups</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/admin">
                <mat-icon>arrow_back</mat-icon>
                Back to Admin
              </button>
              <button mat-raised-button color="primary" 
                      (click)="openCreateChannelDialog()" 
                      [disabled]="!canCreateChannel()">
                <mat-icon>add</mat-icon>
                Create Channel
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Section -->
        <app-channels-stats [stats]="statsData"></app-channels-stats>

        <!-- Search and Filter Section -->
        <app-channels-filters 
          [filters]="filters"
          [groups]="groups"
          (onFiltersChange)="onFiltersChange($event)">
        </app-channels-filters>

        <!-- Channels Table -->
        <app-channels-table 
          [channels]="filteredChannels"
          [currentUser]="currentUser"
          [groups]="groups"
          (onViewChannel)="viewChannel($event)"
          (onEditChannel)="editChannel($event)"
          (onBanUser)="openBanUserDialog($event)"
          (onDeleteChannel)="deleteChannel($event)">
        </app-channels-table>
      </div>
  `,
    styles: [`
    .manage-channels-container {
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

    @media (max-width: 768px) {
      .manage-channels-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class ManageChannelsComponent implements OnInit, OnDestroy {
    filteredChannels: Channel[] = [];
    statsData: ChannelStats = {
        totalChannels: 0,
        textChannels: 0,
        voiceChannels: 0,
        videoChannels: 0
    };
    filters: ChannelFilters = {
        searchTerm: '',
        groupId: '',
        type: ''
    };
    groups: Group[] = [];
    currentUser: User | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private channelsManagementService: ChannelsManagementService,
        private dialog: MatDialog,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
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
        // Subscribe to channels data
        this.channelsManagementService.filteredChannels$
            .pipe(takeUntil(this.destroy$))
            .subscribe(channels => {
                this.filteredChannels = channels;
            });

        // Subscribe to statistics
        this.channelsManagementService.stats$
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => {
                this.statsData = stats;
            });

        // Subscribe to groups data
        this.channelsManagementService.groups$
            .pipe(takeUntil(this.destroy$))
            .subscribe(groups => {
                this.groups = groups;
            });
    }

    /**
     * Handle filters change
     */
    onFiltersChange(filters: ChannelFilters): void {
        this.filters = filters;
        this.channelsManagementService.setFilters(filters);
    }

    /**
     * Open create channel dialog
     */
    openCreateChannelDialog(): void {
        const dialogRef = this.dialog.open(CreateChannelDialogComponent, {
            width: '600px',
            data: {
                groups: this.groups,
                onCreate: (channelData: Partial<Channel>) => this.createChannel(channelData)
            }
        });
    }

    /**
     * Create a new channel
     */
    async createChannel(channelData: Partial<Channel>): Promise<void> {
        try {
            const result = await this.channelsManagementService.createChannel(channelData, this.currentUser);

            if (result.success) {
                this.snackBar.open(result.message, 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
            } else {
                this.snackBar.open(result.message, 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        } catch (error) {
            console.error('Error creating channel:', error);
            this.snackBar.open('Failed to create channel. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
            });
        }
    }

    /**
     * Check if current user can create channels
     */
    canCreateChannel(): boolean {
        return this.channelsManagementService.canCreateChannel(this.currentUser);
    }

    /**
     * View channel details
     */
    viewChannel(channel: Channel): void {
        this.router.navigate(['/admin/channels', channel.id, 'edit']);
    }

    /**
     * Edit channel
     */
    editChannel(channel: Channel): void {
        this.router.navigate(['/admin/channels', channel.id, 'edit']);
    }

    /**
     * Delete channel
     */
    async deleteChannel(channel: Channel): Promise<void> {
        if (confirm(`Are you sure you want to delete the channel "${channel.name}"?`)) {
            try {
                const result = await this.channelsManagementService.deleteChannel(channel.id, this.currentUser);

                if (result.success) {
                    this.snackBar.open(result.message, 'Close', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                } else {
                    this.snackBar.open(result.message, 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                }
            } catch (error) {
                console.error('Error deleting channel:', error);
                this.snackBar.open('Failed to delete channel. Please try again.', 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        }
    }

    /**
     * Open ban user dialog
     */
    openBanUserDialog(channel: Channel): void {
        const availableUsers = this.channelsManagementService.getAvailableUsersForBan(channel);

        if (availableUsers.length === 0) {
            this.snackBar.open('No users available to ban from this channel.', 'Close', {
                duration: 3000,
                panelClass: ['warning-snackbar']
            });
            return;
        }

        const dialogRef = this.dialog.open(BanUserDialogComponent, {
            width: '500px',
            data: {
                channelName: channel.name,
                availableUsers: availableUsers,
                onBan: (userId: string, reason: string) => this.banUserFromChannel(channel.id, userId, reason)
            }
        });
    }

    /**
     * Ban user from channel
     */
    async banUserFromChannel(channelId: string, userId: string, reason: string): Promise<void> {
        try {
            const result = await this.channelsManagementService.banUserFromChannel(channelId, userId, reason, this.currentUser);

            if (result.success) {
                this.snackBar.open(result.message, 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
            } else {
                this.snackBar.open(result.message, 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        } catch (error) {
            console.error('Error banning user:', error);
            this.snackBar.open('Failed to ban user. Please try again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
            });
        }
    }
}
