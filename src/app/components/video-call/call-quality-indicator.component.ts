import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { WebRTCService, WebRTCStats } from '../../services/webrtc.service';

@Component({
    selector: 'app-call-quality-indicator',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatChipsModule,
    ],
    template: `
    <div class="quality-indicator" [class]="'quality-' + (qualityStats?.connectionQuality || 'unknown')">
      <!-- Connection Quality Badge -->
      <div class="quality-badge" [matTooltip]="getQualityTooltip()">
        <mat-icon [class]="'quality-icon ' + (qualityStats?.connectionQuality || 'unknown')">
          {{ getQualityIcon() }}
        </mat-icon>
        <span class="quality-text">{{ getQualityText() }}</span>
      </div>

      <!-- Detailed Quality Metrics (Expanded View) -->
      <div *ngIf="showDetails" class="quality-details">
        <div class="metrics-grid">
          <!-- Audio Level -->
          <div class="metric-item">
            <div class="metric-header">
              <mat-icon>mic</mat-icon>
              <span>Audio Level</span>
            </div>
            <div class="metric-value">
              <mat-progress-bar 
                [value]="(qualityStats?.audioLevel || 0) * 100" 
                mode="determinate"
                [class]="'audio-level ' + getAudioLevelClass()">
              </mat-progress-bar>
              <span class="metric-text">{{ formatAudioLevel(qualityStats?.audioLevel || 0) }}</span>
            </div>
          </div>

          <!-- Video Bitrate -->
          <div class="metric-item">
            <div class="metric-header">
              <mat-icon>videocam</mat-icon>
              <span>Video Quality</span>
            </div>
            <div class="metric-value">
              <mat-chip [class]="'bitrate-chip ' + getBitrateClass()">
                {{ formatBitrate(qualityStats?.videoBitrate || 0) }}
              </mat-chip>
              <span class="metric-text">{{ qualityStats?.resolution || '0x0' }}</span>
            </div>
          </div>

          <!-- Latency -->
          <div class="metric-item">
            <div class="metric-header">
              <mat-icon>speed</mat-icon>
              <span>Latency</span>
            </div>
            <div class="metric-value">
              <mat-chip [class]="'latency-chip ' + getLatencyClass()">
                {{ formatLatency(qualityStats?.latency || 0) }}
              </mat-chip>
            </div>
          </div>

          <!-- Packet Loss -->
          <div class="metric-item">
            <div class="metric-header">
              <mat-icon>network_check</mat-icon>
              <span>Packet Loss</span>
            </div>
            <div class="metric-value">
              <mat-chip [class]="'packet-loss-chip ' + getPacketLossClass()">
                {{ formatPacketLoss(qualityStats?.packetLoss || 0) }}
              </mat-chip>
            </div>
          </div>

          <!-- Frame Rate -->
          <div class="metric-item">
            <div class="metric-header">
              <mat-icon>movie</mat-icon>
              <span>Frame Rate</span>
            </div>
            <div class="metric-value">
              <span class="metric-text">{{ roundFrameRate(qualityStats?.frameRate || 0) }} fps</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Toggle Details Button -->
      <button mat-icon-button 
              (click)="toggleDetails()" 
              class="toggle-details-btn"
              matTooltip="Toggle Quality Details">
        <mat-icon>{{ showDetails ? 'expand_less' : 'expand_more' }}</mat-icon>
      </button>
    </div>
  `,
    styles: [`
    .quality-indicator {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 12px;
      color: white;
      z-index: 1000;
      min-width: 200px;
      transition: all 0.3s ease;
    }

    .quality-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .quality-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .quality-icon.excellent {
      color: #4CAF50;
    }

    .quality-icon.good {
      color: #8BC34A;
    }

    .quality-icon.fair {
      color: #FF9800;
    }

    .quality-icon.poor {
      color: #f44336;
    }

    .quality-icon.unknown {
      color: #9E9E9E;
    }

    .quality-text {
      font-size: 14px;
      font-weight: 500;
    }

    .quality-details {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .metrics-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #ccc;
    }

    .metric-header mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .metric-value {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .metric-text {
      font-size: 12px;
      color: #fff;
    }

    .audio-level {
      flex: 1;
      height: 4px;
    }

    .audio-level.excellent {
      background-color: #4CAF50;
    }

    .audio-level.good {
      background-color: #8BC34A;
    }

    .audio-level.fair {
      background-color: #FF9800;
    }

    .audio-level.poor {
      background-color: #f44336;
    }

    .bitrate-chip, .latency-chip, .packet-loss-chip {
      font-size: 10px;
      height: 20px;
      min-height: 20px;
    }

    .bitrate-chip.excellent {
      background-color: #4CAF50;
      color: white;
    }

    .bitrate-chip.good {
      background-color: #8BC34A;
      color: white;
    }

    .bitrate-chip.fair {
      background-color: #FF9800;
      color: white;
    }

    .bitrate-chip.poor {
      background-color: #f44336;
      color: white;
    }

    .latency-chip.excellent {
      background-color: #4CAF50;
      color: white;
    }

    .latency-chip.good {
      background-color: #8BC34A;
      color: white;
    }

    .latency-chip.fair {
      background-color: #FF9800;
      color: white;
    }

    .latency-chip.poor {
      background-color: #f44336;
      color: white;
    }

    .packet-loss-chip.excellent {
      background-color: #4CAF50;
      color: white;
    }

    .packet-loss-chip.good {
      background-color: #8BC34A;
      color: white;
    }

    .packet-loss-chip.fair {
      background-color: #FF9800;
      color: white;
    }

    .packet-loss-chip.poor {
      background-color: #f44336;
      color: white;
    }

    .toggle-details-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      color: white;
      width: 24px;
      height: 24px;
    }

    .toggle-details-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Quality-specific styling */
    .quality-indicator.quality-excellent {
      border-left: 4px solid #4CAF50;
    }

    .quality-indicator.quality-good {
      border-left: 4px solid #8BC34A;
    }

    .quality-indicator.quality-fair {
      border-left: 4px solid #FF9800;
    }

    .quality-indicator.quality-poor {
      border-left: 4px solid #f44336;
    }

    .quality-indicator.quality-unknown {
      border-left: 4px solid #9E9E9E;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .quality-indicator {
        top: 10px;
        right: 10px;
        min-width: 160px;
        padding: 8px;
      }

      .metrics-grid {
        gap: 8px;
      }

      .metric-item {
        gap: 2px;
      }

      .metric-header {
        font-size: 10px;
      }

      .metric-text {
        font-size: 10px;
      }
    }
  `]
})
export class CallQualityIndicatorComponent implements OnInit, OnDestroy {
    @Input() showDetails: boolean = false;

