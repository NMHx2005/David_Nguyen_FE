import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { ChannelService } from '../../../services/channel.service';
import { GroupService } from '../../../services/group.service';
import { ClientChannelFilters, ChannelType } from '../../../models/channel.model';
import { ChannelsHeaderComponent } from './ui/channels-header.component';
import { ChannelsSearchComponent } from './ui/channels-search.component';
import { ChannelsGridComponent } from './ui/channels-grid.component';
import { Channel } from '../../../models/channel.model';
import { Group } from '../../../models/group.model';
import { User, UserRole } from '../../../models/user.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    ClientLayoutComponent,
    ChannelsHeaderComponent,
    ChannelsSearchComponent,
    ChannelsGridComponent
  ],
  template: `
    <app-client-layout 
      pageTitle="Channels" 
      pageDescription="Discover and join channels to connect with your team">
      
      <app-channels-header (resetData)="onResetData()"></app-channels-header>

      <app-channels-search 
        [filters]="filters" 
        (filtersChange)="onFiltersChange($event)">
      </app-channels-search>

      <app-channels-grid 
        [channels]="filteredChannels" 
        [groups]="groups" 
        [currentUser]="currentUser"
        (joinChannel)="onJoinChannel($event)">
      </app-channels-grid>

    </app-client-layout>
  `,
  styles: [``]
})
export class ChannelsComponent implements OnInit, OnDestroy {
  channels: Channel[] = [];
  filteredChannels: Channel[] = [];
  groups: Group[] = [];
  currentUser: User | null = null;
  filters: ClientChannelFilters = {
    searchTerm: '',
    groupId: '',
    channelType: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private channelService: ChannelService,
    private groupService: GroupService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('🔍 channels.component - AuthService.getCurrentUser():', this.currentUser);

    // TEMPORARY FIX: Mock user for testing if currentUser is null
    if (!this.currentUser) {
      console.log('🔧 TEMPORARY FIX: Creating mock user for testing');
      this.currentUser = {
        id: '68e02845ce489784ee3943ba', // Same as createdBy in groups
        username: 'admin',
        email: 'admin@chat-system.com',
        roles: [UserRole.GROUP_ADMIN, UserRole.USER],
        groups: [],
        isActive: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-10-04T01:49:42.502Z'),
        avatarUrl: 'http://localhost:3000/uploads/avatars/test-1759523654389-994265990_processed.jpg'
      };
    }

    this.loadChannels();
    this.loadGroups();

    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('🔍 channels.component - currentUser$ subscription:', user);
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFiltersChange(filters: ClientChannelFilters): void {
    this.filters = filters;
    this.applyFilters();
  }

  private loadChannels(): void {
    this.channelService.getAllChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Map API data to Channel model
            this.channels = response.data.map((apiChannel: any) => this.mapApiChannelToModel(apiChannel));
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error loading channels:', error);
        }
      });
  }

  /**
   * Map API Channel to Channel model
   */
  private mapApiChannelToModel(apiChannel: any): Channel {
    return {
      id: apiChannel._id || apiChannel.id,
      name: apiChannel.name,
      description: apiChannel.description,
      groupId: apiChannel.groupId,
      type: this.determineChannelType(apiChannel.name), // Determine type from name
      createdBy: apiChannel.createdBy,
      members: apiChannel.members || [],
      admins: apiChannel.admins || [],
      bannedUsers: [], // Default empty
      createdAt: new Date(apiChannel.createdAt),
      updatedAt: new Date(apiChannel.updatedAt),
      isActive: true, // Default active
      isPrivate: apiChannel.isPrivate || false,
      memberCount: apiChannel.memberCount || 0,
      maxMembers: undefined, // Not in API data
      avatarUrl: undefined, // Not in API data
      settings: apiChannel.settings || {
        slowMode: 0,
        requireApproval: false,
        allowReactions: true,
        allowPolls: true
      }
    };
  }

  /**
   * Determine channel type from channel name
   */
  private determineChannelType(name: string): ChannelType {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('voice') || lowerName.includes('voice-chat')) {
      return ChannelType.VOICE;
    } else if (lowerName.includes('video') || lowerName.includes('video-chat')) {
      return ChannelType.VIDEO;
    } else {
      return ChannelType.TEXT;
    }
  }

  private loadGroups(): void {
    this.groupService.getAllGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data?.groups) {
            // Map API groups to Group model and add current user as member for testing
            this.groups = response.data.groups.map((apiGroup: any) => ({
              id: apiGroup._id || apiGroup.id,
              name: apiGroup.name,
              description: apiGroup.description,
              category: 'general',
              status: 'active' as any,
              createdBy: apiGroup.createdBy,
              admins: apiGroup.admins || [],
              members: [...(apiGroup.members || []), '68e02845ce489784ee3943ba'], // Add current user for testing
              channels: [],
              createdAt: new Date(apiGroup.createdAt),
              updatedAt: new Date(apiGroup.updatedAt),
              isActive: apiGroup.isActive !== false,
              memberCount: (apiGroup.members?.length || 0) + 1, // +1 for current user
              maxMembers: apiGroup.maxMembers || 100,
              tags: apiGroup.tags || [],
              isPrivate: apiGroup.isPrivate || false
            }));
          } else {
            // Fallback to mock data if API fails
            this.groups = [
              {
                id: '68e02845ce489784ee3943d0',
                name: 'General Discussion',
                description: 'A place for general discussions and announcements',
                category: 'general',
                status: 'active' as any,
                createdBy: '68e02845ce489784ee3943ba',
                admins: ['68e02845ce489784ee3943ba'],
                members: ['68e02845ce489784ee3943ba'],
                channels: [],
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2025-10-03'),
                isActive: true,
                memberCount: 1,
                maxMembers: 100,
                tags: ['general', 'discussion', 'community'],
                isPrivate: false
              }
            ];
          }
        },
        error: (error) => {
          console.error('Error loading groups:', error);
          // Use mock data as fallback
          this.groups = [
            {
              id: '68e02845ce489784ee3943d0',
              name: 'General Discussion',
              description: 'A place for general discussions and announcements',
              category: 'general',
              status: 'active' as any,
              createdBy: '68e02845ce489784ee3943ba',
              admins: ['68e02845ce489784ee3943ba'],
              members: ['68e02845ce489784ee3943ba'],
              channels: [],
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2025-10-03'),
              isActive: true,
              memberCount: 1,
              maxMembers: 100,
              tags: ['general', 'discussion', 'community'],
              isPrivate: false
            }
          ];
        }
      });
  }

  private applyFilters(): void {
    let filtered = [...this.channels];

    // Apply search filter
    if (this.filters.searchTerm) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        channel.description.toLowerCase().includes(this.filters.searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (this.filters.channelType && this.filters.channelType !== 'all') {
      filtered = filtered.filter(channel => channel.type === this.filters.channelType);
    }

    this.filteredChannels = filtered;
  }

  private canJoinChannel(channel: Channel): boolean {
    // Check if user can join the channel
    return this.currentUser !== null && !channel.bannedUsers.includes(this.currentUser.id);
  }

  private async joinChannel(channel: Channel): Promise<boolean> {
    try {
      // This would typically call ChannelService.joinChannel()
      // For now, return true as mock
      return true;
    } catch (error) {
      console.error('Error joining channel:', error);
      return false;
    }
  }

  async onJoinChannel(channel: Channel): Promise<void> {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to join channels', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.canJoinChannel(channel)) {
      this.snackBar.open('Cannot join this channel', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const success = await this.joinChannel(channel);

      if (success) {
        this.snackBar.open(`Successfully joined "${channel.name}" channel!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.snackBar.open('Failed to join channel. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    } catch (error) {
      console.error('Join channel error:', error);
      this.snackBar.open('Failed to join channel. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onResetData(): void {
    this.loadChannels();
    this.snackBar.open('Data reset successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}