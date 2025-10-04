import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge, of } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

export interface ConnectionStatus {
    isOnline: boolean;
    lastOnlineTime?: Date;
    lastOfflineTime?: Date;
    connectionType?: string;
    downlink?: number;
    effectiveType?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({
        isOnline: navigator.onLine
    });

    public connectionStatus$ = this.connectionStatusSubject.asObservable();

    constructor() {
        this.initializeConnectionMonitoring();
    }

    /**
     * Initialize connection monitoring
     */
    private initializeConnectionMonitoring(): void {
        // Monitor online/offline events
        const online$ = fromEvent(window, 'online').pipe(map(() => true));
        const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

        merge(online$, offline$)
            .pipe(
                startWith(navigator.onLine),
                distinctUntilChanged()
            )
            .subscribe(isOnline => {
                this.updateConnectionStatus(isOnline);
            });

        // Monitor connection quality if available
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;

            fromEvent(connection, 'change')
                .pipe(startWith(null))
                .subscribe(() => {
                    this.updateConnectionQuality();
                });
        }
    }

    /**
     * Update connection status
     */
    private updateConnectionStatus(isOnline: boolean): void {
        const currentStatus = this.connectionStatusSubject.value;
        const now = new Date();

        const newStatus: ConnectionStatus = {
            ...currentStatus,
            isOnline,
            lastOnlineTime: isOnline ? now : currentStatus.lastOnlineTime,
            lastOfflineTime: !isOnline ? now : currentStatus.lastOfflineTime
        };

        this.connectionStatusSubject.next(newStatus);
    }

    /**
     * Update connection quality
     */
    private updateConnectionQuality(): void {
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            const currentStatus = this.connectionStatusSubject.value;

            const newStatus: ConnectionStatus = {
                ...currentStatus,
                connectionType: connection.type,
                downlink: connection.downlink,
                effectiveType: connection.effectiveType
            };

            this.connectionStatusSubject.next(newStatus);
        }
    }

    /**
     * Get current connection status
     */
    getConnectionStatus(): ConnectionStatus {
        return this.connectionStatusSubject.value;
    }

    /**
     * Check if currently online
     */
    isOnline(): boolean {
        return this.connectionStatusSubject.value.isOnline;
    }

    /**
     * Get connection quality
     */
    getConnectionQuality(): 'slow' | 'medium' | 'fast' | 'unknown' {
        const status = this.connectionStatusSubject.value;

        if (!status.isOnline) {
            return 'unknown';
        }

        if (status.effectiveType) {
            switch (status.effectiveType) {
                case 'slow-2g':
                case '2g':
                    return 'slow';
                case '3g':
                    return 'medium';
                case '4g':
                    return 'fast';
                default:
                    return 'unknown';
            }
        }

        if (status.downlink) {
            if (status.downlink < 1) return 'slow';
            if (status.downlink < 10) return 'medium';
            return 'fast';
        }

        return 'unknown';
    }

    /**
     * Get offline duration
     */
    getOfflineDuration(): number | null {
        const status = this.connectionStatusSubject.value;

        if (status.isOnline || !status.lastOfflineTime) {
            return null;
        }

        return Date.now() - status.lastOfflineTime.getTime();
    }

    /**
     * Wait for online status
     */
    waitForOnline(): Observable<boolean> {
        return this.connectionStatus$.pipe(
            map(status => status.isOnline),
            distinctUntilChanged()
        );
    }

    /**
     * Check if connection is stable
     */
    isConnectionStable(): boolean {
        const status = this.connectionStatusSubject.value;

        if (!status.isOnline) {
            return false;
        }

        // Check if we've been online for at least 5 seconds
        if (status.lastOnlineTime) {
            const onlineDuration = Date.now() - status.lastOnlineTime.getTime();
            return onlineDuration > 5000;
        }

        return false;
    }

    /**
     * Get connection info for debugging
     */
    getConnectionInfo(): any {
        const status = this.connectionStatusSubject.value;

        return {
            ...status,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }
}
