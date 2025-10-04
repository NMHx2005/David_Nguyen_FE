import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { ImageOptimizationService } from '../services/image-optimization.service';

@Directive({
    selector: '[appLazyLoad]',
    standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
    @Input() appLazyLoad: string = '';
    @Input() placeholder: string = '';
    @Input() errorImage: string = '';
    @Input() loadingClass: string = 'lazy-loading';
    @Input() loadedClass: string = 'lazy-loaded';
    @Input() errorClass: string = 'lazy-error';

    private imageOptimizationService = inject(ImageOptimizationService);
    private observer: IntersectionObserver | null = null;
    private element: HTMLElement;

    constructor(private el: ElementRef) {
        this.element = el.nativeElement;
    }

    ngOnInit(): void {
        this.setupLazyLoading();
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    /**
     * Setup lazy loading
     */
    private setupLazyLoading(): void {
        if (!this.appLazyLoad) {
            return;
        }

        // Add loading class
        this.element.classList.add(this.loadingClass);

        // Set placeholder if provided
        if (this.placeholder) {
            this.setImageSrc(this.placeholder);
        }

        // Create intersection observer
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage();
                            this.observer?.unobserve(this.element);
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.1
                }
            );

            this.observer.observe(this.element);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadImage();
        }
    }

    /**
     * Load the actual image
     */
    private loadImage(): void {
        if (!this.appLazyLoad) {
            return;
        }

        // Optimize image
        this.imageOptimizationService.optimizeImage(this.appLazyLoad, {
            quality: 85,
            format: 'webp'
        }).subscribe({
            next: (optimizedImage) => {
                this.setImageSrc(optimizedImage.optimizedUrl);
                this.element.classList.remove(this.loadingClass);
                this.element.classList.add(this.loadedClass);
            },
            error: (error) => {
                console.error('Failed to load image:', error);
                this.handleImageError();
            }
        });
    }

    /**
     * Set image source
     */
    private setImageSrc(src: string): void {
        if (this.element.tagName === 'IMG') {
            (this.element as HTMLImageElement).src = src;
        } else {
            this.element.style.backgroundImage = `url(${src})`;
        }
    }

    /**
     * Handle image loading error
     */
    private handleImageError(): void {
        this.element.classList.remove(this.loadingClass);
        this.element.classList.add(this.errorClass);

        if (this.errorImage) {
            this.setImageSrc(this.errorImage);
        }
    }
}
