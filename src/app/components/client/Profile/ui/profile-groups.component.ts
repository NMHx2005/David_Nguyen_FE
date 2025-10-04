import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Group } from '../../../../models/group.model';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-profile-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="section">
      <div class="section-header">
        <mat-icon>groups</mat-icon>
        <h2>My Groups</h2>
        <span class="group-count">{{ myGroups.length }} groups</span>
      </div>
      <mat-divider></mat-divider>
      
      <div class="groups-grid" *ngIf="myGroups.length > 0; else noGroups">
        <mat-card *ngFor="let group of myGroups" class="group-card">
          <mat-card-header>
            <mat-card-title>{{ group.name }}</mat-card-title>
            <mat-card-subtitle>{{ group.description }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="group-meta">
              <div class="meta-item">
                <mat-icon>people</mat-icon>
                <span>{{ group.members.length || 0 }} members</span>
              </div>
              <div class="meta-item">
                <mat-icon>chat</mat-icon>
                <span>{{ group.channels?.length || 0 }} channels</span>
              </div>
            </div>
            
            <div class="group-role">
              <mat-chip-set>
                <mat-chip 
                  *ngIf="isGroupAdmin(group)" 
                  color="accent" 
                  selected>
                  <mat-icon matChipAvatar>admin_panel_settings</mat-icon>
                  Admin
                </mat-chip>
                <mat-chip 
                  *ngIf="!isGroupAdmin(group)" 
                  color="primary" 
                  selected>
                  <mat-icon matChipAvatar>person</mat-icon>
                  Member
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button 
              mat-button 
              color="primary" 
              (click)="onViewGroup(group.id)"
              matTooltip="View group details">
              <mat-icon>visibility</mat-icon>
              View Group
            </button>
            
            <button 
              *ngIf="!isGroupAdmin(group)" 
              mat-button 
              color="warn" 
              (click)="onLeaveGroup(group)"
              matTooltip="Leave this group">
              <mat-icon>exit_to_app</mat-icon>
              Leave
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <ng-template #noGroups>
        <div class="no-groups">
          <mat-icon class="no-groups-icon">group_work</mat-icon>
          <h3>No Groups Yet</h3>
          <p>You haven't joined any groups yet. Browse available groups to get started!</p>
          <button mat-raised-button color="primary" (click)="onBrowseGroups()">
            <mat-icon>search</mat-icon>
            Browse Groups
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-header mat-icon {
      color: #667eea;
      font-size: 24px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .group-count {
      margin-left: auto;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .group-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .group-card:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
    }

    .group-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9rem;
    }

    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .group-role {
      margin-bottom: 16px;
    }

    .no-groups {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-groups-icon {
      font-size: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .no-groups h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-groups p {
      margin: 0 0 24px 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .groups-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-wrap: wrap;
      }

      .group-count {
        margin-left: 0;
        margin-top: 8px;
      }
    }
  `]
})
export class ProfileGroupsComponent {
  @Input() myGroups: Group[] = [];
  @Input() currentUser: User | null = null;

  @Output() viewGroup = new EventEmitter<string>();
  @Output() leaveGroup = new EventEmitter<Group>();
  @Output() browseGroups = new EventEmitter<void>();

  isGroupAdmin(group: Group): boolean {
    if (!this.currentUser || !group.admins) return false;
    return group.admins.includes(this.currentUser.id);
  }

  onViewGroup(groupId: string): void {
    this.viewGroup.emit(groupId);
  }

  onLeaveGroup(group: Group): void {
    this.leaveGroup.emit(group);
  }

  onBrowseGroups(): void {
    this.browseGroups.emit();
  }
}
