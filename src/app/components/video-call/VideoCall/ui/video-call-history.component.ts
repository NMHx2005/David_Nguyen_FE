import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface VideoCall {
  _id: string;
  callId: string;
  initiatorId: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  recipientId: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  channelId: string;
  status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

interface CallStats {
  totalCalls: number;
  acceptedCalls: number;
  rejectedCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
}

@Component({
  selector: 'app-video-call-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule
  ],
  template: `
    <div class="video-call-history">
      <!-- Stats Cards -->
      <div class="stats-container" *ngIf="callStats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">call</mat-icon>
              <div class="stat-info">
                <h3>{{ callStats.totalCalls }}</h3>
                <p>Total Calls</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon success">call_made</mat-icon>
              <div class="stat-info">
                <h3>{{ callStats.acceptedCalls }}</h3>
                <p>Accepted</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon error">call_end</mat-icon>
              <div class="stat-info">
                <h3>{{ callStats.rejectedCalls }}</h3>
                <p>Rejected</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon warning">call_missed</mat-icon>
              <div class="stat-info">
                <h3>{{ callStats.missedCalls }}</h3>
                <p>Missed</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">schedule</mat-icon>
              <div class="stat-info">
                <h3>{{ formatDuration(callStats.totalDuration) }}</h3>
                <p>Total Duration</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">timer</mat-icon>
              <div class="stat-info">
                <h3>{{ formatDuration(callStats.averageDuration) }}</h3>
                <p>Average Duration</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Call History List -->
      <mat-card class="history-card">
        <mat-card-header>
          <mat-card-title>Call History</mat-card-title>
          <button mat-icon-button (click)="loadCallHistory()" [disabled]="loading">
            <mat-icon>refresh</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="30"></mat-spinner>
            <p>Loading call history...</p>
          </div>

          <div *ngIf="!loading && callHistory.length === 0" class="no-calls">
            <mat-icon>call_end</mat-icon>
            <p>No call history found</p>
          </div>

          <mat-list *ngIf="!loading && callHistory.length > 0" class="call-list">
            <mat-list-item *ngFor="let call of callHistory" class="call-item">
              <div class="call-info">
                <div class="call-participants">
                  <div class="participant">
                    <mat-icon>person</mat-icon>
                    <span>{{ call.initiatorId.username }}</span>
                  </div>
                  <mat-icon class="call-direction">arrow_forward</mat-icon>
                  <div class="participant">
                    <mat-icon>person</mat-icon>
                    <span>{{ call.recipientId.username }}</span>
                  </div>
                </div>
                
                <div class="call-details">
                  <span class="call-time">{{ formatDateTime(call.createdAt) }}</span>
                  <span *ngIf="call.duration" class="call-duration">
                    Duration: {{ formatDuration(call.duration) }}
                  </span>
                </div>
              </div>

              <div class="call-status">
                <mat-chip [class]="getStatusClass(call.status)">
                  <mat-icon>{{ getStatusIcon(call.status) }}</mat-icon>
                  {{ getStatusText(call.status) }}
                </mat-chip>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .video-call-history {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #2196f3;
    }

    .stat-icon.success {
      color: #4caf50;
    }

    .stat-icon.error {
      color: #f44336;
    }

    .stat-icon.warning {
      color: #ff9800;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .history-card {
      margin-top: 16px;
    }

    .history-card .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .loading-container, .no-calls {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #666;
    }

    .no-calls mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .call-list {
      padding: 0;
    }

    .call-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .call-item:last-child {
      border-bottom: none;
    }

    .call-info {
      flex: 1;
    }

    .call-participants {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .call-direction {
      color: #666;
      font-size: 18px;
    }

    .call-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .call-time {
      font-size: 14px;
      color: #666;
    }

    .call-duration {
      font-size: 12px;
      color: #999;
    }

    .call-status {
      margin-left: 16px;
    }

    .status-initiated {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-ringing {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-accepted {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-ended {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .status-missed {
      background-color: #fafafa;
      color: #616161;
    }

    @media (max-width: 768px) {
      .stats-container {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }

      .call-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .call-status {
        margin-left: 0;
        align-self: flex-end;
      }
    }
  `]
})
export class VideoCallHistoryComponent implements OnInit, OnDestroy {
  callHistory: VideoCall[] = [];
  callStats: CallStats | null = null;
  loading = false;
  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadCallHistory();
    this.loadCallStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCallHistory(): void {
    this.loading = true;
    const token = localStorage.getItem('accessToken');

    this.subscriptions.push(
      this.http.get<{ success: boolean; data: VideoCall[] }>(`${environment.apiUrl}/api/video-calls/history`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.callHistory = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading call history:', error);
          this.loading = false;
        }
      })
    );
  }

  loadCallStats(): void {
    const token = localStorage.getItem('accessToken');

    this.subscriptions.push(
      this.http.get<{ success: boolean; data: CallStats }>(`${environment.apiUrl}/api/video-calls/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.callStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading call stats:', error);
        }
      })
    );
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'initiated': 'call_made',
      'ringing': 'call',
      'accepted': 'call_received',
      'rejected': 'call_end',
      'ended': 'call_end',
      'missed': 'call_missed'
    };
    return icons[status] || 'call';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'initiated': 'Initiated',
      'ringing': 'Ringing',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'ended': 'Ended',
      'missed': 'Missed'
    };
    return texts[status] || status;
  }
}
