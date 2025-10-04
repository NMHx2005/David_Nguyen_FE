import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Message {
    _id: string;
    channelId: string;
    userId: string;
    username: string;
    text: string;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    isEdited: boolean;
    isDeleted: boolean;
    editedAt?: string;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessageCreate {
    channelId: string;
    text: string;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
}

export interface MessageUpdate {
    text?: string;
}

export interface MessageResponse {
    success: boolean;
    data: Message;
    message?: string;
}

export interface MessagesListResponse {
    success: boolean;
    data: Message[];
}

export interface MessageSearchResponse {
    success: boolean;
    data: {
        messages: Message[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface MessageStatsResponse {
    success: boolean;
    data: {
        totalMessages: number;
        messagesToday: number;
        messagesThisWeek: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private readonly API_URL = `${environment.apiUrl}/messages`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get messages by channel
     */
    getMessagesByChannel(channelId: string, options: {
        limit?: number;
        offset?: number;
    } = {}): Observable<MessagesListResponse> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<MessagesListResponse>(`${this.API_URL}/channel/${channelId}?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get messages by user
     */
    getMessagesByUser(userId: string, options: {
        limit?: number;
        offset?: number;
    } = {}): Observable<MessagesListResponse> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<MessagesListResponse>(`${this.API_URL}/user/${userId}?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Search messages
     */
    searchMessages(query: string, options: {
        channelId?: string;
        userId?: string;
        limit?: number;
        offset?: number;
    } = {}): Observable<MessageSearchResponse> {
        const params = new URLSearchParams();
        params.append('query', query);
        if (options.channelId) params.append('channelId', options.channelId);
        if (options.userId) params.append('userId', options.userId);
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        return this.http.get<MessageSearchResponse>(`${this.API_URL}/search?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get message by ID
     */
    getMessageById(id: string): Observable<MessageResponse> {
        return this.http.get<MessageResponse>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Create new message
     */
    createMessage(messageData: MessageCreate): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.API_URL}`, messageData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Send message (alias for createMessage)
     */
    sendMessage(messageData: MessageCreate): Observable<MessageResponse> {
        return this.createMessage(messageData);
    }

    /**
     * Update message
     */
    updateMessage(id: string, messageData: MessageUpdate): Observable<MessageResponse> {
        return this.http.put<MessageResponse>(`${this.API_URL}/${id}`, messageData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Delete message
     */
    deleteMessage(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Send text message
     */
    sendTextMessage(channelId: string, text: string): Observable<MessageResponse> {
        return this.createMessage({
            channelId,
            text,
            type: 'text'
        });
    }

    /**
     * Send image message
     */
    sendImageMessage(channelId: string, imageUrl: string, fileName?: string, fileSize?: number): Observable<MessageResponse> {
        return this.createMessage({
            channelId,
            text: '', // Empty text for image messages
            type: 'image',
            imageUrl,
            fileName,
            fileSize
        });
    }

    /**
     * Send file message
     */
    sendFileMessage(channelId: string, fileUrl: string, fileName: string, fileSize: number): Observable<MessageResponse> {
        return this.createMessage({
            channelId,
            text: fileName, // Use filename as text
            type: 'file',
            fileUrl,
            fileName,
            fileSize
        });
    }

    /**
     * Edit message
     */
    editMessage(messageId: string, newText: string): Observable<MessageResponse> {
        return this.updateMessage(messageId, { text: newText });
    }

    /**
     * Get message statistics (Admin only)
     */
    getMessageStats(): Observable<MessageStatsResponse> {
        return this.http.get<MessageStatsResponse>(`${this.API_URL}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get recent messages for multiple channels
     */
    getRecentMessages(channelIds: string[], limit: number = 50): Observable<{
        success: boolean;
        data: {
            [channelId: string]: Message[];
        };
    }> {
        const params = new URLSearchParams();
        params.append('channels', channelIds.join(','));
        params.append('limit', limit.toString());

        return this.http.get<{
            success: boolean;
            data: {
                [channelId: string]: Message[];
            };
        }>(`${this.API_URL}/recent?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get message history with pagination
     */
    getMessageHistory(channelId: string, options: {
        before?: string; // Message ID to get messages before
        after?: string;  // Message ID to get messages after
        limit?: number;
    } = {}): Observable<MessagesListResponse> {
        const params = new URLSearchParams();
        if (options.before) params.append('before', options.before);
        if (options.after) params.append('after', options.after);
        if (options.limit) params.append('limit', options.limit.toString());

        return this.http.get<MessagesListResponse>(`${this.API_URL}/channel/${channelId}/history?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Mark messages as read
     */
    markMessagesAsRead(channelId: string, lastMessageId: string): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(`${this.API_URL}/mark-read`, {
            channelId,
            lastMessageId
        }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get unread message count for channels
     */
    getUnreadCounts(channelIds: string[]): Observable<{
        success: boolean;
        data: {
            [channelId: string]: number;
        };
    }> {
        const params = new URLSearchParams();
        params.append('channels', channelIds.join(','));

        return this.http.get<{
            success: boolean;
            data: {
                [channelId: string]: number;
            };
        }>(`${this.API_URL}/unread-counts?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
