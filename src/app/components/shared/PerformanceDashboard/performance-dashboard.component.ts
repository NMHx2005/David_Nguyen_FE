import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { PerformanceService, PerformanceMetrics } from '../../../services/performance.service';
import { CacheService, CacheStats } from '../../../services/cache.service';
import { BundleOptimizationService, BundleInfo } from '../../../services/bundle-optimization.service';

@Component({
    selector: 'app-performance-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatChipsModule,
        MatTooltipModule,
    ],
    template: `
    <div class="performance-dashboard">
      <div class="dashboard-header">
        <h2>Performance Dashboard</h2>
        <button mat-icon-button (click)="refreshData()" [matTooltip]="'Refresh Performance Data'">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <div class="dashboard-grid">
        <!-- Performance Metrics -->
        <mat-card class="metrics-card">
          <mat-card-header>
            <mat-card-title>Performance Metrics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-item">
              <span class="metric-label">Load Time</span>
              <div class="metric-value">{{ formatTime(performanceMetrics.loadTime) }}</div>
              <mat-progress-bar 
                [value]="getLoadTimeScore(performanceMetrics.loadTime)"
                [color]="getLoadTimeColor(performanceMetrics.loadTime)">
              </mat-progress-bar>
            </div>

            <div class="metric-item">
              <span class="metric-label">Memory Usage</span>
              <div class="metric-value">{{ performanceMetrics.memoryUsage.toFixed(1) }}%</div>
              <mat-progress-bar 
                [value]="performanceMetrics.memoryUsage"
                [color]="getMemoryColor(performanceMetrics.memoryUsage)">
              </mat-progress-bar>
            </div>

            <div class="metric-item">
              <span class="metric-label">Network Latency</span>
              <div class="metric-value">{{ performanceMetrics.networkLatency }}ms</div>
              <mat-progress-bar 
                [value]="getLatencyScore(performanceMetrics.networkLatency)"
                [color]="getLatencyColor(performanceMetrics.networkLatency)">
              </mat-progress-bar>
            </div>

            <div class="metric-item">
              <span class="metric-label">Cache Hit Rate</span>
              <div class="metric-value">{{ cacheStats.hitRate.toFixed(1) }}%</div>
              <mat-progress-bar 
                [value]="cacheStats.hitRate"
                [color]="getCacheColor(cacheStats.hitRate)">
              </mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Bundle Information -->
        <mat-card class="bundle-card">
          <mat-card-header>
            <mat-card-title>Bundle Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="bundle-summary">
              <div class="bundle-stat">
                <span class="stat-label">Total Size</span>
                <span class="stat-value">{{ formatBytes(getTotalBundleSize()) }}</span>
              </div>
              <div class="bundle-stat">
                <span class="stat-label">Gzipped Size</span>
                <span class="stat-value">{{ formatBytes(getTotalGzippedSize()) }}</span>
              </div>
              <div class="bundle-stat">
                <span class="stat-label">Compression Ratio</span>
                <span class="stat-value">{{ getCompressionRatio() }}%</span>
              </div>
            </div>

            <div class="bundle-list">
              <div *ngFor="let bundle of bundleInfo" class="bundle-item">
                <div class="bundle-name">{{ bundle.name }}</div>
                <div class="bundle-details">
                  <mat-chip [class]="'priority-' + bundle.priority">
                    {{ bundle.priority }}
                  </mat-chip>
                  <span class="bundle-size">{{ formatBytes(bundle.size) }}</span>
                  <span class="bundle-time">{{ bundle.loadTime }}ms</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Cache Statistics -->
        <mat-card class="cache-card">
          <mat-card-header>
            <mat-card-title>Cache Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="cache-stats">
              <div class="cache-stat">
                <span class="stat-label">Cache Hits</span>
                <span class="stat-value">{{ cacheStats.hits }}</span>
              </div>
              <div class="cache-stat">
                <span class="stat-label">Cache Misses</span>
                <span class="stat-value">{{ cacheStats.misses }}</span>
              </div>
              <div class="cache-stat">
                <span class="stat-label">Cache Size</span>
                <span class="stat-value">{{ cacheStats.size }}</span>
              </div>
            </div>

            <div class="cache-actions">
              <button mat-button (click)="clearCache()" color="warn">
                <mat-icon>clear</mat-icon>
                Clear Cache
              </button>
              <button mat-button (click)="cleanExpiredCache()" color="primary">
                <mat-icon>cleaning_services</mat-icon>
                Clean Expired
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Optimization Recommendations -->
        <mat-card class="recommendations-card">
          <mat-card-header>
            <mat-card-title>Optimization Recommendations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recommendations.length === 0" class="no-recommendations">
              <mat-icon>check_circle</mat-icon>
              <span>No optimization recommendations at this time.</span>
            </div>
            <div *ngFor="let recommendation of recommendations" class="recommendation-item">
              <mat-icon>lightbulb</mat-icon>
              <span>{{ recommendation }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .performance-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-header h2 {
      margin: 0;
      color: #333;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .metric-item {
      margin-bottom: 16px;
    }

    .metric-label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .bundle-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .bundle-stat, .cache-stat {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .bundle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .bundle-item:last-child {
      border-bottom: none;
    }

    .bundle-name {
      font-weight: 500;
      color: #333;
    }

    .bundle-details {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bundle-size, .bundle-time {
      font-size: 12px;
      color: #666;
    }

    .priority-high {
      background-color: #f44336;
      color: white;
    }

    .priority-medium {
      background-color: #ff9800;
      color: white;
    }

    .priority-low {
      background-color: #4caf50;
      color: white;
    }

    .cache-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .cache-actions {
      display: flex;
      gap: 12px;
    }

    .recommendation-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      color: #666;
    }

    .recommendation-item mat-icon {
      color: #ff9800;
    }

    .no-recommendations {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      padding: 20px;
      text-align: center;
    }

    .no-recommendations mat-icon {
      font-size: 24px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .performance-dashboard {
        padding: 10px;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .bundle-summary, .cache-stats {
        grid-template-columns: 1fr;
      }

      .cache-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Services
    performanceService = inject(PerformanceService);
    cacheService = inject(CacheService);
    bundleOptimizationService = inject(BundleOptimizationService);

    // Component state
    performanceMetrics: PerformanceMetrics = {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkLatency: 0,
        cacheHitRate: 0,
        bundleSize: 0
    };

    cacheStats: CacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
    };

    bundleInfo: BundleInfo[] = [];
    recommendations: string[] = [];

    ngOnInit(): void {
        this.subscribeToServices();
        this.refreshData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Subscribe to services
     */
    private subscribeToServices(): void {
        // Subscribe to performance metrics
        this.performanceService.metrics$
            .pipe(takeUntil(this.destroy$))
            .subscribe(metrics => {
                this.performanceMetrics = metrics;
            });

        // Subscribe to cache statistics
        this.cacheService.cacheStats$
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => {
                this.cacheStats = stats;
            });

        // Subscribe to bundle information
        this.bundleOptimizationService.bundleInfo$
            .pipe(takeUntil(this.destroy$))
            .subscribe(bundles => {
                this.bundleInfo = bundles;
                this.updateRecommendations();
            });
    }

    /**
     * Refresh all data
     */
    refreshData(): void {
        this.performanceMetrics = this.performanceService.getCurrentMetrics();
        this.cacheStats = this.cacheService.getStats();
        this.bundleInfo = this.bundleOptimizationService.getBundleInfo();
        this.updateRecommendations();
    }

    /**
     * Update optimization recommendations
     */
    private updateRecommendations(): void {
        const performanceRecommendations = this.performanceService.getPerformanceReport().recommendations;
        const bundleRecommendations = this.bundleOptimizationService.getOptimizationRecommendations();

        this.recommendations = [...performanceRecommendations, ...bundleRecommendations];
    }

    /**
     * Format time in milliseconds
     */
    formatTime(ms: number): string {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        return `${(ms / 1000).toFixed(1)}s`;
    }

    /**
     * Format bytes
     */
    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get load time score (0-100)
     */
    getLoadTimeScore(loadTime: number): number {
        if (loadTime < 1000) return 100;
        if (loadTime < 2000) return 80;
        if (loadTime < 3000) return 60;
        if (loadTime < 5000) return 40;
        return 20;
    }

    /**
     * Get load time color
     */
    getLoadTimeColor(loadTime: number): string {
        if (loadTime < 1000) return 'primary';
        if (loadTime < 2000) return 'accent';
        return 'warn';
    }

    /**
     * Get memory color
     */
    getMemoryColor(memoryUsage: number): string {
        if (memoryUsage < 50) return 'primary';
        if (memoryUsage < 80) return 'accent';
        return 'warn';
    }

    /**
     * Get latency score (0-100)
     */
    getLatencyScore(latency: number): number {
        if (latency < 100) return 100;
        if (latency < 200) return 80;
        if (latency < 500) return 60;
        if (latency < 1000) return 40;
        return 20;
    }

    /**
     * Get latency color
     */
    getLatencyColor(latency: number): string {
        if (latency < 100) return 'primary';
        if (latency < 200) return 'accent';
        return 'warn';
    }

    /**
     * Get cache color
     */
    getCacheColor(hitRate: number): string {
        if (hitRate > 80) return 'primary';
        if (hitRate > 60) return 'accent';
        return 'warn';
    }

    /**
     * Get total bundle size
     */
    getTotalBundleSize(): number {
        return this.bundleOptimizationService.getTotalBundleSize();
    }

    /**
     * Get total gzipped size
     */
    getTotalGzippedSize(): number {
        return this.bundleOptimizationService.getTotalGzippedSize();
    }

    /**
     * Get compression ratio
     */
    getCompressionRatio(): number {
        const totalSize = this.getTotalBundleSize();
        const gzippedSize = this.getTotalGzippedSize();

        if (totalSize === 0) return 0;
        return Math.round((1 - gzippedSize / totalSize) * 100);
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cacheService.clear();
        this.refreshData();
    }

    /**
     * Clean expired cache
     */
    cleanExpiredCache(): void {
        this.cacheService.cleanExpired();
        this.refreshData();
    }
}
