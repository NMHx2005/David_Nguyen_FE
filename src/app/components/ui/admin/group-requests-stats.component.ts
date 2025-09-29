import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface GroupRequestsStats {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
}

@Component({
    selector: 'app-group-requests-stats',
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
            <mat-icon class="stat-icon pending">pending_actions</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.pendingRequests }}</span>
              <span class="stat-label">Pending Requests</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon approved">check_circle</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.approvedRequests }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon rejected">cancel</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.rejectedRequests }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon total">group_add</mat-icon>
            <div class="stat-content">
              <span class="stat-number">{{ stats.totalRequests }}</span>
              <span class="stat-label">Total Requests</span>
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

    .stat-icon.pending {
      color: #FF9800;
    }

    .stat-icon.approved {
      color: #4CAF50;
    }

    .stat-icon.rejected {
      color: #F44336;
    }

    .stat-icon.total {
      color: #667eea;
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
export class GroupRequestsStatsComponent {
    @Input() stats: GroupRequestsStats = {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
    };

    constructor() { }
}
