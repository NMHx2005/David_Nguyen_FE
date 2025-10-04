import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ClientProfile {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    roles: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'message' | 'mention' | 'invite' | 'system';
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
}

export interface UserActivity {
    _id: string;
    userId: string;
    action: string;
    details: any;
    timestamp: string;
    ipAddress?: string;
}

export interface ClientStats {
    totalMessages: number;
    messagesToday: number;
    messagesThisWeek: number;
    groupsJoined: number;
    channelsJoined: number;
    lastActive: string;
}

export interface ClientResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private readonly API_URL = `${environment.apiUrl}/client`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get client profile
     */
    getProfile(): Observable<ClientResponse<ClientProfile>> {
        return this.http.get<ClientResponse<ClientProfile>>(`${this.API_URL}/profile`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update client profile
     */
    updateProfile(profileData: Partial<ClientProfile>): Observable<ClientResponse<ClientProfile>> {
        return this.http.put<ClientResponse<ClientProfile>>(`${this.API_URL}/profile`, profileData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get client statistics
     */
    getStats(): Observable<ClientResponse<ClientStats>> {
        return this.http.get<ClientResponse<ClientStats>>(`${this.API_URL}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user activity logs
     */
    getActivity(options: {
        limit?: number;
        offset?: number;
    } = {}): Observable<ClientResponse<UserActivity[]>> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<ClientResponse<UserActivity[]>>(`${this.API_URL}/activity?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get notifications
     */
    getNotifications(options: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
    } = {}): Observable<ClientResponse<Notification[]>> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        if (options.unreadOnly) params.append('unreadOnly', 'true');

        return this.http.get<ClientResponse<Notification[]>>(`${this.API_URL}/notifications?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Mark notification as read
     */
    markNotificationRead(notificationId: string): Observable<ClientResponse<Notification>> {
        return this.http.put<ClientResponse<Notification>>(`${this.API_URL}/notifications/${notificationId}/read`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Mark all notifications as read
     */
    markAllNotificationsRead(): Observable<ClientResponse<{ marked: number }>> {
        return this.http.put<ClientResponse<{ marked: number }>>(`${this.API_URL}/notifications/read-all`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Delete notification
     */
    deleteNotification(notificationId: string): Observable<ClientResponse<{ deleted: boolean }>> {
        return this.http.delete<ClientResponse<{ deleted: boolean }>>(`${this.API_URL}/notifications/${notificationId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get unread notification count
     */
    getUnreadNotificationCount(): Observable<ClientResponse<{ count: number }>> {
        return this.http.get<ClientResponse<{ count: number }>>(`${this.API_URL}/notifications/unread-count`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user's groups
     */
    getUserGroups(): Observable<ClientResponse<any[]>> {
        return this.http.get<ClientResponse<any[]>>(`${this.API_URL}/groups`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user's channels
     */
    getUserChannels(): Observable<ClientResponse<any[]>> {
        return this.http.get<ClientResponse<any[]>>(`${this.API_URL}/channels`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get recent messages across user's channels
     */
    getRecentMessages(options: {
        limit?: number;
        channels?: string[];
    } = {}): Observable<ClientResponse<any[]>> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.channels) params.append('channels', options.channels.join(','));

        return this.http.get<ClientResponse<any[]>>(`${this.API_URL}/recent-messages?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Search across user's accessible content
     */
    searchContent(query: string, options: {
        type?: 'messages' | 'channels' | 'groups' | 'users';
        limit?: number;
    } = {}): Observable<ClientResponse<{
        messages: any[];
        channels: any[];
        groups: any[];
        users: any[];
    }>> {
        const params = new URLSearchParams();
        params.append('query', query);
        if (options.type) params.append('type', options.type);
        if (options.limit) params.append('limit', options.limit.toString());

        return this.http.get<ClientResponse<{
            messages: any[];
            channels: any[];
            groups: any[];
            users: any[];
        }>>(`${this.API_URL}/search?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update user preferences
     */
    updatePreferences(preferences: {
        theme?: 'light' | 'dark';
        language?: string;
        notifications?: {
            email: boolean;
            push: boolean;
            desktop: boolean;
        };
        privacy?: {
            showOnlineStatus: boolean;
            showLastSeen: boolean;
        };
    }): Observable<ClientResponse<any>> {
        return this.http.put<ClientResponse<any>>(`${this.API_URL}/preferences`, preferences, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user preferences
     */
    getPreferences(): Observable<ClientResponse<any>> {
        return this.http.get<ClientResponse<any>>(`${this.API_URL}/preferences`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update user status
     */
    updateStatus(status: 'online' | 'away' | 'busy' | 'offline'): Observable<ClientResponse<{ status: string }>> {
        return this.http.put<ClientResponse<{ status: string }>>(`${this.API_URL}/status`, { status }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user status
     */
    getStatus(): Observable<ClientResponse<{ status: string; lastSeen: string }>> {
        return this.http.get<ClientResponse<{ status: string; lastSeen: string }>>(`${this.API_URL}/status`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Export user data
     */
    exportData(): Observable<Blob> {
        return this.http.get(`${this.API_URL}/export`, {
            headers: this.authService.getAuthHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * Delete user account
     */
    deleteAccount(password: string): Observable<ClientResponse<{ deleted: boolean }>> {
        return this.http.delete<ClientResponse<{ deleted: boolean }>>(`${this.API_URL}/account`, {
            headers: this.authService.getAuthHeaders(),
            body: { password }
        });
    }

    /**
     * Get user sessions
     */
    getSessions(): Observable<ClientResponse<{
        sessions: {
            _id: string;
            device: string;
            browser: string;
            ipAddress: string;
            lastActive: string;
            isCurrent: boolean;
        }[];
    }>> {
        return this.http.get<ClientResponse<{
            sessions: {
                _id: string;
                device: string;
                browser: string;
                ipAddress: string;
                lastActive: string;
                isCurrent: boolean;
            }[];
        }>>(`${this.API_URL}/sessions`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Revoke session
     */
    revokeSession(sessionId: string): Observable<ClientResponse<{ revoked: boolean }>> {
        return this.http.delete<ClientResponse<{ revoked: boolean }>>(`${this.API_URL}/sessions/${sessionId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Revoke all other sessions
     */
    revokeAllOtherSessions(): Observable<ClientResponse<{ revoked: number }>> {
        return this.http.delete<ClientResponse<{ revoked: number }>>(`${this.API_URL}/sessions/others`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
