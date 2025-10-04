import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    networkLatency: number;
    cacheHitRate: number;
    bundleSize: number;
}

export interface ComponentMetrics {
    componentName: string;
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {
    private metricsSubject = new BehaviorSubject<PerformanceMetrics>({
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkLatency: 0,
        cacheHitRate: 0,
        bundleSize: 0
    });

    private componentMetrics: ComponentMetrics[] = [];
    private performanceObserver: PerformanceObserver | null = null;

    public metrics$ = this.metricsSubject.asObservable();

    constructor() {
        this.initializePerformanceMonitoring();
    }

    /**
     * Initialize performance monitoring
     */
    private initializePerformanceMonitoring(): void {
        // Monitor page load performance
        this.monitorPageLoad();

        // Monitor memory usage
        this.monitorMemoryUsage();

        // Monitor network performance
        this.monitorNetworkPerformance();

        // Monitor component performance
        this.monitorComponentPerformance();
    }

    /**
     * Monitor page load performance
     */
    private monitorPageLoad(): void {
        if (typeof window !== 'undefined' && 'performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

                    this.updateMetrics({ loadTime });
                }, 0);
            });
        }
    }

    /**
     * Monitor memory usage
     */
    private monitorMemoryUsage(): void {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize * 100;

            this.updateMetrics({ memoryUsage });

            // Monitor memory usage every 30 seconds
            setInterval(() => {
                const currentMemoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize * 100;
                this.updateMetrics({ memoryUsage: currentMemoryUsage });
            }, 30000);
        }
    }

    /**
     * Monitor network performance
     */
    private monitorNetworkPerformance(): void {
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;

            // Monitor connection changes
            connection.addEventListener('change', () => {
                const latency = connection.rtt || 0;
                this.updateMetrics({ networkLatency: latency });
            });

            // Initial latency measurement
            const latency = connection.rtt || 0;
            this.updateMetrics({ networkLatency: latency });
        }
    }

    /**
     * Monitor component performance
     */
    private monitorComponentPerformance(): void {
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            this.trackComponentMetric(entry.name, entry.duration);
                        }
                    });
                });

                this.performanceObserver.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
    }

    /**
     * Track component performance
     */
    trackComponentMetric(componentName: string, duration: number): void {
        const metric: ComponentMetrics = {
            componentName,
            loadTime: duration,
            renderTime: 0, // Will be updated by component
            memoryUsage: this.getCurrentMemoryUsage(),
            timestamp: new Date()
        };

        this.componentMetrics.push(metric);

        // Keep only last 100 component metrics
        if (this.componentMetrics.length > 100) {
            this.componentMetrics = this.componentMetrics.slice(-100);
        }
    }

    /**
     * Get current memory usage
     */
    private getCurrentMemoryUsage(): number {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return memory.usedJSHeapSize / memory.totalJSHeapSize * 100;
        }
        return 0;
    }

    /**
     * Update performance metrics
     */
    private updateMetrics(updates: Partial<PerformanceMetrics>): void {
        const currentMetrics = this.metricsSubject.value;
        this.metricsSubject.next({ ...currentMetrics, ...updates });
    }

    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics {
        return this.metricsSubject.value;
    }

    /**
     * Get component metrics
     */
    getComponentMetrics(): ComponentMetrics[] {
        return [...this.componentMetrics];
    }

    /**
     * Get performance report
     */
    getPerformanceReport(): any {
        const metrics = this.getCurrentMetrics();
        const componentMetrics = this.getComponentMetrics();

        return {
            overall: metrics,
            components: componentMetrics,
            recommendations: this.getPerformanceRecommendations(metrics)
        };
    }

    /**
     * Get performance recommendations
     */
    private getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
        const recommendations: string[] = [];

        if (metrics.loadTime > 3000) {
            recommendations.push('Consider implementing lazy loading for components');
        }

        if (metrics.memoryUsage > 80) {
            recommendations.push('Memory usage is high, consider optimizing data structures');
        }

        if (metrics.networkLatency > 200) {
            recommendations.push('Network latency is high, consider implementing caching');
        }

        if (metrics.cacheHitRate < 70) {
            recommendations.push('Cache hit rate is low, consider optimizing cache strategy');
        }

        return recommendations;
    }

    /**
     * Measure function execution time
     */
    measureFunction<T>(name: string, fn: () => T): T {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        performance.mark(`${name}-start`);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    /**
     * Measure async function execution time
     */
    async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();

        performance.mark(`${name}-start`);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    /**
     * Start performance measurement
     */
    startMeasurement(name: string): void {
        performance.mark(`${name}-start`);
    }

    /**
     * End performance measurement
     */
    endMeasurement(name: string): number {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const measure = performance.getEntriesByName(name)[0];
        return measure ? measure.duration : 0;
    }

    /**
     * Clear performance measurements
     */
    clearMeasurements(): void {
        performance.clearMarks();
        performance.clearMeasures();
    }

    /**
     * Get bundle size information
     */
    getBundleSize(): number {
        // This would typically be injected or calculated during build
        // For now, we'll estimate based on loaded scripts
        if (typeof window !== 'undefined') {
            const scripts = document.querySelectorAll('script[src]');
            let totalSize = 0;

            scripts.forEach(script => {
                const src = script.getAttribute('src');
                if (src && src.includes('main')) {
                    // Estimate bundle size (this is a simplified approach)
                    totalSize += 500000; // 500KB estimate
                }
            });

            return totalSize;
        }

        return 0;
    }

    /**
     * Cleanup performance monitoring
     */
    ngOnDestroy(): void {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
    }
}