    private destroy$ = new Subject<void>();

    // Services
    webrtcService = inject(WebRTCService);

    // Component state
    qualityStats: WebRTCStats | null = null;

    ngOnInit(): void {
        this.webrtcService.qualityStats$
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => {
                this.qualityStats = stats;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Toggle details view
     */
    toggleDetails(): void {
        this.showDetails = !this.showDetails;
    }

    /**
     * Get quality icon
     */
    getQualityIcon(): string {
        switch (this.qualityStats?.connectionQuality) {
            case 'excellent': return 'signal_cellular_4_bar';
            case 'good': return 'signal_cellular_3_bar';
            case 'fair': return 'signal_cellular_2_bar';
            case 'poor': return 'signal_cellular_1_bar';
            default: return 'signal_cellular_off';
        }
    }

    /**
     * Get quality text
     */
    getQualityText(): string {
        switch (this.qualityStats?.connectionQuality) {
            case 'excellent': return 'Excellent';
            case 'good': return 'Good';
            case 'fair': return 'Fair';
            case 'poor': return 'Poor';
            default: return 'Unknown';
        }
    }

    /**
     * Get quality tooltip
     */
    getQualityTooltip(): string {
        if (!this.qualityStats) return 'Quality metrics unavailable';

        return `Connection Quality: ${this.getQualityText()}
Latency: ${this.formatLatency(this.qualityStats.latency)}
Packet Loss: ${this.formatPacketLoss(this.qualityStats.packetLoss)}
Resolution: ${this.qualityStats.resolution}`;
    }

    /**
     * Format audio level
     */
    formatAudioLevel(level: number): string {
        return `${Math.round(level * 100)}%`;
    }

    /**
     * Format bitrate
     */
    formatBitrate(bitrate: number): string {
        if (bitrate >= 1000000) {
            return `${(bitrate / 1000000).toFixed(1)} Mbps`;
        } else if (bitrate >= 1000) {
            return `${(bitrate / 1000).toFixed(1)} Kbps`;
        } else {
            return `${bitrate} bps`;
        }
    }

    /**
     * Format latency
     */
    formatLatency(latency: number): string {
        return `${Math.round(latency)} ms`;
    }

    /**
     * Format packet loss
     */
    formatPacketLoss(packetLoss: number): string {
        return `${packetLoss.toFixed(1)}%`;
    }

    /**
     * Get audio level class
     */
    getAudioLevelClass(): string {
        const level = this.qualityStats?.audioLevel || 0;
        if (level > 0.7) return 'excellent';
        if (level > 0.4) return 'good';
        if (level > 0.1) return 'fair';
        return 'poor';
    }

    /**
     * Get bitrate class
     */
    getBitrateClass(): string {
        const bitrate = this.qualityStats?.videoBitrate || 0;
        if (bitrate > 1000000) return 'excellent';
        if (bitrate > 500000) return 'good';
        if (bitrate > 100000) return 'fair';
        return 'poor';
    }

    /**
     * Get latency class
     */
    getLatencyClass(): string {
        const latency = this.qualityStats?.latency || 0;
        if (latency < 100) return 'excellent';
        if (latency < 200) return 'good';
        if (latency < 300) return 'fair';
        return 'poor';
    }

    /**
     * Get packet loss class
     */
    getPacketLossClass(): string {
        const packetLoss = this.qualityStats?.packetLoss || 0;
        if (packetLoss < 1) return 'excellent';
        if (packetLoss < 3) return 'good';
        if (packetLoss < 5) return 'fair';
        return 'poor';
    }

    /**
     * Round frame rate
     */
    roundFrameRate(frameRate: number): number {
        return Math.round(frameRate);
    }
}
