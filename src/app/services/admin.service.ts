import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface DashboardStats {
    totalUsers: number;
    totalGroups: number;
    totalChannels: number;
    totalMessages: number;
    activeUsers: number;
    newUsersThisWeek: number;
    messagesToday: number;
    messagesThisWeek: number;
}

export interface SystemStats {
    serverUptime: string;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    activeConnections: number;
}

export interface UserActivity {
    _id: string;
    userId: string;
    username: string;
    action: string;
    details: any;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface GroupStats {
    totalGroups: number;
    activeGroups: number;
    privateGroups: number;
    publicGroups: number;
    averageMembersPerGroup: number;
}

export interface ChannelStats {
    totalChannels: number;
    activeChannels: number;
    textChannels: number;
    voiceChannels: number;
    videoChannels: number;
    averageMessagesPerChannel: number;
}

export interface AdminResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private readonly API_URL = `${environment.apiUrl}/admin`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get dashboard statistics
     */
    getDashboardStats(): Observable<AdminResponse<DashboardStats>> {
        return this.http.get<AdminResponse<DashboardStats>>(`${this.API_URL}/dashboard`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get all users with pagination and search
     */
    getAllUsers(options: {
        search?: string;
    } = {}): Observable<AdminResponse<{
        users: any[];
        total: number;
        page: number;
        pages: number;
    }>> {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);

        return this.http.get<AdminResponse<{
            users: any[];
            total: number;
            page: number;
            pages: number;
        }>>(`${this.API_URL}/users?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Create user (Super Admin only)
     */
    createUser(userData: {
        username: string;
        email: string;
        password: string;
        roles?: string[];
    }): Observable<AdminResponse<any>> {
        return this.http.post<AdminResponse<any>>(`${this.API_URL}/users`, userData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update user (Super Admin only)
     */
    updateUser(userId: string, userData: {
        username?: string;
        email?: string;
        roles?: string[];
        isActive?: boolean;
    }): Observable<AdminResponse<any>> {
        return this.http.put<AdminResponse<any>>(`${this.API_URL}/users/${userId}`, userData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Delete user (Super Admin only)
     */
    deleteUser(userId: string): Observable<AdminResponse<{ deleted: boolean }>> {
        return this.http.delete<AdminResponse<{ deleted: boolean }>>(`${this.API_URL}/users/${userId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Bulk delete users (Super Admin only)
     */
    bulkDeleteUsers(userIds: string[]): Observable<AdminResponse<{ deletedCount: number }>> {
        return this.http.post<AdminResponse<{ deletedCount: number }>>(`${this.API_URL}/users/bulk-delete`, {
            userIds: userIds
        }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Bulk update users (Super Admin only)
     */
    bulkUpdateUsers(userIds: string[], updates: {
        isActive?: boolean;
        roles?: string[];
    }): Observable<AdminResponse<{ updatedCount: number }>> {
        return this.http.post<AdminResponse<{ updatedCount: number }>>(`${this.API_URL}/users/bulk-update`, {
            userIds: userIds,
            updates: updates
        }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get system statistics
     */
    getSystemStats(): Observable<AdminResponse<SystemStats>> {
        return this.http.get<AdminResponse<SystemStats>>(`${this.API_URL}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user activity logs
     */
    getUserActivity(userId: string, options: {
        limit?: number;
        offset?: number;
    } = {}): Observable<AdminResponse<UserActivity[]>> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<AdminResponse<UserActivity[]>>(`${this.API_URL}/users/${userId}/activity?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get group statistics
     */
    getGroupStats(): Observable<AdminResponse<GroupStats>> {
        return this.http.get<AdminResponse<GroupStats>>(`${this.API_URL}/groups/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channel statistics
     */
    getChannelStats(): Observable<AdminResponse<ChannelStats>> {
        return this.http.get<AdminResponse<ChannelStats>>(`${this.API_URL}/channels/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get all groups (Admin view)
     */
    getAllGroups(options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        category?: string;
    } = {}): Observable<AdminResponse<{
        groups: any[];
        total: number;
        page: number;
        pages: number;
    }>> {
        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.search) params.append('search', options.search);
        if (options.status) params.append('status', options.status);
        if (options.category) params.append('category', options.category);

        return this.http.get<AdminResponse<{
            groups: any[];
            total: number;
            page: number;
            pages: number;
        }>>(`${this.API_URL}/groups?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get all channels (Admin view)
     */
    getAllChannels(): Observable<AdminResponse<any[]>> {
        return this.http.get<AdminResponse<any[]>>(`${this.API_URL}/channels`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get all messages (Admin view)
     */
    getAllMessages(options: {
        limit?: number;
        offset?: number;
        channelId?: string;
        userId?: string;
    } = {}): Observable<AdminResponse<any[]>> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        if (options.channelId) params.append('channelId', options.channelId);
        if (options.userId) params.append('userId', options.userId);

        return this.http.get<AdminResponse<any[]>>(`${this.API_URL}/messages?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get system logs
     */
    getSystemLogs(options: {
        level?: string;
        limit?: number;
        offset?: number;
    } = {}): Observable<AdminResponse<any[]>> {
        const params = new URLSearchParams();
        if (options.level) params.append('level', options.level);
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<AdminResponse<any[]>>(`${this.API_URL}/logs?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Export data
     */
    exportData(type: 'users' | 'groups' | 'channels' | 'messages'): Observable<Blob> {
        return this.http.get(`${this.API_URL}/export/${type}`, {
            headers: this.authService.getAuthHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * Backup database
     */
    backupDatabase(): Observable<AdminResponse<{ backupId: string; downloadUrl: string }>> {
        return this.http.post<AdminResponse<{ backupId: string; downloadUrl: string }>>(`${this.API_URL}/backup`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get server health status (Mock data - endpoint not implemented in backend)
     */
    getServerHealth(): Observable<AdminResponse<{
        status: 'healthy' | 'warning' | 'critical';
        checks: {
            database: boolean;
            redis: boolean;
            storage: boolean;
            memory: boolean;
        };
        uptime: string;
        version: string;
    }>> {
        // Return mock data since backend doesn't have /health endpoint
        return new Observable(observer => {
            observer.next({
                success: true,
                data: {
                    status: 'healthy' as const,
                    checks: {
                        database: true,
                        redis: true,
                        storage: true,
                        memory: true
                    },
                    uptime: '2 days, 5 hours',
                    version: '1.0.0'
                }
            });
            observer.complete();
        });
    }

    /**
     * Clear cache
     */
    clearCache(): Observable<AdminResponse<{ cleared: boolean }>> {
        return this.http.post<AdminResponse<{ cleared: boolean }>>(`${this.API_URL}/clear-cache`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Restart server (Super Admin only)
     */
    restartServer(): Observable<AdminResponse<{ restarting: boolean }>> {
        return this.http.post<AdminResponse<{ restarting: boolean }>>(`${this.API_URL}/restart`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get user statistics
     */
    getUserStats(): Observable<AdminResponse<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisWeek: number;
        superAdmins: number;
        groupAdmins: number;
        inactiveUsers: number;
    }>> {
        return this.http.get<AdminResponse<{
            totalUsers: number;
            activeUsers: number;
            newUsersThisWeek: number;
            superAdmins: number;
            groupAdmins: number;
            inactiveUsers: number;
        }>>(`${this.API_URL}/users/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get admin activity logs (Mock data - endpoint not implemented in backend)
     */
    getAdminActivity(options: {
        limit?: number;
        offset?: number;
        adminId?: string;
    } = {}): Observable<AdminResponse<any[]>> {
        // Return mock data since backend doesn't have /admin-activity endpoint
        return new Observable(observer => {
            observer.next({
                success: true,
                data: [
                    {
                        id: '1',
                        username: 'admin',
                        action: 'Created new group',
                        timestamp: new Date().toISOString(),
                        details: 'Created group "General Discussion"'
                    },
                    {
                        id: '2',
                        username: 'admin',
                        action: 'Updated user permissions',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        details: 'Updated permissions for user "john_doe"'
                    },
                    {
                        id: '3',
                        username: 'admin',
                        action: 'Deleted channel',
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        details: 'Deleted channel "spam" from group "General Discussion"'
                    }
                ]
            });
            observer.complete();
        });
    }
}
