import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MessageReply {
    _id: string;
    originalMessageId: string;
    replyMessageId: string;
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
    createdAt: Date;
    updatedAt: Date;
}

export interface ReplyPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface MessageReplyData {
    replies: MessageReply[];
    pagination: ReplyPagination;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    statusCode: number;
}

@Injectable({
    providedIn: 'root'
})
export class MessageReplyService {
    private readonly API_URL = `${environment.apiUrl}/messages`;

    constructor(private http: HttpClient) { }

    /**
     * Create a reply to a message
     */
    createReply(
        messageId: string,
        channelId: string,
        text: string,
        type: 'text' | 'image' | 'file' = 'text',
        imageUrl?: string,
        fileUrl?: string,
        fileName?: string,
        fileSize?: number
    ): Observable<ApiResponse<{ reply: MessageReply; message: any }>> {
        const headers = this.getHeaders();
        return this.http.post<ApiResponse<{ reply: MessageReply; message: any }>>(
            `${this.API_URL}/${messageId}/replies`,
            {
                channelId,
                text,
                type,
                imageUrl,
                fileUrl,
                fileName,
                fileSize
            },
            { headers }
        );
    }

    /**
     * Get all replies for a message
     */
    getMessageReplies(messageId: string, page: number = 1, limit: number = 20): Observable<ApiResponse<MessageReplyData>> {
        const headers = this.getHeaders();
        return this.http.get<ApiResponse<MessageReplyData>>(
            `${this.API_URL}/${messageId}/replies?page=${page}&limit=${limit}`,
            { headers }
        );
    }

    /**
     * Get reply count for a message
     */
    getReplyCount(messageId: string): Observable<ApiResponse<{ count: number }>> {
        const headers = this.getHeaders();
        return this.http.get<ApiResponse<{ count: number }>>(
            `${this.API_URL}/${messageId}/replies/count`,
            { headers }
        );
    }

    /**
     * Get replies for multiple messages
     */
    getMultipleMessageReplies(messageIds: string[]): Observable<ApiResponse<{ [messageId: string]: MessageReply[] }>> {
        const headers = this.getHeaders();
        return this.http.post<ApiResponse<{ [messageId: string]: MessageReply[] }>>(
            `${this.API_URL}/replies/batch`,
            { messageIds },
            { headers }
        );
    }

    /**
     * Delete a reply
     */
    deleteReply(replyId: string): Observable<ApiResponse<MessageReply>> {
        const headers = this.getHeaders();
        return this.http.delete<ApiResponse<MessageReply>>(
            `${this.API_URL}/replies/${replyId}`,
            { headers }
        );
    }

    /**
     * Get headers with authentication token
     */
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }
}
