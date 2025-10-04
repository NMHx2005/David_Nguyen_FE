import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
    isLoading: boolean;
    loadingText?: string;
    progress?: number;
    showProgress?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<LoadingState>({
        isLoading: false
    });

    public loading$ = this.loadingSubject.asObservable();

    private loadingStack: string[] = [];

    /**
     * Show loading with optional text
     */
    showLoading(text?: string, showProgress: boolean = false): void {
        const currentState = this.loadingSubject.value;

        this.loadingSubject.next({
            isLoading: true,
            loadingText: text || currentState.loadingText,
            showProgress: showProgress,
            progress: showProgress ? 0 : undefined
        });
    }

    /**
     * Hide loading
     */
    hideLoading(): void {
        this.loadingSubject.next({
            isLoading: false
        });
    }

    /**
     * Update loading text
     */
    updateLoadingText(text: string): void {
        const currentState = this.loadingSubject.value;

        if (currentState.isLoading) {
            this.loadingSubject.next({
                ...currentState,
                loadingText: text
            });
        }
    }

    /**
     * Update progress
     */
    updateProgress(progress: number): void {
        const currentState = this.loadingSubject.value;

        if (currentState.isLoading && currentState.showProgress) {
            this.loadingSubject.next({
                ...currentState,
                progress: Math.min(100, Math.max(0, progress))
            });
        }
    }

    /**
     * Push loading state to stack
     */
    pushLoading(key: string, text?: string): void {
        this.loadingStack.push(key);
        this.showLoading(text);
    }

    /**
     * Pop loading state from stack
     */
    popLoading(key: string): void {
        const index = this.loadingStack.indexOf(key);
        if (index > -1) {
            this.loadingStack.splice(index, 1);
        }

        if (this.loadingStack.length === 0) {
            this.hideLoading();
        }
    }

    /**
     * Clear all loading states
     */
    clearLoading(): void {
        this.loadingStack = [];
        this.hideLoading();
    }

    /**
     * Get current loading state
     */
    getLoadingState(): LoadingState {
        return this.loadingSubject.value;
    }

    /**
     * Check if loading
     */
    isLoading(): boolean {
        return this.loadingSubject.value.isLoading;
    }

    /**
     * Get loading text
     */
    getLoadingText(): string | undefined {
        return this.loadingSubject.value.loadingText;
    }

    /**
     * Get progress
     */
    getProgress(): number | undefined {
        return this.loadingSubject.value.progress;
    }

    /**
     * Check if progress is shown
     */
    isProgressShown(): boolean {
        return this.loadingSubject.value.showProgress || false;
    }
}
