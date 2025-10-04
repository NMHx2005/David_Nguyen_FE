import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ImageOptimizationOptions {
    quality?: number; // 0-100
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    progressive?: boolean;
    blur?: number; // For lazy loading placeholder
}

export interface OptimizedImage {
    originalUrl: string;
    optimizedUrl: string;
    placeholderUrl?: string;
    width: number;
    height: number;
    size: number;
    format: string;
    quality: number;
}

@Injectable({
    providedIn: 'root'
})
export class ImageOptimizationService {
    private imageCache = new Map<string, OptimizedImage>();
    private lazyLoadObserver: IntersectionObserver | null = null;

    constructor() {
        this.initializeLazyLoading();
    }

    /**
     * Initialize lazy loading observer
     */
    private initializeLazyLoading(): void {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target as HTMLImageElement;
                            this.loadImage(img);
                            this.lazyLoadObserver?.unobserve(img);
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.1
                }
            );
        }
    }

    /**
     * Optimize image with given options
     */
    optimizeImage(
        imageUrl: string,
        options: ImageOptimizationOptions = {}
    ): Observable<OptimizedImage> {
        const cacheKey = this.generateCacheKey(imageUrl, options);

        // Check cache first
        if (this.imageCache.has(cacheKey)) {
            return of(this.imageCache.get(cacheKey)!);
        }

        return this.processImage(imageUrl, options).pipe(
            map(optimizedImage => {
                this.imageCache.set(cacheKey, optimizedImage);
                return optimizedImage;
            }),
            catchError(error => {
                console.error('Image optimization failed:', error);
                // Return original image as fallback
                return of(this.createFallbackImage(imageUrl));
            })
        );
    }

    /**
     * Process image optimization
     */
    private processImage(
        imageUrl: string,
        options: ImageOptimizationOptions
    ): Observable<OptimizedImage> {
        return new Observable(observer => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        observer.error(new Error('Canvas context not available'));
                        return;
                    }

                    // Calculate dimensions
                    const { width, height } = this.calculateDimensions(
                        img.width,
                        img.height,
                        options.maxWidth,
                        options.maxHeight
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Apply blur for placeholder
                    if (options.blur && options.blur > 0) {
                        ctx.filter = `blur(${options.blur}px)`;
                    }

                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to optimized format
                    const format = options.format || this.getOptimalFormat();
                    const quality = options.quality || this.getOptimalQuality(format);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const optimizedUrl = URL.createObjectURL(blob);
                                const optimizedImage: OptimizedImage = {
                                    originalUrl: imageUrl,
                                    optimizedUrl,
                                    width,
                                    height,
                                    size: blob.size,
                                    format,
                                    quality
                                };

                                // Generate placeholder if requested
                                if (options.blur && options.blur > 0) {
                                    optimizedImage.placeholderUrl = optimizedUrl;
                                }

                                observer.next(optimizedImage);
                                observer.complete();
                            } else {
                                observer.error(new Error('Failed to create blob'));
                            }
                        },
                        `image/${format}`,
                        quality / 100
                    );
                } catch (error) {
                    observer.error(error);
                }
            };

            img.onerror = () => {
                observer.error(new Error('Failed to load image'));
            };

            img.src = imageUrl;
        });
    }

    /**
     * Calculate optimal dimensions
     */
    private calculateDimensions(
        originalWidth: number,
        originalHeight: number,
        maxWidth?: number,
        maxHeight?: number
    ): { width: number; height: number } {
        let width = originalWidth;
        let height = originalHeight;

        if (maxWidth && width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        if (maxHeight && height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * Get optimal format based on browser support
     */
    private getOptimalFormat(): string {
        const canvas = document.createElement('canvas');

        if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
            return 'avif';
        }

        if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
            return 'webp';
        }

        return 'jpeg';
    }

    /**
     * Get optimal quality for format
     */
    private getOptimalQuality(format: string): number {
        switch (format) {
            case 'avif':
                return 80;
            case 'webp':
                return 85;
            case 'jpeg':
                return 90;
            case 'png':
                return 95;
            default:
                return 85;
        }
    }

    /**
     * Generate cache key
     */
    private generateCacheKey(imageUrl: string, options: ImageOptimizationOptions): string {
        const optionsString = JSON.stringify(options);
        return `${imageUrl}_${btoa(optionsString)}`;
    }

    /**
     * Create fallback image
     */
    private createFallbackImage(imageUrl: string): OptimizedImage {
        return {
            originalUrl: imageUrl,
            optimizedUrl: imageUrl,
            width: 0,
            height: 0,
            size: 0,
            format: 'jpeg',
            quality: 100
        };
    }

    /**
     * Load image for lazy loading
     */
    private loadImage(img: HTMLImageElement): void {
        const src = img.dataset['src'];
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
    }

    /**
     * Setup lazy loading for image
     */
    setupLazyLoading(img: HTMLImageElement): void {
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.observe(img);
        } else {
            // Fallback: load immediately
            this.loadImage(img);
        }
    }

    /**
     * Generate responsive image sources
     */
    generateResponsiveSources(
        imageUrl: string,
        sizes: number[],
        options: ImageOptimizationOptions = {}
    ): Observable<{ srcset: string; sizes: string }> {
        const sources: string[] = [];

        return new Observable(observer => {
            let processedCount = 0;

            sizes.forEach(size => {
                this.optimizeImage(imageUrl, {
                    ...options,
                    maxWidth: size
                }).subscribe({
                    next: optimizedImage => {
                        sources.push(`${optimizedImage.optimizedUrl} ${size}w`);
                        processedCount++;

                        if (processedCount === sizes.length) {
                            const srcset = sources.join(', ');
                            const sizesAttr = sizes.map(s => `(max-width: ${s}px) ${s}px`).join(', ') + ', 100vw';

                            observer.next({ srcset, sizes: sizesAttr });
                            observer.complete();
                        }
                    },
                    error: error => {
                        console.error(`Failed to optimize image for size ${size}:`, error);
                        processedCount++;

                        if (processedCount === sizes.length) {
                            observer.error(error);
                        }
                    }
                });
            });
        });
    }

    /**
     * Preload critical images
     */
    preloadImages(imageUrls: string[]): Observable<void> {
        return new Observable(observer => {
            let loadedCount = 0;
            const totalImages = imageUrls.length;

            if (totalImages === 0) {
                observer.next();
                observer.complete();
                return;
            }

            imageUrls.forEach(url => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        observer.next();
                        observer.complete();
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        observer.next();
                        observer.complete();
                    }
                };
                img.src = url;
            });
        });
    }

    /**
     * Get image cache size
     */
    getCacheSize(): number {
        return this.imageCache.size;
    }

    /**
     * Clear image cache
     */
    clearCache(): void {
        // Revoke object URLs to free memory
        this.imageCache.forEach(image => {
            if (image.optimizedUrl.startsWith('blob:')) {
                URL.revokeObjectURL(image.optimizedUrl);
            }
        });

        this.imageCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; totalSize: number } {
        let totalSize = 0;

        this.imageCache.forEach(image => {
            totalSize += image.size;
        });

        return {
            size: this.imageCache.size,
            totalSize
        };
    }

    /**
     * Cleanup service
     */
    ngOnDestroy(): void {
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.disconnect();
        }
        this.clearCache();
    }
}
