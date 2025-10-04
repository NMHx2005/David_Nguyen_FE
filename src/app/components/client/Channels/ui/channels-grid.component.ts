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
          <div class="channel-header">
            <mat-icon mat-card-avatar class="channel-icon">
              {{ getChannelTypeIcon(channel.type) }}
            </mat-icon>
            <div class="channel-title-section">
              <mat-card-title>{{ channel.name }}</mat-card-title>
              <mat-card-subtitle>
                {{ getGroupName(channel.groupId) }}
              </mat-card-subtitle>
            </div>
            <div class="channel-badges">
              <mat-chip [ngClass]="'type-' + channel.type" class="type-badge">
                {{ channel.type | titlecase }}
              </mat-chip>
              <mat-chip *ngIf="channel.isPrivate" class="privacy-badge private">
                <mat-icon>lock</mat-icon>
                Private
              </mat-chip>
              <mat-chip *ngIf="!channel.isPrivate" class="privacy-badge public">
                <mat-icon>public</mat-icon>
                Public
              </mat-chip>
            </div>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <p class="channel-description">{{ channel.description || 'No description available' }}</p>
          
          <div class="channel-meta">
            <div class="meta-item">
              <mat-icon>group</mat-icon>
              <span>{{ channel.memberCount || 0 }} members</span>
            </div>
            
            <div class="meta-item">
              <mat-icon>schedule</mat-icon>
              <span>{{ channel.createdAt | date:'shortDate' }}</span>
            </div>

            <div class="meta-item" *ngIf="channel.settings && channel.settings.slowMode > 0">
              <mat-icon>timer</mat-icon>
              <span>Slow mode: {{ channel.settings.slowMode }}s</span>
            </div>
          </div>

          <!-- Channel Settings -->
          <div class="channel-settings" *ngIf="channel.settings">
            <div class="settings-grid">
              <div class="setting-item" *ngIf="channel.settings.requireApproval">
                <mat-icon class="setting-icon">verified_user</mat-icon>
                <span>Requires Approval</span>
              </div>
              <div class="setting-item" *ngIf="channel.settings.allowReactions">
                <mat-icon class="setting-icon">emoji_emotions</mat-icon>
                <span>Reactions Enabled</span>
              </div>
              <div class="setting-item" *ngIf="channel.settings.allowPolls">
                <mat-icon class="setting-icon">poll</mat-icon>
                <span>Polls Enabled</span>
              </div>
            </div>
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

    .channel-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
    }

    .channel-title-section {
      flex: 1;
    }

    .channel-badges {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
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

    .type-badge {
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
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

    .privacy-badge {
      font-size: 0.75rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .privacy-badge.private {
      background: #fce4ec !important;
      color: #c2185b !important;
    }

    .privacy-badge.public {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .privacy-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .channel-settings {
      margin-top: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .settings-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #666;
    }

    .setting-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #667eea;
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
    console.log('canJoinChannel called for:', channel.name, 'currentUser:', this.currentUser);
    if (!this.currentUser) {
      console.log('❌ currentUser is null/undefined - disabling join button');
      return false;
    }

    // Check if user is already a member
    if (this.isChannelMember(channel)) return false;

    // Check if user is banned from this channel
    if (Array.isArray(channel.bannedUsers) && channel.bannedUsers.includes(this.currentUser.id)) {
      return false;
    }

    // Check if user is a member of the group
    const group = this.groups.find(g => g.id === channel.groupId);
    if (!group) {
      return false;
    }

    // Check if user is explicitly a member OR is the creator of the group
    const isExplicitMember = Array.isArray(group.members) &&
      group.members.some((member: any) => member.userId === this.currentUser.id);
    const isCreator = group.createdBy === this.currentUser.id;

    // Debug log to see what's happening
    console.log('Debug canJoinChannel:', {
      channelName: channel.name,
      currentUserId: this.currentUser.id,
      groupName: group.name,
      groupCreatedBy: group.createdBy,
      groupMembers: group.members,
      isExplicitMember,
      isCreator,
      canJoin: isExplicitMember || isCreator
    });

    if (!isExplicitMember && !isCreator) {
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
