import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Channel {
    _id: string;
    name: string;
    description: string;
    groupId: string;
    type: 'text' | 'voice' | 'video';
    isPrivate: boolean;
    isActive: boolean;
    members: string[];
    admins: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastMessage?: {
        messageId: string;
        userId: string;
        username: string;
        text: string;
        timestamp: string;
    };
    memberCount: number;
    settings?: any;
}

export interface ChannelCreate {
    name: string;
    description: string;
    groupId: string;
    type: 'text' | 'voice' | 'video';
    isPrivate: boolean;
}

export interface ChannelUpdate {
    name?: string;
    description?: string;
    type?: 'text' | 'voice' | 'video';
    isPrivate?: boolean;
}

export interface ChannelResponse {
    success: boolean;
    data: Channel;
    message?: string;
}

export interface ChannelsListResponse {
    success: boolean;
    data: Channel[];
}

export interface ChannelsPaginatedResponse {
    success: boolean;
    data: {
        channels: Channel[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

export interface ChannelStatsResponse {
    success: boolean;
    data: {
        totalChannels: number;
        activeChannels: number;
        textChannels: number;
        voiceChannels: number;
        videoChannels: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    private readonly API_URL = `${environment.apiUrl}/channels`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get all channels
     */
    getAllChannels(): Observable<ChannelsListResponse> {
        return this.http.get<ChannelsListResponse>(`${this.API_URL}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channels with pagination
     */
    getChannelsPaginated(options?: {
        page?: number;
        limit?: number;
        search?: string;
        groupId?: string;
        channelType?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Observable<ChannelsPaginatedResponse> {
        let url = `${this.API_URL}/paginated`;
        if (options) {
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page.toString());
            if (options.limit) params.append('limit', options.limit.toString());
            if (options.search) params.append('search', options.search);
            if (options.groupId) params.append('groupId', options.groupId);
            if (options.channelType) params.append('channelType', options.channelType);
            if (options.isActive !== undefined) params.append('isActive', options.isActive.toString());
            if (options.sortBy) params.append('sortBy', options.sortBy);
            if (options.sortOrder) params.append('sortOrder', options.sortOrder);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        return this.http.get<ChannelsPaginatedResponse>(url, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channels by group ID
     */
    getChannelsByGroup(groupId: string): Observable<ChannelsListResponse> {
        return this.http.get<ChannelsListResponse>(`${this.API_URL}/group/${groupId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channel by ID
     */
    getChannelById(id: string): Observable<ChannelResponse> {
        return this.http.get<ChannelResponse>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Create new channel
     */
    createChannel(channelData: ChannelCreate): Observable<ChannelResponse> {
        return this.http.post<ChannelResponse>(`${this.API_URL}`, channelData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update channel
     */
    updateChannel(id: string, channelData: ChannelUpdate): Observable<ChannelResponse> {
        return this.http.put<ChannelResponse>(`${this.API_URL}/${id}`, channelData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Delete channel
     */
    deleteChannel(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Add member to channel
     */
    addMember(channelId: string, userId: string): Observable<ChannelResponse> {
        return this.http.post<ChannelResponse>(`${this.API_URL}/${channelId}/members`, { userId }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Remove member from channel
     */
    removeMember(channelId: string, userId: string): Observable<ChannelResponse> {
        return this.http.delete<ChannelResponse>(`${this.API_URL}/${channelId}/members/${userId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Join channel
     */
    joinChannel(channelId: string): Observable<ChannelResponse> {
        return this.http.post<ChannelResponse>(`${this.API_URL}/${channelId}/join`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Leave channel
     */
    leaveChannel(channelId: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/${channelId}/leave`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channel members
     */
    getChannelMembers(channelId: string): Observable<{
        success: boolean;
        data: {
            members: string[];
            admins: string[];
        };
    }> {
        return this.http.get<{
            success: boolean;
            data: {
                members: string[];
                admins: string[];
            };
        }>(`${this.API_URL}/${channelId}/members`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Check if user is member of channel
     */
    isMember(channelId: string, userId?: string): Observable<{ success: boolean; data: boolean }> {
        const targetUserId = userId || this.authService.getCurrentUser()?.id;
        return this.http.get<{ success: boolean; data: boolean }>(`${this.API_URL}/${channelId}/members/${targetUserId}/check`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Search channels
     */
    searchChannels(query: string, groupId?: string): Observable<ChannelsListResponse> {
        let url = `${this.API_URL}/search?query=${encodeURIComponent(query)}`;
        if (groupId) {
            url += `&groupId=${groupId}`;
        }
        return this.http.get<ChannelsListResponse>(url, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channel statistics (Admin only)
     */
    getChannelStats(): Observable<ChannelStatsResponse> {
        return this.http.get<ChannelStatsResponse>(`${this.API_URL}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update channel settings
     */
    updateChannelSettings(channelId: string, settings: any): Observable<ChannelResponse> {
        return this.http.put<ChannelResponse>(`${this.API_URL}/${channelId}/settings`, { settings }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channels for current user
     */
    getMyChannels(): Observable<ChannelsListResponse> {
        return this.http.get<ChannelsListResponse>(`${this.API_URL}/my-channels`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Archive channel
     */
    archiveChannel(channelId: string): Observable<ChannelResponse> {
        return this.http.put<ChannelResponse>(`${this.API_URL}/${channelId}/archive`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Unarchive channel
     */
    unarchiveChannel(channelId: string): Observable<ChannelResponse> {
        return this.http.put<ChannelResponse>(`${this.API_URL}/${channelId}/unarchive`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get channel activity
     */
    getChannelActivity(channelId: string, options: {
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
        }>(`${this.API_URL}/${channelId}/activity?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
