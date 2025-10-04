import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface ChannelStats {
  totalChannels: number;
  activeChannels: number;
  textChannels: number;
  voiceChannels: number;
  videoChannels: number;
}

@Component({
  selector: 'app-channels-stats',
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
            <mat-icon class="stat-icon">chat</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.totalChannels }}</h3>
            <p>Total Channels</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">textsms</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.textChannels }}</h3>
            <p>Text Channels</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">record_voice_over</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.voiceChannels }}</h3>
            <p>Voice Channels</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">videocam</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.videoChannels }}</h3>
            <p>Video Channels</p>
          </div>
        </div>
      </mat-card>

      <mat-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon-container">
            <mat-icon class="stat-icon">check_circle</mat-icon>
          </div>
          <div class="stat-details">
            <h3>{{ stats.activeChannels }}</h3>
            <p>Active Channels</p>
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
export class ChannelsStatsComponent {
  @Input() stats: ChannelStats = {
    totalChannels: 0,
    activeChannels: 0,
    textChannels: 0,
    voiceChannels: 0,
    videoChannels: 0
  };

  constructor() { }
}
