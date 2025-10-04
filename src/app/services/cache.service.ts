import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface CacheConfig {
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of items in cache
    strategy: 'lru' | 'fifo' | 'ttl'; // Cache eviction strategy
}

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, CacheItem<any>>();
    private stats = { hits: 0, misses: 0 };
    private defaultConfig: CacheConfig = {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        strategy: 'lru'
    };

    private cacheStatsSubject = new BehaviorSubject<CacheStats>({
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0
    });

    public cacheStats$ = this.cacheStatsSubject.asObservable();

    /**
     * Get data from cache or execute function and cache result
     */
    getOrSet<T>(
        key: string,
        dataFn: () => Observable<T>,
        config?: Partial<CacheConfig>
    ): Observable<T> {
        const mergedConfig = { ...this.defaultConfig, ...config };

        // Check if data exists in cache and is not expired
        const cachedItem = this.cache.get(key);
        if (cachedItem && this.isValid(cachedItem, mergedConfig.ttl)) {
            this.updateAccess(cachedItem);
            this.stats.hits++;
            this.updateStats();
            return of(cachedItem.data);
        }

        // Data not in cache or expired, fetch new data
        this.stats.misses++;
        this.updateStats();

        return dataFn().pipe(
            tap(data => {
                this.set(key, data, mergedConfig);
            }),
            catchError(error => {
                console.error(`Cache error for key ${key}:`, error);
                throw error;
            })
        );
    }

    /**
     * Set data in cache
     */
    set<T>(key: string, data: T, config?: Partial<CacheConfig>): void {
        const mergedConfig = { ...this.defaultConfig, ...config };

        const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now()
        };

        // Check if cache is full and evict if necessary
        if (this.cache.size >= mergedConfig.maxSize) {
            this.evict(mergedConfig);
        }

        this.cache.set(key, cacheItem);
        this.updateStats();
    }

    /**
     * Get data from cache
     */
    get<T>(key: string): T | null {
        const cachedItem = this.cache.get(key);
        if (cachedItem && this.isValid(cachedItem, this.defaultConfig.ttl)) {
            this.updateAccess(cachedItem);
            this.stats.hits++;
            this.updateStats();
            return cachedItem.data;
        }

        this.stats.misses++;
        this.updateStats();
        return null;
    }

    /**
     * Check if cache item is valid
     */
    private isValid(item: CacheItem<any>, ttl: number): boolean {
        return Date.now() - item.timestamp < ttl;
    }

    /**
     * Update access information
     */
    private updateAccess(item: CacheItem<any>): void {
        item.accessCount++;
        item.lastAccessed = Date.now();
    }

    /**
     * Evict items based on strategy
     */
    private evict(config: CacheConfig): void {
        switch (config.strategy) {
            case 'lru':
                this.evictLRU();
                break;
            case 'fifo':
                this.evictFIFO();
                break;
            case 'ttl':
                this.evictTTL(config.ttl);
                break;
        }
    }

    /**
     * Evict least recently used item
     */
    private evictLRU(): void {
        let oldestKey = '';
        let oldestTime = Date.now();

        for (const [key, item] of this.cache.entries()) {
            if (item.lastAccessed < oldestTime) {
                oldestTime = item.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Evict first in, first out
     */
    private evictFIFO(): void {
        let oldestKey = '';
        let oldestTime = Date.now();

        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Evict expired items
     */
    private evictTTL(ttl: number): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp >= ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Update cache statistics
     */
    private updateStats(): void {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

        this.cacheStatsSubject.next({
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: this.cache.size,
            hitRate
        });
    }

    /**
     * Clear cache
     */
    clear(): void {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0 };
        this.updateStats();
    }

    /**
     * Remove specific key from cache
     */
    remove(key: string): boolean {
        const deleted = this.cache.delete(key);
        this.updateStats();
        return deleted;
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        const item = this.cache.get(key);
        return item ? this.isValid(item, this.defaultConfig.ttl) : false;
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: this.cache.size,
            hitRate
        };
    }

    /**
     * Get all cache keys
     */
    keys(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Clean expired items
     */
    cleanExpired(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp >= this.defaultConfig.ttl) {
                this.cache.delete(key);
            }
        }
        this.updateStats();
    }

    /**
     * Set default cache configuration
     */
    setDefaultConfig(config: Partial<CacheConfig>): void {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    /**
     * Get cache item details
     */
    getItemInfo(key: string): CacheItem<any> | null {
        return this.cache.get(key) || null;
    }
}
