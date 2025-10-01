import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-groups-stats',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    template: `
    <div class="stats-grid">
      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">group_work</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.total }}</h3>
            <p>Total Groups</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">check_circle</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.active }}</h3>
            <p>Active Groups</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">pause_circle</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.inactive }}</h3>
            <p>Inactive Groups</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">schedule</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.pending }}</h3>
            <p>Pending Groups</p>
          </div>
        </div>
      </mat-card>
    </div>
  `,
    styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .stat-icon-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon {
      font-size: 32px;
      color: white;
      width: 32px;
      height: 32px;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .stat-details p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GroupsStatsComponent {
    @Input() stats: { total: number; active: number; inactive: number; pending: number } = {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0
    };
}
