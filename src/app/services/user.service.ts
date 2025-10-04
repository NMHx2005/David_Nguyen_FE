import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

export interface User {
    _id: string;
    username: string;
    email: string;
    roles: string[];
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserCreate {
    username: string;
    email: string;
    password: string;
    roles?: string[];
}

export interface UserUpdate {
    username?: string;
    email?: string;
    roles?: string[];
    avatar?: string;
    isActive?: boolean;
}

export interface UserResponse {
    success: boolean;
    data: User;
    message?: string;
}

export interface UsersListResponse {
    success: boolean;
    data: {
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface UserGroupsResponse {
    success: boolean;
    data: any[];
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly API_URL = `${environment.apiUrl}/users`;
    private cacheService = inject(CacheService);

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get all users (Admin only)
     */
    getAllUsers(options: {
        page?: number;
        limit?: number;
        search?: string;
    } = {}): Observable<UsersListResponse> {
        const cacheKey = `users_${JSON.stringify(options)}`;

        return this.cacheService.getOrSet(
            cacheKey,
            () => {
                const params = new URLSearchParams();
                if (options.page) params.append('page', options.page.toString());
                if (options.limit) params.append('limit', options.limit.toString());
                if (options.search) params.append('search', options.search);

                return this.http.get<UsersListResponse>(`${this.API_URL}?${params}`, {
                    headers: this.authService.getAuthHeaders()
                });
            },
            { ttl: 5 * 60 * 1000 } // 5 minutes cache
        );
    }

    /**
     * Get user by ID
     */
    getUserById(id: string): Observable<UserResponse> {
        const cacheKey = `user_${id}`;

        return this.cacheService.getOrSet(
            cacheKey,
            () => {
                return this.http.get<UserResponse>(`${this.API_URL}/${id}`, {
                    headers: this.authService.getAuthHeaders()
                });
            },
            { ttl: 10 * 60 * 1000 } // 10 minutes cache
        );
    }

    /**
     * Create new user (Admin only)
     */
    createUser(userData: UserCreate): Observable<UserResponse> {
        return this.http.post<UserResponse>(`${this.API_URL}`, userData, {
            headers: this.authService.getAuthHeaders()
        }).pipe(
            tap(() => {
                // Invalidate users list cache
                this.invalidateUsersCache();
            })
        );
    }

    /**
     * Update user
     */
    updateUser(id: string, userData: UserUpdate): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.API_URL}/${id}`, userData, {
            headers: this.authService.getAuthHeaders()
        }).pipe(
            tap(() => {
                // Invalidate specific user cache and users list cache
                this.cacheService.remove(`user_${id}`);
                this.invalidateUsersCache();
            })
        );
    }

    /**
     * Delete user (Admin only)
     */
    deleteUser(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user groups
     */
    getUserGroups(userId: string): Observable<UserGroupsResponse> {
        return this.http.get<UserGroupsResponse>(`${this.API_URL}/${userId}/groups`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Upload user avatar
     */
    uploadAvatar(userId: string, file: File): Observable<UserResponse> {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.http.post<UserResponse>(`${this.API_URL}/${userId}/avatar`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
                // Don't set Content-Type, let browser set it for FormData
            }
        });
    }

    /**
     * Search users
     */
    searchUsers(query: string, limit: number = 10): Observable<UsersListResponse> {
        return this.http.get<UsersListResponse>(`${this.API_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user statistics (Admin only)
     */
    getUserStats(): Observable<{
        success: boolean;
        data: {
            totalUsers: number;
            activeUsers: number;
            newUsersThisWeek: number;
        };
    }> {
        return this.http.get<{
            success: boolean;
            data: {
                totalUsers: number;
                activeUsers: number;
                newUsersThisWeek: number;
            };
        }>(`${this.API_URL}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Activate/Deactivate user (Admin only)
     */
    toggleUserStatus(userId: string, isActive: boolean): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${this.API_URL}/${userId}/status`, { isActive }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get current user profile
     */
    getCurrentUserProfile(): Observable<UserResponse> {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            return throwError(() => new Error('User not authenticated'));
        }

        return this.http.get<UserResponse>(`${this.API_URL}/${currentUser.id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update current user profile
     */
    updateCurrentUserProfile(userData: Partial<UserUpdate>): Observable<UserResponse> {
        return this.http.put<UserResponse>(`${environment.apiUrl}/client/profile`, userData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user activity logs (Admin only)
     */
    getUserActivity(userId: string, options: {
        limit?: number;
        offset?: number;
    } = {}): Observable<{
        success: boolean;
        data: any[];
    }> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<{
            success: boolean;
            data: any[];
        }>(`${this.API_URL}/${userId}/activity?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Invalidate users list cache
     */
    private invalidateUsersCache(): void {
        const keys = this.cacheService.keys();
        keys.forEach(key => {
            if (key.startsWith('users_')) {
                this.cacheService.remove(key);
            }
        });
    }

    /**
     * Invalidate user cache by ID
     */
    invalidateUserCache(userId: string): void {
        this.cacheService.remove(`user_${userId}`);
    }

    /**
     * Clear all user-related cache
     */
    clearUserCache(): void {
        const keys = this.cacheService.keys();
        keys.forEach(key => {
            if (key.startsWith('user') || key.startsWith('users_')) {
                this.cacheService.remove(key);
            }
        });
    }
}
