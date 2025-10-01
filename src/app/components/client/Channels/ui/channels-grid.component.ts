import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Channel, ChannelType } from '../../../../models/channel.model';

@Component({
  selector: 'app-channels-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="channels-grid">
      <mat-card *ngFor="let channel of channels" class="channel-card">
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
              <span>{{ channel.memberCount || (channel.members ? channel.members.length : 0) }} members</span>
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
                  (click)="onJoinChannel(channel)"
                  matTooltip="Join this channel">
            <mat-icon>{{ isChannelMember(channel) ? 'check_circle' : 'chat' }}</mat-icon>
            {{ isChannelMember(channel) ? 'Joined' : 'Join Channel' }}
          </button>
          
          <button mat-button color="accent" 
                  (click)="onViewGroup(channel)"
                  matTooltip="View group details">
            <mat-icon>group</mat-icon>
            View Group
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <!-- Empty State -->
    <div *ngIf="channels.length === 0" class="empty-state">
      <mat-icon class="empty-icon">forum</mat-icon>
      <h3>No channels found</h3>
      <p>Try adjusting your search or filters to find channels.</p>
    </div>
  `,
  styles: [`
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
export class ChannelsGridComponent {
  @Input() channels: Channel[] = [];
  @Input() groups: any[] = [];
  @Input() currentUser: any = null;

  @Output() joinChannel = new EventEmitter<Channel>();

  constructor(private router: Router) { }

  getChannelTypeIcon(type: ChannelType): string {
    switch (type) {
      case ChannelType.TEXT: return 'chat';
      case ChannelType.VOICE: return 'mic';
      case ChannelType.VIDEO: return 'videocam';
      default: return 'forum';
    }
  }

  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  }

  isChannelMember(channel: Channel): boolean {
    if (!this.currentUser) return false;
    return Array.isArray(channel.members) && channel.members.includes(this.currentUser.id);
  }

  canJoinChannel(channel: Channel): boolean {
    if (!this.currentUser) return false;

    // Check if user is already a member
    if (this.isChannelMember(channel)) return false;

    // Check if user is banned from this channel
    if (Array.isArray(channel.bannedUsers) && channel.bannedUsers.includes(this.currentUser.id)) {
      return false;
    }

    // Check if user is a member of the group
    const group = this.groups.find(g => g.id === channel.groupId);
    if (!group || !Array.isArray(group.members) || !group.members.includes(this.currentUser.id)) {
      return false;
    }

    // Check if channel has reached max members
    if (channel.maxMembers && (channel.memberCount || 0) >= channel.maxMembers) {
      return false;
    }

    return true;
  }

  onJoinChannel(channel: Channel): void {
    this.joinChannel.emit(channel);
  }

  onViewGroup(channel: Channel): void {
    console.log('Viewing group for channel:', channel);
    console.log('Group ID:', channel.groupId);
    console.log('Navigating to:', `/group/${channel.groupId}`);

    try {
      this.router.navigate(['/group', channel.groupId]);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
}
