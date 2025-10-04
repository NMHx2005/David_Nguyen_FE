import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, UserRole } from '../models/user.model';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    // Token refresh properties
    private refreshTokenTimer: any;
    private readonly TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
        this.startTokenRefreshTimer();
    }

    /**
     * Login user
     */
    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.setUserData(response.data.user, response.data.accessToken, response.data.refreshToken);
                    }
                }),
                catchError(error => {
                    console.error('Login error:', error);
                    throw error;
                })
            );
    }

    /**
     * Register new user
     */
    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.setUserData(response.data.user, response.data.accessToken, response.data.refreshToken);
                    }
                }),
                catchError(error => {
                    console.error('Registration error:', error);
                    throw error;
                })
            );
    }

    /**
     * Logout user
     */
    logout(): Observable<any> {
        return this.http.post(`${this.API_URL}/logout`, {})
            .pipe(
                tap(() => {
                    this.clearUserData();
                }),
                catchError(error => {
                    console.error('Logout error:', error);
                    // Clear data even if logout request fails
                    this.clearUserData();
                    throw error;
                })
            );
    }

    /**
     * Refresh token
     */
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.setUserData(response.data.user, response.data.accessToken, response.data.refreshToken);
                    }
                }),
                catchError(error => {
                    console.error('Token refresh error:', error);
                    this.clearUserData();
                    throw error;
                })
            );
    }

    /**
     * Get current user
     */
    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Ensure user data is loaded from localStorage
     */
    ensureUserLoaded(): void {
        const token = this.getToken();
        const userData = localStorage.getItem('current_user');

        if (token && userData && !this.currentUserSubject.value) {
            try {
                const user = JSON.parse(userData);
                // User data should already be properly mapped from setUserData
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                this.clearUserData();
            }
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getCurrentUser();

        if (!token || !user) {
            return false;
        }

        // Check if token is expired
        if (this.isTokenExpired()) {
            this.clearUserData();
            return false;
        }

        return true;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        return user ? user.roles.includes(role) : false;
    }

    /**
     * Check if user is super admin
     */
    isSuperAdmin(): boolean {
        return this.hasRole(UserRole.SUPER_ADMIN);
    }

    /**
     * Check if user is group admin
     */
    isGroupAdmin(): boolean {
        return this.hasRole(UserRole.GROUP_ADMIN);
    }

    /**
     * Get auth token
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Get auth headers
     */
    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        });
    }

    /**
     * Set user data and token
     */
    private setUserData(user: any, accessToken: string, refreshToken?: string): void {
        // Map API response to User model (handle _id -> id mapping)
        const mappedUser: User = {
            id: user._id || user.id,
            username: user.username,
            email: user.email,
            roles: user.roles || [],
            groups: user.groups || [],
            isActive: user.isActive !== undefined ? user.isActive : true,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
            avatarUrl: user.avatar || user.avatarUrl
        };

        localStorage.setItem('auth_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('current_user', JSON.stringify(mappedUser));
        this.currentUserSubject.next(mappedUser);
        this.startTokenRefreshTimer();
    }

    /**
     * Clear user data
     */
    private clearUserData(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
        this.stopTokenRefreshTimer();
    }

    /**
     * Start token refresh timer
     */
    private startTokenRefreshTimer(): void {
        this.stopTokenRefreshTimer();

        if (this.isAuthenticated()) {
            this.refreshTokenTimer = setInterval(() => {
                this.refreshToken().subscribe({
                    next: (response) => {
                        console.log('Token refreshed successfully');
                    },
                    error: (error) => {
                        console.error('Token refresh failed:', error);
                        this.clearUserData();
                    }
                });
            }, this.TOKEN_REFRESH_INTERVAL);
        }
    }

    /**
     * Stop token refresh timer
     */
    private stopTokenRefreshTimer(): void {
        if (this.refreshTokenTimer) {
            clearInterval(this.refreshTokenTimer);
            this.refreshTokenTimer = null;
        }
    }

    /**
     * Check if token is expired
     */
    private isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    /**
     * Load user from localStorage
     */
    private loadUserFromStorage(): void {
        // Try both possible keys for backward compatibility
        const userStr = localStorage.getItem('current_user') || localStorage.getItem('current_user');
        const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');

        console.log('🔍 AuthService.loadUserFromStorage - localStorage keys:', {
            'current_user': localStorage.getItem('current_user'),
            'currentUser': localStorage.getItem('currentUser'),
            'auth_token': localStorage.getItem('auth_token'),
            'accessToken': localStorage.getItem('accessToken')
        });

        if (userStr && token) {
            try {
                const user = JSON.parse(userStr);
                console.log('🔍 AuthService.loadUserFromStorage - parsed user:', user);
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error parsing user from storage:', error);
                this.clearUserData();
            }
        } else {
            console.log('🔍 AuthService.loadUserFromStorage - No user data in localStorage');
        }
    }

    /**
     * Update user profile
     */
    updateProfile(userData: Partial<User>): Observable<{ success: boolean; data?: User; message?: string }> {
        return this.http.put<{ success: boolean; data?: User; message?: string }>(`${environment.apiUrl}/client/profile`, userData, {
            headers: this.getAuthHeaders()
        }).pipe(
            tap(response => {
                if (response.success) {
                    const currentUser = this.getCurrentUser();
                    if (currentUser) {
                        const updatedUser = { ...currentUser, ...userData };
                        this.currentUserSubject.next(updatedUser);
                        localStorage.setItem('current_user', JSON.stringify(updatedUser));
                    }
                }
            })
        );
    }

    /**
     * Change password
     */
    changePassword(passwordData: {
        currentPassword: string;
        newPassword: string;
    }): Observable<any> {
        return this.http.put(`${this.API_URL}/change-password`, passwordData, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Forgot password
     */
    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.API_URL}/forgot-password`, { email });
    }

    /**
     * Reset password
     */
    resetPassword(resetData: {
        token: string;
        newPassword: string;
    }): Observable<any> {
        return this.http.post(`${this.API_URL}/reset-password`, resetData);
    }
}
