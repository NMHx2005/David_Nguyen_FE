import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface UserStats {
    totalUsers: number;
    superAdmins: number;
    groupAdmins: number;
    activeUsers: number;
}

@Component({
    selector: 'app-users-stats',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    template: `
    <mat-card class="stats-card">
      <mat-card-content>
        <div class="stats-grid">
          <div class="stat-item">
            <mat-icon class="stat-icon total">people</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.totalUsers }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon super-admin">admin_panel_settings</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.superAdmins }}</span>
              <span class="stat-label">Super Admins</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon group-admin">group_work</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.groupAdmins }}</span>
              <span class="stat-label">Group Admins</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon active">check_circle</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.activeUsers }}</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    .stats-card {
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .stat-icon.total {
      color: #667eea;
    }

    .stat-icon.super-admin {
      color: #FF5722;
    }

    .stat-icon.group-admin {
      color: #2196F3;
    }

    .stat-icon.active {
      color: #4CAF50;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UsersStatsComponent {
    @Input() stats: UserStats = {
        totalUsers: 0,
        superAdmins: 0,
        groupAdmins: 0,
        activeUsers: 0
    };

    constructor() { }
}
