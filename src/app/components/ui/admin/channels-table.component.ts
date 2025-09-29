import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { Channel, ChannelType } from '../../../models/channel.model';
import { User, UserRole } from '../../../models/user.model';
import { Group } from '../../../models/group.model';

@Component({
    selector: 'app-channels-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        MatCardModule
    ],
    template: `
    <mat-card class="channels-table-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>chat</mat-icon>
          Channels List ({{ channels.length }})
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="channels" class="channels-table">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Channel Name</th>
              <td mat-cell *matCellDef="let channel">
                <div class="channel-info">
                  <strong>{{ channel.name }}</strong>
                  <small>{{ channel.description }}</small>
                </div>
              </td>
            </ng-container>

            <!-- Group Column -->
            <ng-container matColumnDef="group">
              <th mat-header-cell *matHeaderCellDef>Group</th>
              <td mat-cell *matCellDef="let channel">
                {{ getGroupName(channel.groupId) }}
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let channel">
                <mat-chip [class]="'type-' + channel.type.toLowerCase()">
                  {{ getTypeDisplayName(channel.type) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Members Column -->
            <ng-container matColumnDef="members">
              <th mat-header-cell *matHeaderCellDef>Members</th>
              <td mat-cell *matCellDef="let channel">
                {{ channel.memberCount || (channel.members?.length || 0) }} / {{ channel.maxMembers }}
              </td>
            </ng-container>

            <!-- Created By Column -->
            <ng-container matColumnDef="createdBy">
              <th mat-header-cell *matHeaderCellDef>Created By</th>
              <td mat-cell *matCellDef="let channel">
                {{ getCreatorName(channel.createdBy) }}
              </td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let channel">
                {{ channel.createdAt | date:'shortDate' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let channel">
                <div class="action-buttons">
                  <button mat-icon-button matTooltip="View Channel" (click)="onViewChannel.emit(channel)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  
                  <button mat-icon-button matTooltip="Edit Channel" 
                          (click)="onEditChannel.emit(channel)"
                          [disabled]="!canEditChannel(channel)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  
                  <button mat-icon-button matTooltip="Ban User" 
                          (click)="onBanUser.emit(channel)"
                          [disabled]="!canBanUserFromChannel(channel)">
                    <mat-icon>block</mat-icon>
                  </button>
                  
                  <button mat-icon-button matTooltip="Delete Channel" 
                          (click)="onDeleteChannel.emit(channel)"
                          [disabled]="!canDeleteChannel(channel)"
                          class="delete-action">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="channels.length === 0" class="empty-state">
          <mat-icon class="empty-icon">chat_bubble_outline</mat-icon>
          <h3>No Channels Found</h3>
          <p>Try adjusting your search criteria or create a new channel.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    .channels-table-card {
      margin-bottom: 24px;
    }

    .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .channels-table {
      width: 100%;
    }

    .channels-table th.mat-header-cell {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tr.mat-row:hover {
      background-color: #f5f5f5;
    }

    .channel-info {
      display: flex;
      flex-direction: column;
    }

    .channel-info small {
      color: #7f8c8d;
      font-size: 11px;
      margin-top: 2px;
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

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .delete-action {
      color: #e74c3c !important;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .empty-state p {
      margin: 0;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ChannelsTableComponent {
    @Input() channels: Channel[] = [];
    @Input() currentUser: User | null = null;
    @Input() groups: Group[] = [];

    @Output() onViewChannel = new EventEmitter<Channel>();
    @Output() onEditChannel = new EventEmitter<Channel>();
    @Output() onBanUser = new EventEmitter<Channel>();
    @Output() onDeleteChannel = new EventEmitter<Channel>();

    displayedColumns = ['name', 'group', 'type', 'members', 'createdBy', 'created', 'actions'];

    constructor() { }

    getGroupName(groupId: string): string {
        const group = this.groups.find(g => g.id === groupId);
        return group ? group.name : `Group ${groupId}`;
    }

    getTypeDisplayName(type: ChannelType): string {
        switch (type) {
            case ChannelType.TEXT: return 'Text';
            case ChannelType.VOICE: return 'Voice';
            case ChannelType.VIDEO: return 'Video';
            default: return type;
        }
    }

    getCreatorName(creatorId: string): string {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const creator = users.find((u: any) => u.id === creatorId);
        return creator ? creator.username : 'Unknown';
    }

    canEditChannel(channel: Channel): boolean {
        if (!this.currentUser) return false;
        // Super admins can edit all channels
        if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
        // Group admins can edit channels in their groups
        if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            return channel.createdBy === this.currentUser.id;
        }
        return false;
    }

    canBanUserFromChannel(channel: Channel): boolean {
        if (!this.currentUser) return false;
        // Super admins and group admins can ban users
        return this.currentUser.roles.includes(UserRole.SUPER_ADMIN) ||
            this.currentUser.roles.includes(UserRole.GROUP_ADMIN);
    }

    canDeleteChannel(channel: Channel): boolean {
        if (!this.currentUser) return false;
        // Super admins can delete all channels
        if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
        // Group admins can delete channels they created
        if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            return channel.createdBy === this.currentUser.id;
        }
        return false;
    }
}
