import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

export interface VirtualScrollItem {
    id: string | number;
    data: any;
    height?: number;
}

export interface VirtualScrollConfig {
    itemHeight: number;
    bufferSize: number;
    threshold: number;
}

@Component({
    selector: 'app-virtual-scroll',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      #scrollContainer 
      class="virtual-scroll-container"
      [style.height]="containerHeight + 'px'"
      (scroll)="onScroll($event)">
      
      <!-- Spacer for items before visible area -->
      <div [style.height]="offsetY + 'px'"></div>
      
      <!-- Visible items -->
      <div 
        *ngFor="let item of visibleItems; trackBy: trackByFn"
        class="virtual-scroll-item"
        [style.height]="itemHeight + 'px'">
        <ng-content [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{ $implicit: item }"></ng-content>
      </div>
      
      <!-- Spacer for items after visible area -->
      <div [style.height]="(totalHeight - offsetY - visibleHeight) + 'px'"></div>
    </div>
  `,
    styles: [`
    .virtual-scroll-container {
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }

    .virtual-scroll-item {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eee;
    }

    .virtual-scroll-item:last-child {
      border-bottom: none;
    }
  `]
})
export class VirtualScrollComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() items: VirtualScrollItem[] = [];
    @Input() itemHeight: number = 50;
    @Input() bufferSize: number = 5;
    @Input() threshold: number = 0.1;
    @Input() itemTemplate: any;
    @Output() itemClick = new EventEmitter<VirtualScrollItem>();
    @Output() scrollEnd = new EventEmitter<void>();

    @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

    private destroy$ = new Subject<void>();
    private scrollSubject = new BehaviorSubject<number>(0);

    // Component state
    visibleItems: VirtualScrollItem[] = [];
    containerHeight: number = 400;
    totalHeight: number = 0;
    offsetY: number = 0;
    visibleHeight: number = 0;
    startIndex: number = 0;
    endIndex: number = 0;

    ngOnInit(): void {
        this.setupScrollSubscription();
        this.updateVisibleItems();
    }

    ngAfterViewInit(): void {
        this.containerHeight = this.scrollContainer.nativeElement.clientHeight;
        this.updateVisibleItems();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Setup scroll subscription
     */
    private setupScrollSubscription(): void {
        this.scrollSubject
            .pipe(
                debounceTime(16), // ~60fps
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.updateVisibleItems();
            });
    }

    /**
     * Handle scroll event
     */
    onScroll(event: Event): void {
        const scrollTop = (event.target as HTMLElement).scrollTop;
        this.scrollSubject.next(scrollTop);

        // Check if scrolled to bottom
        const element = event.target as HTMLElement;
        if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
            this.scrollEnd.emit();
        }
    }

    /**
     * Update visible items based on scroll position
     */
    private updateVisibleItems(): void {
        if (!this.items.length) {
            this.visibleItems = [];
            return;
        }

        const scrollTop = this.scrollContainer.nativeElement.scrollTop;
        const containerHeight = this.scrollContainer.nativeElement.clientHeight;

        this.totalHeight = this.items.length * this.itemHeight;
        this.visibleHeight = containerHeight;

        // Calculate visible range
        this.startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
        this.endIndex = Math.min(
            this.items.length - 1,
            Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.bufferSize
        );

        // Update visible items
        this.visibleItems = this.items.slice(this.startIndex, this.endIndex + 1);

        // Calculate offset
        this.offsetY = this.startIndex * this.itemHeight;
    }

    /**
     * Track by function for ngFor
     */
    trackByFn(index: number, item: VirtualScrollItem): string | number {
        return item.id;
    }

    /**
     * Scroll to specific item
     */
    scrollToItem(index: number): void {
        if (index >= 0 && index < this.items.length) {
            const scrollTop = index * this.itemHeight;
            this.scrollContainer.nativeElement.scrollTop = scrollTop;
        }
    }

    /**
     * Scroll to top
     */
    scrollToTop(): void {
        this.scrollContainer.nativeElement.scrollTop = 0;
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom(): void {
        this.scrollContainer.nativeElement.scrollTop = this.totalHeight;
    }

    /**
     * Get visible range info
     */
    getVisibleRange(): { start: number; end: number; total: number } {
        return {
            start: this.startIndex,
            end: this.endIndex,
            total: this.items.length
        };
    }

    /**
     * Update items
     */
    updateItems(items: VirtualScrollItem[]): void {
        this.items = items;
        this.updateVisibleItems();
    }

    /**
     * Add item
     */
    addItem(item: VirtualScrollItem): void {
        this.items.push(item);
        this.updateVisibleItems();
    }

    /**
     * Remove item
     */
    removeItem(id: string | number): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index > -1) {
            this.items.splice(index, 1);
            this.updateVisibleItems();
        }
    }

    /**
     * Update item
     */
    updateItem(id: string | number, data: any): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index > -1) {
            this.items[index].data = data;
            this.updateVisibleItems();
        }
    }

    /**
     * Clear all items
     */
    clearItems(): void {
        this.items = [];
        this.visibleItems = [];
        this.totalHeight = 0;
        this.offsetY = 0;
    }

    /**
     * Get scroll position
     */
    getScrollPosition(): number {
        return this.scrollContainer.nativeElement.scrollTop;
    }

    /**
     * Set scroll position
     */
    setScrollPosition(position: number): void {
        this.scrollContainer.nativeElement.scrollTop = position;
    }
}
