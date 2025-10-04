import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface AvatarInfo {
    userId: string;
    username: string;
    avatarUrl?: string;
    initials: string;
}

@Injectable({
    providedIn: 'root'
})
export class AvatarService {
    private readonly API_URL = `${environment.apiUrl}/users`;
    private avatarCache = new Map<string, string>();
    private defaultAvatars = new Map<string, string>();

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get user avatar URL with caching
     */
    getAvatarUrl(userId: string): Observable<string | null> {
        // Check cache first
        if (this.avatarCache.has(userId)) {
            return of(this.avatarCache.get(userId)!);
        }

        // Fetch from API (public endpoint - no auth required)
        return this.http.get<{ success: boolean; data: { avatar?: string } }>(`${this.API_URL}/${userId}/avatar`)
            .pipe(
                map(response => {
                    const avatarUrl = response.success && response.data.avatar ? response.data.avatar : null;
                    // Cache the result
                    this.avatarCache.set(userId, avatarUrl || '');
                    return avatarUrl;
                }),
                catchError(() => {
                    // Cache null result to avoid repeated failed requests
                    this.avatarCache.set(userId, '');
                    return of(null);
                })
            );
    }

    /**
     * Get avatar info for a user (avatar URL + initials)
     */
    getAvatarInfo(userId: string, username: string): Observable<AvatarInfo> {
        return this.getAvatarUrl(userId).pipe(
            map(avatarUrl => ({
                userId,
                username,
                avatarUrl: avatarUrl || undefined,
                initials: this.generateInitials(username)
            }))
        );
    }

    /**
     * Generate initials from username
     */
    generateInitials(username: string): string {
        if (!username) return 'U';

        const words = username.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }

    /**
     * Get default avatar color based on username
     */
    getDefaultAvatarColor(username: string): string {
        if (this.defaultAvatars.has(username)) {
            return this.defaultAvatars.get(username)!;
        }

        // Generate consistent color based on username
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#fa709a', '#fee140', '#a8edea', '#fed6e3',
            '#ff9a9e', '#fecfef', '#ffecd2', '#fcb69f'
        ];

        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colorIndex = Math.abs(hash) % colors.length;
        const color = colors[colorIndex];

        this.defaultAvatars.set(username, color);
        return color;
    }

    /**
     * Clear avatar cache
     */
    clearCache(): void {
        this.avatarCache.clear();
        this.defaultAvatars.clear();
    }

    /**
     * Preload avatars for multiple users
     */
    preloadAvatars(userIds: string[]): Observable<Map<string, string>> {
        const avatarMap = new Map<string, string>();
        const requests = userIds.map(userId =>
            this.getAvatarUrl(userId).pipe(
                map(avatarUrl => ({ userId, avatarUrl }))
            )
        );

        return new Observable(observer => {
            let completed = 0;
            const total = requests.length;

            if (total === 0) {
                observer.next(avatarMap);
                observer.complete();
                return;
            }

            requests.forEach(request => {
                request.subscribe({
                    next: ({ userId, avatarUrl }) => {
                        avatarMap.set(userId, avatarUrl || '');
                        completed++;

                        if (completed === total) {
                            observer.next(avatarMap);
                            observer.complete();
                        }
                    },
                    error: () => {
                        completed++;
                        if (completed === total) {
                            observer.next(avatarMap);
                            observer.complete();
                        }
                    }
                });
            });
        });
    }

    /**
     * Get full avatar URL with domain
     */
    getFullAvatarUrl(avatarPath: string): string {
        if (!avatarPath) return '';

        // If it's already a full URL, return as is
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
            return avatarPath;
        }

        // If it's a relative path, prepend the API base URL
        if (avatarPath.startsWith('/')) {
            return `${environment.apiUrl}${avatarPath}`;
        }

        // Otherwise, assume it's a filename and prepend uploads path
        return `${environment.apiUrl}/uploads/avatars/${avatarPath}`;
    }
}
