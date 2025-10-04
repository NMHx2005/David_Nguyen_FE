import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BundleInfo {
    name: string;
    size: number;
    gzippedSize: number;
    loadTime: number;
    priority: 'high' | 'medium' | 'low';
}

export interface BundleOptimizationConfig {
    enablePreloading: boolean;
    enablePrefetching: boolean;
    enableCodeSplitting: boolean;
    enableTreeShaking: boolean;
    enableMinification: boolean;
    enableCompression: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BundleOptimizationService {
    private bundleInfoSubject = new BehaviorSubject<BundleInfo[]>([]);
    private config: BundleOptimizationConfig = {
        enablePreloading: true,
        enablePrefetching: true,
        enableCodeSplitting: true,
        enableTreeShaking: true,
        enableMinification: true,
        enableCompression: true
    };

    public bundleInfo$ = this.bundleInfoSubject.asObservable();

    constructor() {
        this.initializeBundleOptimization();
    }

    /**
     * Initialize bundle optimization
     */
    private initializeBundleOptimization(): void {
        this.analyzeBundles();
        this.setupPreloading();
        this.setupPrefetching();
    }

    /**
     * Analyze current bundles
     */
    private analyzeBundles(): void {
        const bundles: BundleInfo[] = [];

        // Analyze script tags
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src) {
                const bundleInfo = this.analyzeBundle(src);
                if (bundleInfo) {
                    bundles.push(bundleInfo);
                }
            }
        });

        // Analyze link tags (CSS)
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const bundleInfo = this.analyzeBundle(href);
                if (bundleInfo) {
                    bundles.push(bundleInfo);
                }
            }
        });

        this.bundleInfoSubject.next(bundles);
    }

    /**
     * Analyze individual bundle
     */
    private analyzeBundle(url: string): BundleInfo | null {
        try {
            const name = this.extractBundleName(url);
            const size = this.estimateBundleSize(url);
            const gzippedSize = this.estimateGzippedSize(size);
            const loadTime = this.measureLoadTime(url);
            const priority = this.determinePriority(url);

            return {
                name,
                size,
                gzippedSize,
                loadTime,
                priority
            };
        } catch (error) {
            console.error('Failed to analyze bundle:', url, error);
            return null;
        }
    }

    /**
     * Extract bundle name from URL
     */
    private extractBundleName(url: string): string {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0] || 'unknown';
    }

    /**
     * Estimate bundle size
     */
    private estimateBundleSize(url: string): number {
        // This is a simplified estimation
        // In a real application, you would fetch the actual size
        if (url.includes('main')) return 500000; // 500KB
        if (url.includes('vendor')) return 300000; // 300KB
        if (url.includes('polyfills')) return 50000; // 50KB
        if (url.includes('runtime')) return 10000; // 10KB
        if (url.includes('.css')) return 100000; // 100KB
        return 50000; // Default 50KB
    }

    /**
     * Estimate gzipped size
     */
    private estimateGzippedSize(originalSize: number): number {
        // Typical compression ratio for JavaScript/CSS
        return Math.round(originalSize * 0.3);
    }

    /**
     * Measure load time
     */
    private measureLoadTime(url: string): number {
        const start = performance.now();
        // This would typically be measured during actual loading
        // For now, we'll estimate based on bundle size
        const size = this.estimateBundleSize(url);
        return size / 1000000 * 100; // Estimate 100ms per MB
    }

    /**
     * Determine bundle priority
     */
    private determinePriority(url: string): 'high' | 'medium' | 'low' {
        if (url.includes('main') || url.includes('runtime')) {
            return 'high';
        }
        if (url.includes('vendor') || url.includes('polyfills')) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Setup preloading for critical resources
     */
    private setupPreloading(): void {
        if (!this.config.enablePreloading) {
            return;
        }

        // Preload critical CSS
        this.preloadResource('/styles.css', 'style');

        // Preload critical fonts
        this.preloadResource('/fonts/roboto.woff2', 'font');

        // Preload critical images
        this.preloadResource('/images/logo.png', 'image');
    }

    /**
     * Setup prefetching for non-critical resources
     */
    private setupPrefetching(): void {
        if (!this.config.enablePrefetching) {
            return;
        }

        // Prefetch non-critical resources
        setTimeout(() => {
            this.prefetchResource('/assets/icons.svg');
            this.prefetchResource('/assets/images/background.jpg');
        }, 2000);
    }

    /**
     * Preload resource
     */
    private preloadResource(url: string, type: string): void {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type;

        if (type === 'font') {
            link.crossOrigin = 'anonymous';
        }

        document.head.appendChild(link);
    }

    /**
     * Prefetch resource
     */
    private prefetchResource(url: string): void {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * Optimize bundle loading
     */
    optimizeBundleLoading(): void {
        // Implement bundle optimization strategies
        this.enableCodeSplitting();
        this.enableTreeShaking();
        this.enableMinification();
        this.enableCompression();
    }

    /**
     * Enable code splitting
     */
    private enableCodeSplitting(): void {
        if (!this.config.enableCodeSplitting) {
            return;
        }

        // This would typically be configured in angular.json or webpack config
        console.log('Code splitting enabled');
    }

    /**
     * Enable tree shaking
     */
    private enableTreeShaking(): void {
        if (!this.config.enableTreeShaking) {
            return;
        }

        // This would typically be configured in tsconfig.json
        console.log('Tree shaking enabled');
    }

    /**
     * Enable minification
     */
    private enableMinification(): void {
        if (!this.config.enableMinification) {
            return;
        }

        // This would typically be configured in angular.json
        console.log('Minification enabled');
    }

    /**
     * Enable compression
     */
    private enableCompression(): void {
        if (!this.config.enableCompression) {
            return;
        }

        // This would typically be configured in the server
        console.log('Compression enabled');
    }

    /**
     * Get bundle information
     */
    getBundleInfo(): BundleInfo[] {
        return this.bundleInfoSubject.value;
    }

    /**
     * Get total bundle size
     */
    getTotalBundleSize(): number {
        return this.bundleInfoSubject.value.reduce((total, bundle) => total + bundle.size, 0);
    }

    /**
     * Get total gzipped size
     */
    getTotalGzippedSize(): number {
        return this.bundleInfoSubject.value.reduce((total, bundle) => total + bundle.gzippedSize, 0);
    }

    /**
     * Get bundle optimization recommendations
     */
    getOptimizationRecommendations(): string[] {
        const recommendations: string[] = [];
        const bundles = this.bundleInfoSubject.value;

        // Check for large bundles
        const largeBundles = bundles.filter(bundle => bundle.size > 500000);
        if (largeBundles.length > 0) {
            recommendations.push('Consider splitting large bundles for better loading performance');
        }

        // Check for slow loading bundles
        const slowBundles = bundles.filter(bundle => bundle.loadTime > 1000);
        if (slowBundles.length > 0) {
            recommendations.push('Consider optimizing slow-loading bundles');
        }

        // Check for unused bundles
        const unusedBundles = bundles.filter(bundle => bundle.priority === 'low');
        if (unusedBundles.length > 0) {
            recommendations.push('Consider lazy loading non-critical bundles');
        }

        return recommendations;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<BundleOptimizationConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get configuration
     */
    getConfig(): BundleOptimizationConfig {
        return { ...this.config };
    }

    /**
     * Measure performance impact
     */
    measurePerformanceImpact(): Observable<{
        before: number;
        after: number;
        improvement: number;
    }> {
        return new Observable(observer => {
            const before = performance.now();

            // Simulate optimization
            setTimeout(() => {
                const after = performance.now();
                const improvement = ((before - after) / before) * 100;

                observer.next({
                    before,
                    after,
                    improvement: Math.max(0, improvement)
                });
                observer.complete();
            }, 100);
        });
    }
}
