import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { OfflineService, ConnectionStatus } from '../../../services/offline.service';

@Component({
    selector: 'app-connection-status',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule,
    ],
    template: `
    <div class="connection-status" [class]="'status-' + getConnectionQuality()">
      <!-- Online Status -->
      <div *ngIf="connectionStatus.isOnline" class="status-online">
        <mat-icon [class]="'quality-icon ' + getConnectionQuality()">
          {{ getConnectionIcon() }}
        </mat-icon>
        <span class="status-text">{{ getConnectionText() }}</span>
        <mat-chip 
          *ngIf="showQualityChip" 
          [class]="'quality-chip ' + getConnectionQuality()"
          [matTooltip]="getConnectionTooltip()">
          {{ getConnectionQuality().toUpperCase() }}
        </mat-chip>
      </div>

      <!-- Offline Status -->
      <div *ngIf="!connectionStatus.isOnline" class="status-offline">
        <mat-icon class="offline-icon">wifi_off</mat-icon>
        <span class="status-text">Offline</span>
        <mat-chip 
          *ngIf="offlineDuration" 
          class="offline-chip"
          [matTooltip]="'Offline for ' + formatDuration(offlineDuration)">
          {{ formatDuration(offlineDuration) }}
        </mat-chip>
      </div>

      <!-- Connection Details (on hover) -->
      <div class="connection-details" [matTooltip]="getDetailedTooltip()">
        <mat-icon>info</mat-icon>
      </div>
    </div>
  `,
    styles: [`
    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      font-size: 14px;
      color: white;
    }

    .status-online {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-offline {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ff6b6b;
    }

    .status-text {
      font-weight: 500;
      font-size: 13px;
    }

    .quality-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .quality-icon.fast {
      color: #4CAF50;
    }

    .quality-icon.medium {
      color: #FF9800;
    }

    .quality-icon.slow {
      color: #f44336;
    }

    .quality-icon.unknown {
      color: #9E9E9E;
    }

    .offline-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #ff6b6b;
    }

    .quality-chip {
      font-size: 10px;
      height: 20px;
      min-height: 20px;
    }

    .quality-chip.fast {
      background-color: #4CAF50;
      color: white;
    }

    .quality-chip.medium {
      background-color: #FF9800;
      color: white;
    }

    .quality-chip.slow {
      background-color: #f44336;
      color: white;
    }

    .quality-chip.unknown {
      background-color: #9E9E9E;
      color: white;
    }

    .offline-chip {
      background-color: #ff6b6b;
      color: white;
      font-size: 10px;
      height: 20px;
      min-height: 20px;
    }

    .connection-details {
      margin-left: 4px;
      opacity: 0.7;
      cursor: help;
    }

    .connection-details mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Status-specific styling */
    .status-fast {
      border-color: rgba(76, 175, 80, 0.3);
      background: rgba(76, 175, 80, 0.1);
    }

    .status-medium {
      border-color: rgba(255, 152, 0, 0.3);
      background: rgba(255, 152, 0, 0.1);
    }

    .status-slow {
      border-color: rgba(244, 67, 54, 0.3);
      background: rgba(244, 67, 54, 0.1);
    }

    .status-unknown {
      border-color: rgba(158, 158, 158, 0.3);
      background: rgba(158, 158, 158, 0.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .connection-status {
        padding: 6px 10px;
        font-size: 12px;
      }

      .status-text {
        font-size: 11px;
      }

      .quality-icon, .offline-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .quality-chip, .offline-chip {
        font-size: 9px;
        height: 18px;
        min-height: 18px;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .connection-status {
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
    @Input() showQualityChip: boolean = true;
    @Input() showOfflineDuration: boolean = true;

    private destroy$ = new Subject<void>();

    // Services
    offlineService = inject(OfflineService);

    // Component state
    connectionStatus: ConnectionStatus = { isOnline: navigator.onLine };
    offlineDuration: number | null = null;

    ngOnInit(): void {
        // Subscribe to connection status
        this.offlineService.connectionStatus$
            .pipe(takeUntil(this.destroy$))
            .subscribe(status => {
                this.connectionStatus = status;
                this.updateOfflineDuration();
            });

        // Update offline duration every second
        setInterval(() => {
            this.updateOfflineDuration();
        }, 1000);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Update offline duration
     */
    private updateOfflineDuration(): void {
        this.offlineDuration = this.offlineService.getOfflineDuration();
    }

    /**
     * Get connection quality
     */
    getConnectionQuality(): 'fast' | 'medium' | 'slow' | 'unknown' {
        return this.offlineService.getConnectionQuality();
    }

    /**
     * Get connection icon
     */
    getConnectionIcon(): string {
        if (!this.connectionStatus.isOnline) {
            return 'wifi_off';
        }

        const quality = this.getConnectionQuality();
        switch (quality) {
            case 'fast':
                return 'wifi';
            case 'medium':
                return 'wifi_2_bar';
            case 'slow':
                return 'wifi_1_bar';
            default:
                return 'wifi_off';
        }
    }

    /**
     * Get connection text
     */
    getConnectionText(): string {
        if (!this.connectionStatus.isOnline) {
            return 'Offline';
        }

        const quality = this.getConnectionQuality();
        switch (quality) {
            case 'fast':
                return 'Fast';
            case 'medium':
                return 'Medium';
            case 'slow':
                return 'Slow';
            default:
                return 'Online';
        }
    }

    /**
     * Get connection tooltip
     */
    getConnectionTooltip(): string {
        if (!this.connectionStatus.isOnline) {
            return 'You are offline';
        }

        const quality = this.getConnectionQuality();
        const status = this.connectionStatus;

        let tooltip = `Connection: ${quality.toUpperCase()}`;

        if (status.connectionType) {
            tooltip += `\nType: ${status.connectionType}`;
        }

        if (status.downlink) {
            tooltip += `\nSpeed: ${status.downlink.toFixed(1)} Mbps`;
        }

        return tooltip;
    }

    /**
     * Get detailed tooltip
     */
    getDetailedTooltip(): string {
        const status = this.connectionStatus;
        let tooltip = `Online: ${status.isOnline ? 'Yes' : 'No'}`;

        if (status.lastOnlineTime) {
            tooltip += `\nLast Online: ${status.lastOnlineTime.toLocaleString()}`;
        }

        if (status.lastOfflineTime) {
            tooltip += `\nLast Offline: ${status.lastOfflineTime.toLocaleString()}`;
        }

        if (status.connectionType) {
            tooltip += `\nConnection Type: ${status.connectionType}`;
        }

        if (status.downlink) {
            tooltip += `\nDownload Speed: ${status.downlink.toFixed(1)} Mbps`;
        }

        if (status.effectiveType) {
            tooltip += `\nEffective Type: ${status.effectiveType}`;
        }

        return tooltip;
    }

    /**
     * Format duration
     */
    formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}
