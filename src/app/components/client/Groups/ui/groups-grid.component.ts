import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Group, GroupStatus } from '../../../../models/group.model';

@Component({
  selector: 'app-groups-grid',
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
    <div class="groups-container">
      <mat-card *ngFor="let group of groups" class="group-card">
        <mat-card-header>
          <div class="group-header">
            <mat-card-title>{{ group.name }}</mat-card-title>
            <div class="group-badges">
              <mat-chip class="group-status" [ngClass]="'status-' + (group.status || 'active').toLowerCase()">
                {{ getStatusLabel(group.status || 'active') }}
              </mat-chip>
              <mat-chip *ngIf="group.isPrivate" class="privacy-badge private">
                <mat-icon>lock</mat-icon>
                Private
              </mat-chip>
              <mat-chip *ngIf="!group.isPrivate" class="privacy-badge public">
                <mat-icon>public</mat-icon>
                Public
              </mat-chip>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <p class="group-description">{{ group.description || 'No description available' }}</p>

          <div class="group-meta">
            <div class="meta-item">
              <mat-icon>groups</mat-icon>
              <span>{{ group.memberCount || 0 }} members</span>
            </div>
            <div class="meta-item">
              <mat-icon>chat</mat-icon>
              <span>{{ group.channels?.length || 0 }} channels</span>
            </div>
            <div class="meta-item">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ formatDate(group.createdAt) }}</span>
            </div>
            <div class="meta-item" *ngIf="group.maxMembers">
              <mat-icon>person_add</mat-icon>
              <span>Max: {{ group.maxMembers }}</span>
            </div>
          </div>

          <div class="group-categories" *ngIf="group.tags && group.tags.length > 0">
            <mat-chip *ngFor="let tag of group.tags" class="category-tag">
              {{ tag }}
            </mat-chip>
          </div>
          
          <div class="group-categories" *ngIf="(!group.tags || group.tags.length === 0) && group.category">
            <mat-chip class="category-tag">
              {{ group.category | titlecase }}
            </mat-chip>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button 
            *ngIf="!isMember(group) && !hasPendingRequest(group)"
            mat-raised-button
            color="primary"
            (click)="onRegisterInterest(group)"
            [disabled]="group.status === 'inactive'"
            matTooltip="{{ group.status === 'inactive' ? 'Group is inactive - not accepting new members' : 'Register interest to join' }}">
            {{ group.status === 'inactive' ? 'Inactive' : 'Register Interest' }}
          </button>

          <button 
            *ngIf="isMember(group)"
            mat-button
            color="accent"
            (click)="onViewGroup(group)"
            matTooltip="{{ group.status === 'inactive' ? 'Group is inactive but you can still chat' : 'View group details' }}">
            <mat-icon>visibility</mat-icon>
            {{ group.status === 'inactive' ? 'View Group (Inactive)' : 'View Group' }}
          </button>

          <button 
            *ngIf="hasPendingRequest(group)"
            mat-button
            color="accent"
            disabled
            matTooltip="Request pending approval">
            Request Pending
          </button>

          <button 
            *ngIf="!isMember(group) && group.status === GroupStatus.PENDING"
            mat-button
            color="accent"
            (click)="onRequestInvite(group)"
            matTooltip="Request an invitation">
            <mat-icon>mail</mat-icon>
            Request Invite
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <!-- Empty State -->
    <div *ngIf="groups.length === 0" class="empty-state">
      <mat-icon class="empty-icon">group_work</mat-icon>
      <h3>No groups found</h3>
      <p>Try adjusting your search criteria or check back later for new groups.</p>
    </div>
  `,
  styles: [`
    .groups-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .group-card {
      border-radius: 12px;
      transition: all 0.3s ease;
      background: white;
    }

    .group-card:hover {
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
      transform: translateY(-4px);
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .group-header mat-card-title {
      font-size: 1.3rem;
      color: #333;
      margin: 0;
      flex: 1;
    }

    .group-badges {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }

    .group-status {
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .group-status.status-active {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .group-status.status-inactive {
      background: #fce4ec !important;
      color: #c2185b !important;
    }

    .group-status.status-pending {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
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

    .group-description {
      color: #666;
      line-height: 1.5;
      margin: 16px 0;
    }

    .group-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .group-categories {
      margin-bottom: 16px;
    }

    .category-tag {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .group-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
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
      .groups-container {
        grid-template-columns: 1fr;
      }

      .group-actions {
        flex-direction: column;
      }
    }
  `]
})
export class GroupsGridComponent {
  @Input() groups: Group[] = [];
  @Input() currentUser: any = null;
  @Input() pendingRequests: string[] = [];

  GroupStatus = GroupStatus;

  @Output() registerInterest = new EventEmitter<string>();
  @Output() viewGroup = new EventEmitter<string>();
  @Output() requestInvite = new EventEmitter<string>();

  getStatusLabel(status: GroupStatus | string): string {
    const s = (typeof status === 'string') ? status.toLowerCase() : (status as any)?.toString()?.toLowerCase();
    switch (s) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  isMember(group: Group): boolean {
    return group.isJoined || false;
  }

  hasPendingRequest(group: Group): boolean {
    return this.pendingRequests.includes(group.id);
  }

  onRegisterInterest(group: Group): void {
    this.registerInterest.emit(group.id);
  }

  onViewGroup(group: Group): void {
    this.viewGroup.emit(group.id);
  }

  onRequestInvite(group: Group): void {
    this.requestInvite.emit(group.id);
  }
}
