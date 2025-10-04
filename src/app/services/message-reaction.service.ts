import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MessageReaction {
    _id: string;
    messageId: string;
    userId: string;
    reaction: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReactionCounts {
    [reaction: string]: number;
}

export interface UserReactions {
    [reaction: string]: string[];
}

export interface MessageReactionData {
    reactions: MessageReaction[];
    reactionCounts: ReactionCounts;
    userReactions: UserReactions;
    totalReactions: number;
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
export class MessageReactionService {
    private readonly API_URL = `${environment.apiUrl}/messages`;

    constructor(private http: HttpClient) { }

    /**
     * Add or update a reaction to a message
     */
    addReaction(messageId: string, reaction: string): Observable<ApiResponse<MessageReaction>> {
        const headers = this.getHeaders();
        return this.http.post<ApiResponse<MessageReaction>>(
            `${this.API_URL}/${messageId}/reactions`,
            { reaction },
            { headers }
        );
    }

    /**
     * Remove a reaction from a message
     */
    removeReaction(messageId: string): Observable<ApiResponse<MessageReaction>> {
        const headers = this.getHeaders();
        return this.http.delete<ApiResponse<MessageReaction>>(
            `${this.API_URL}/${messageId}/reactions`,
            { headers }
        );
    }

    /**
     * Get all reactions for a message
     */
    getMessageReactions(messageId: string): Observable<ApiResponse<MessageReactionData>> {
        const headers = this.getHeaders();
        return this.http.get<ApiResponse<MessageReactionData>>(
            `${this.API_URL}/${messageId}/reactions`,
            { headers }
        );
    }

    /**
     * Get reactions for multiple messages
     */
    getMultipleMessageReactions(messageIds: string[]): Observable<ApiResponse<{ [messageId: string]: MessageReactionData }>> {
        const headers = this.getHeaders();
        return this.http.post<ApiResponse<{ [messageId: string]: MessageReactionData }>>(
            `${this.API_URL}/reactions/batch`,
            { messageIds },
            { headers }
        );
    }

    /**
     * Check if user has reacted to a message
     */
    checkUserReaction(messageId: string): Observable<ApiResponse<{ hasReacted: boolean; reaction: string | null }>> {
        const headers = this.getHeaders();
        return this.http.get<ApiResponse<{ hasReacted: boolean; reaction: string | null }>>(
            `${this.API_URL}/${messageId}/reactions/check`,
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
