import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ClientLayoutComponent } from '../layouts/client-layout.component';
import { Channel, ChannelType } from '../../models/channel.model';
import { Group } from '../../models/group.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
    ClientLayoutComponent
  ],
  template: `
    <app-client-layout 
      pageTitle="Channels" 
      pageDescription="Discover and join channels to connect with your team">
      
      <!-- Header Actions -->
      <div class="header-actions">
        <button mat-stroked-button routerLink="/groups" class="back-button" matTooltip="Back to Groups">
          <mat-icon>arrow_back</mat-icon>
          Back to Groups
        </button>
        
        <!-- Debug button (remove in production) -->
        <button mat-stroked-button color="warn" (click)="resetData()" matTooltip="Reset data for testing">
          <mat-icon>refresh</mat-icon>
          Reset Data
        </button>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search channels</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterChannels()" placeholder="Type to search...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        
        <div class="filter-chips">
          <mat-chip-listbox [(ngModel)]="selectedType" (ngModelChange)="filterChannels()">
            <mat-chip-option value="">All Types</mat-chip-option>
            <mat-chip-option value="text">Text</mat-chip-option>
            <mat-chip-option value="voice">Voice</mat-chip-option>
            <mat-chip-option value="video">Video</mat-chip-option>
          </mat-chip-listbox>
        </div>
      </div>

      <!-- Channels Grid -->
      <div class="channels-grid">
        <mat-card *ngFor="let channel of filteredChannels" class="channel-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="channel-icon">
              {{ getChannelTypeIcon(channel.type) }}
            </mat-icon>
            <mat-card-title>{{ channel.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ getGroupName(channel.groupId) }}
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="channel-description">{{ channel.description || 'No description' }}</p>
            
            <div class="channel-meta">
              <div class="meta-item">
                <mat-icon>group</mat-icon>
                <span>{{ channel.memberCount || channel.members.length || 0 }} members</span>
              </div>
              
              <div class="meta-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ channel.createdAt | date:'shortDate' }}</span>
              </div>
            </div>
            
            <div class="channel-tags">
              <mat-chip [ngClass]="'type-' + channel.type">
                {{ channel.type | titlecase }}
              </mat-chip>
              <mat-chip *ngIf="channel.maxMembers" class="limit-chip">
                Max: {{ channel.maxMembers }}
              </mat-chip>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button 
                    [color]="isChannelMember(channel) ? 'accent' : 'primary'"
                    [disabled]="!canJoinChannel(channel)"
                    (click)="joinChannel(channel)"
                    matTooltip="Join this channel">
              <mat-icon>{{ isChannelMember(channel) ? 'check_circle' : 'chat' }}</mat-icon>
              {{ isChannelMember(channel) ? 'Joined' : 'Join Channel' }}
            </button>
            
            <button mat-button color="accent" 
                    [routerLink]="['/group', channel.groupId]"
                    matTooltip="View group details">
              <mat-icon>group</mat-icon>
              View Group
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredChannels.length === 0" class="empty-state">
        <mat-icon class="empty-icon">forum</mat-icon>
        <h3>No channels found</h3>
        <p>Try adjusting your search or filters to find channels.</p>
      </div>

    </app-client-layout>
  `,
  styles: [`
    .header-actions {
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-start;
    }

    .back-button {
      color: #667eea;
      border-color: #667eea;
    }

    .search-section {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 300px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
    }

    .channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .channel-card {
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: white;
    }

    .channel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .channel-icon {
      font-size: 32px;
      color: #667eea;
      width: 32px;
      height: 32px;
    }

    .channel-description {
      color: #666;
      line-height: 1.5;
      margin: 16px 0;
    }

    .channel-meta {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .channel-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .type-text {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .type-voice {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .type-video {
      background: #fce4ec !important;
      color: #c2185b !important;
    }

    .limit-chip {
      background: #f5f5f5 !important;
      color: #666 !important;
    }

    .mat-card-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .channels-grid {
        grid-template-columns: 1fr;
      }

      .channel-meta {
        flex-direction: column;
        gap: 12px;
      }

      .mat-card-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ChannelsComponent implements OnInit {
  searchTerm: string = '';
  selectedType: string = '';
  channels: Channel[] = [];
  groups: Group[] = [];
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Component initialization lifecycle hook.
   * Loads current user and mock data for groups/channels from localStorage.
   */
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('🚀 ChannelsComponent initialized');
    console.log('👤 Current user from auth service:', this.currentUser);
    this.loadMockData();
    console.log('📊 Loaded groups:', this.groups);
    console.log('📊 Loaded channels:', this.channels);
  }

  /**
   * Compute filtered list of channels based on search term, selected type,
   * and whether the current user is a member of the channel's group.
   * Returns a new array each time for template binding.
   */
  get filteredChannels(): Channel[] {
    return this.channels.filter(channel => {
      const matchesSearch = !this.searchTerm ||
        channel.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (channel.description && channel.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesType = !this.selectedType || channel.type === this.selectedType;
      // Show channels that belong to groups the current user is a member of
      let userInGroup = false;
      if (this.currentUser) {
        // Prefer groups list membership
        const group = this.groups.find(g => g.id === channel.groupId);
        if (group && Array.isArray(group.members)) {
          userInGroup = group.members.includes(this.currentUser.id);
        }
        // Fallback to user.groups linkage if available
        if (!userInGroup && Array.isArray(this.currentUser.groups)) {
          userInGroup = this.currentUser.groups.includes(channel.groupId);
        }
      }
      return matchesSearch && matchesType && userInGroup;
    });
  }

  /**
   * Map a channel type to a Material icon name.
   * @param type ChannelType enum value
   * @returns Icon name string
   */
  getChannelTypeIcon(type: ChannelType): string {
    switch (type) {
      case ChannelType.TEXT: return 'chat';
      case ChannelType.VOICE: return 'mic';
      case ChannelType.VIDEO: return 'videocam';
      default: return 'forum';
    }
  }

  /**
   * Resolve a group's display name from its id.
   * @param groupId Group identifier
   * @returns Group name or fallback text
   */
  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  }

  /**
   * Trigger re-evaluation of the filtered channels by producing a new array reference.
   * Useful when searchTerm/selectedType change via ngModel.
   */
  filterChannels() {
    // Trigger change detection by reassigning filteredChannels
    this.channels = [...this.channels];
  }

  /**
   * Check whether the current user is a member of a channel.
   * @param channel Channel to check
   * @returns True if current user id is in channel.members
   */
  isChannelMember(channel: Channel): boolean {
    if (!this.currentUser) return false;
    return Array.isArray(channel.members) && channel.members.includes(this.currentUser.id);
  }

  /**
   * Determine if the current user can join the provided channel.
   * Validates login state, membership, bans, parent group membership, and capacity.
   * @param channel Channel to evaluate
   * @returns True if the user can join
   */
  canJoinChannel(channel: Channel): boolean {
    console.log('🔍 Checking if user can join channel:', channel.name);
    console.log('👤 Current user:', this.currentUser);

    if (!this.currentUser) {
      console.log('❌ No current user');
      return false;
    }

    // Check if user is already a member
    if (this.isChannelMember(channel)) {
      console.log('❌ User already a member of channel');
      return false;
    }

    // Check if user is banned from this channel
    if (Array.isArray(channel.bannedUsers) && channel.bannedUsers.includes(this.currentUser.id)) {
      console.log('❌ User is banned from channel');
      return false;
    }

    // Check if user is a member of the group
    const group = this.groups.find(g => g.id === channel.groupId);
    console.log('🏢 Found group:', group);
    console.log('👥 Group members:', group?.members);
    console.log('🆔 Current user ID:', this.currentUser.id);

    if (!group || !Array.isArray(group.members) || !group.members.includes(this.currentUser.id)) {
      console.log('❌ User is not a member of the group');
      return false;
    }

    // Check if channel has reached max members
    if (channel.maxMembers && (channel.memberCount || 0) >= channel.maxMembers) {
      console.log('❌ Channel has reached max members');
      return false;
    }

    console.log('✅ User can join channel');
    return true;
  }

  /**
   * Attempt to join the specified channel for the current user.
   * Updates membership and persists to localStorage; shows feedback via snackbar.
   * @param channel Channel to join
   */
  async joinChannel(channel: Channel): Promise<void> {
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
      // Add user to channel members
      const channelIndex = this.channels.findIndex(c => c.id === channel.id);
      if (channelIndex > -1) {
        this.channels[channelIndex].members.push(this.currentUser.id);
        this.channels[channelIndex].memberCount = this.channels[channelIndex].members.length;
        this.channels[channelIndex].updatedAt = new Date();
      }

      // Update localStorage
      this.updateChannelsInStorage();

      this.snackBar.open(`Successfully joined "${channel.name}" channel!`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Navigate to the channel
      // Note: You might want to add Router injection and navigate here
      // this.router.navigate(['/group', channel.groupId, 'channel', channel.id]);

    } catch (error) {
      this.snackBar.open('Failed to join channel. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Persist the current channels array to localStorage.
   */
  private updateChannelsInStorage(): void {
    localStorage.setItem('channels', JSON.stringify(this.channels));
  }

  /**
   * Debug helper: clear seeded groups/channels and re-initialize mock data.
   * Shows a success snackbar when finished.
   */
  resetData(): void {
    localStorage.removeItem('groups');
    localStorage.removeItem('channels');
    this.loadMockData();
    this.snackBar.open('Data reset successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Load groups and channels from localStorage, or seed defaults if missing.
   * Keeps component state in sync with stored mock data.
   */
  private loadMockData() {
    // Load groups from localStorage
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      this.groups = JSON.parse(storedGroups);
      console.log('📁 Loaded groups from localStorage:', this.groups);
    } else {
      // Initialize with default groups if none exist
      console.log('📁 No groups in localStorage, initializing defaults');
      this.initializeDefaultGroups();
    }

    // Load channels from localStorage
    const storedChannels = localStorage.getItem('channels');
    if (storedChannels) {
      this.channels = JSON.parse(storedChannels);
      console.log('📁 Loaded channels from localStorage:', this.channels);
    } else {
      // Initialize with default channels if none exist
      console.log('📁 No channels in localStorage, initializing defaults');
      this.initializeDefaultChannels();
    }
  }

  /**
   * Seed default groups for demo usage.
   * Only includes the current user as a member/admin for the first group.
   */
  private initializeDefaultGroups(): void {
    // Get current user ID; only the creator will be included by default
    const currentUserId = this.currentUser?.id || '1';

    this.groups = [
      {
        id: '1',
        name: 'Technology Team',
        description: 'Core technology development team',
        category: 'Technology',
        status: 'active' as any,
        createdBy: currentUserId,
        admins: [currentUserId],
        members: [currentUserId],
        channels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 1,
        maxMembers: 50
      },
      {
        id: '2',
        name: 'Marketing Department',
        description: 'Marketing and communications team',
        category: 'Marketing',
        status: 'active' as any,
        createdBy: 'user2',
        admins: ['user2'],
        members: ['user2'],
        channels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 1,
        maxMembers: 30
      }
    ];
    console.log('🏗️ Initialized default groups with current user:', currentUserId);
    localStorage.setItem('groups', JSON.stringify(this.groups));
  }

  /**
   * Seed default channels for demo usage.
   * Does not auto-add members; capacity and type vary per channel.
   */
  private initializeDefaultChannels(): void {
    // Only create structure; do not auto-add members except creator if needed
    const currentUserId = this.currentUser?.id || '1';

    this.channels = [
      {
        id: '1',
        name: 'general',
        description: 'General discussion for the technology team',
        groupId: '1',
        type: ChannelType.TEXT,
        createdBy: currentUserId,
        members: [],
        bannedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 0,
        maxMembers: 50
      },
      {
        id: '2',
        name: 'code-reviews',
        description: 'Code review discussions and feedback',
        groupId: '1',
        type: ChannelType.TEXT,
        createdBy: currentUserId,
        members: [],
        bannedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 0,
        maxMembers: 20
      },
      {
        id: '3',
        name: 'announcements',
        description: 'Important announcements and updates',
        groupId: '2',
        type: ChannelType.TEXT,
        createdBy: 'user2',
        members: [],
        bannedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 0,
        maxMembers: 30
      },
      {
        id: '4',
        name: 'campaign-planning',
        description: 'Marketing campaign planning and strategy',
        groupId: '2',
        type: ChannelType.VOICE,
        createdBy: 'user2',
        members: [],
        bannedUsers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        memberCount: 0,
        maxMembers: 15
      }
    ];
    console.log('🏗️ Initialized default channels');
    localStorage.setItem('channels', JSON.stringify(this.channels));
  }
}