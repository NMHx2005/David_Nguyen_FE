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
import { ChannelService } from '../../../services/channel.service';
import { ChannelStats, ChannelFilters, PaginationInfo } from '../../../models/channel.model';
import { GroupService } from '../../../services/group.service';
import { ChannelsStatsComponent } from './ui/channels-stats.component';
import { ChannelsFiltersComponent } from './ui/channels-filters.component';
import { ChannelsTableComponent } from './ui/channels-table.component';
import { CreateChannelDialogComponent } from './ui/create-channel-dialog.component';
import { BanUserDialogComponent } from '../Users/ui/ban-user-dialog.component';
import { User, UserRole } from '../../../models/user.model';
import { Group } from '../../../models/group.model';
import { Channel, ChannelType } from '../../../models/channel.model';

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
          [channels]="channels"
          [currentUser]="currentUser"
          [groups]="groups"
          [pagination]="pagination"
          [loading]="loading"
          (onViewChannel)="viewChannel($event)"
          (onEditChannel)="editChannel($event)"
          (onBanUser)="openBanUserDialog($event)"
          (onDeleteChannel)="deleteChannel($event)"
          (onPageChange)="onPageChange($event)">
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
    channels: Channel[] = [];
    statsData: ChannelStats = {
        totalChannels: 0,
        activeChannels: 0,
        textChannels: 0,
        voiceChannels: 0,
        videoChannels: 0
    };
    filters: ChannelFilters = {
        searchTerm: '',
        groupId: '',
        channelType: 'all',
        isActive: 'all',
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 10
    };
    groups: Group[] = [];
    currentUser: User | null = null;
    loading: boolean = false;
    pagination: PaginationInfo = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
    };

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private channelService: ChannelService,
        private groupService: GroupService,
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
        // Load initial data
        this.loadChannels();
        this.loadGroups();
    }

    /**
     * Load channels from API with pagination
     */
    private loadChannels(): void {
        this.loading = true;

        // Prepare query options
        const queryOptions: any = {
            page: this.filters.page || 1,
            limit: this.filters.limit || 10,
            sortBy: this.filters.sortBy,
            sortOrder: this.filters.sortOrder
        };

        // Add filters if they exist
        if (this.filters.searchTerm) {
            queryOptions.search = this.filters.searchTerm;
        }
        if (this.filters.groupId && this.filters.groupId !== 'all') {
            queryOptions.groupId = this.filters.groupId;
        }
        if (this.filters.channelType && this.filters.channelType !== 'all') {
            queryOptions.channelType = this.filters.channelType;
        }
        if (this.filters.isActive !== 'all') {
            queryOptions.isActive = this.filters.isActive;
        }

        this.channelService.getChannelsPaginated(queryOptions)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    try {
                        if (response && response.success && response.data) {
                            // Map API channels to models
                            const channels = response.data.channels.map((apiChannel: any) => this.mapApiChannelToModel(apiChannel));
                            this.channels = channels;

                            // Update pagination info
                            this.pagination = {
                                page: response.data.page,
                                limit: response.data.limit,
                                total: response.data.total,
                                pages: response.data.pages,
                                hasNext: response.data.page < response.data.pages,
                                hasPrev: response.data.page > 1
                            };

                            // Update stats (we'll need to get total stats separately)
                            this.updateStats();
                            this.loading = false;
                            console.log(`Loaded ${channels.length} channels (page ${this.pagination.page}/${this.pagination.pages})`);
                        } else {
                            console.warn('Invalid response format:', response);
                            this.channels = [];
                            this.updatePagination();
                            this.updateStats();
                            this.loading = false;
                            this.snackBar.open(response?.message || 'Failed to load channels - invalid response', 'Close', {
                                duration: 3000,
                                panelClass: ['error-snackbar']
                            });
                        }
                    } catch (mappingError) {
                        console.error('Error mapping channel data:', mappingError);
                        this.channels = [];
                        this.updatePagination();
                        this.updateStats();
                        this.loading = false;
                        this.snackBar.open('Error processing channel data', 'Close', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                },
                error: (error) => {
                    console.error('Error loading channels:', error);
                    this.channels = [];
                    this.updatePagination();
                    this.updateStats();
                    this.loading = false;
                    this.snackBar.open('Failed to load channels. Please check your connection.', 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }

    /**
     * Map API Channel to models Channel
     */
    private mapApiChannelToModel(apiChannel: any): Channel {
        // Map type string to ChannelType enum
        let channelType: ChannelType;
        switch (apiChannel.type?.toLowerCase()) {
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
     * Handle filters change
     */
    onFiltersChange(filters: ChannelFilters): void {
        this.filters = { ...filters, page: 1 }; // Reset to page 1 when filters change
        this.loadChannels();
    }

    /**
     * Handle page change
     */
    onPageChange(page: number): void {
        this.filters.page = page;
        this.loadChannels();
    }

    /**
     * Update pagination info
     */
    private updatePagination(): void {
        this.pagination = {
            page: this.filters.page || 1,
            limit: this.filters.limit || 10,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
        };
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
        if (!this.currentUser) {
            this.snackBar.open('Please login to create channels', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        try {
            const channelCreateData = {
                name: channelData.name!,
                description: channelData.description || '',
                groupId: channelData.groupId!,
                type: channelData.type!,
                isPrivate: false // Default to public
            };

            this.channelService.createChannel(channelCreateData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response: any) => {
                        if (response.success) {
                            // Reload channels to get updated list
                            this.loadChannels();

                            this.snackBar.open('Channel created successfully', 'Close', {
                                duration: 3000,
                                panelClass: ['success-snackbar']
                            });
                        } else {
                            this.snackBar.open(response.message || 'Failed to create channel', 'Close', {
                                duration: 5000,
                                panelClass: ['error-snackbar']
                            });
                        }
                    },
                    error: (error) => {
                        console.error('Error creating channel:', error);
                        this.snackBar.open('Failed to create channel. Please try again.', 'Close', {
                            duration: 5000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
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
        return this.currentUser?.roles.includes(UserRole.GROUP_ADMIN) || this.currentUser?.roles.includes(UserRole.SUPER_ADMIN) || false;
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
        if (!this.currentUser) {
            this.snackBar.open('Please login to delete channels', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        if (confirm(`Are you sure you want to delete the channel "${channel.name}"?`)) {
            this.channelService.deleteChannel(channel.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response: any) => {
                        if (response.success) {
                            // Reload channels to get updated list
                            this.loadChannels();
                            this.snackBar.open('Channel deleted successfully', 'Close', {
                                duration: 3000,
                                panelClass: ['success-snackbar']
                            });
                        } else {
                            this.snackBar.open(response.message || 'Failed to delete channel', 'Close', {
                                duration: 5000,
                                panelClass: ['error-snackbar']
                            });
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting channel:', error);
                        this.snackBar.open('Failed to delete channel. Please try again.', 'Close', {
                            duration: 5000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        }
    }

    /**
     * Open ban user dialog
     */
    openBanUserDialog(channel: Channel): void {
        // For now, we'll show a simple message
        this.snackBar.open('Ban user functionality will be implemented with UserService integration', 'Close', {
            duration: 3000,
            panelClass: ['info-snackbar']
        });
    }

    /**
     * Ban user from channel
     */
    async banUserFromChannel(channelId: string, userId: string, reason: string): Promise<void> {
        // This will be implemented with proper UserService integration
        this.snackBar.open('Ban user functionality will be implemented with UserService integration', 'Close', {
            duration: 3000,
            panelClass: ['info-snackbar']
        });
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
                            isActive: apiGroup.isActive !== false,
                            members: apiGroup.members || [],
                            admins: apiGroup.admins || [],
                            createdBy: apiGroup.createdBy || '',
                            createdAt: apiGroup.createdAt ? new Date(apiGroup.createdAt) : new Date(),
                            updatedAt: apiGroup.updatedAt ? new Date(apiGroup.updatedAt) : new Date()
                        }));
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
     * Update statistics
     */
    private updateStats(): void {
        this.statsData = {
            totalChannels: this.channels.length,
            activeChannels: this.channels.filter(c => c.isActive).length,
            textChannels: this.channels.filter(c => c.type === ChannelType.TEXT).length,
            voiceChannels: this.channels.filter(c => c.type === ChannelType.VOICE).length,
            videoChannels: this.channels.filter(c => c.type === ChannelType.VIDEO).length
        };
    }
}
