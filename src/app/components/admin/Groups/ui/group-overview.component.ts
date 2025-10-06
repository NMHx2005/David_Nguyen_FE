import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group, GroupStatus } from '../../../../models';

/**
 * Pure UI Component - Group Overview
 * Displays group information with no business logic
 */
@Component({
  selector: 'app-group-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-grid">
      <!-- Group Info Card -->
      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="material-icons">info</i>
            Group Information
          </h2>
          <div class="status-badge" [ngClass]="getStatusClass(group.status || GroupStatus.ACTIVE)">
            {{ group.status || GroupStatus.ACTIVE }}
          </div>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span>{{ group.name }}</span>
            </div>
            <div class="info-item">
              <label>Category:</label>
              <span class="category-tag">{{ group.category }}</span>
            </div>
            <div class="info-item">
              <label>Members:</label>
              <span>{{ group.memberCount || (group.members.length || 0) }} members</span>
            </div>
            <div class="info-item">
              <label>Channels:</label>
              <span>{{ group.channels?.length || 0 }} channels</span>
            </div>
            <div class="info-item">
              <label>Created:</label>
              <span>{{ group.createdAt | date:'shortDate' }}</span>
            </div>
            <div class="info-item">
              <label>Last Updated:</label>
              <span>{{ group.updatedAt | date:'shortDate' }}</span>
            </div>
            <div class="info-item">
              <label>Privacy:</label>
              <span class="privacy-tag" [ngClass]="group.isPrivate ? 'private' : 'public'">
                {{ group.isPrivate ? 'Private' : 'Public' }}
              </span>
            </div>
            <div class="info-item">
              <label>Max Members:</label>
              <span>{{ group.maxMembers || 'Unlimited' }}</span>
            </div>
          </div>
          <div class="description-section" *ngIf="group.description">
            <label>Description:</label>
            <p class="description-text">{{ group.description }}</p>
          </div>
          
          <div class="tags-section" *ngIf="group.tags && group.tags.length > 0">
            <label>Tags:</label>
            <div class="tags-container">
              <span *ngFor="let tag of group.tags" class="tag-chip">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Card -->
      <div class="stats-card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="material-icons">analytics</i>
            Statistics
          </h2>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalMembers }}</div>
              <div class="stat-label">Total Members</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.activeMembers }}</div>
              <div class="stat-label">Active Members</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalChannels }}</div>
              <div class="stat-label">Channels</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.inactiveMembers }}</div>
              <div class="stat-label">Inactive Members</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .info-card, .stats-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .card-title i {
      font-size: 20px;
      color: #667eea;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .card-content {
      padding: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #666;
    }

    .info-item span {
      font-size: 1rem;
      color: #333;
    }

    .category-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      display: inline-block;
    }

    .description-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .description-section label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #666;
      display: block;
      margin-bottom: 8px;
    }

    .description-text {
      margin: 0;
      color: #333;
      line-height: 1.5;
    }

    .privacy-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      display: inline-block;
    }

    .privacy-tag.private {
      background: #ffebee;
      color: #c62828;
    }

    .privacy-tag.public {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .tags-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .tags-section label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #666;
      display: block;
      margin-bottom: 8px;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-chip {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .overview-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
    }
  `]
})
export class GroupOverviewComponent {
  @Input() group!: Group;
  @Input() stats!: {
    totalMembers: number;
    totalChannels: number;
    activeMembers: number;
    inactiveMembers: number;
  };

  GroupStatus = GroupStatus;

  getStatusClass(status: GroupStatus): string {
    switch (status) {
      case GroupStatus.ACTIVE:
        return 'active';
      case GroupStatus.INACTIVE:
        return 'inactive';
      default:
        return 'inactive';
    }
  }
}