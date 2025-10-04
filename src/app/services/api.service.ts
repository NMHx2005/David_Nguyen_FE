import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: {
        _id: string;
        username: string;
        email: string;
        roles: string[];
        groups: string[];
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        lastLogin?: string;
        avatar?: string;
        bio?: string;
        phone?: string;
        address?: string;
    };
    accessToken: string;
    refreshToken: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private errorHandler: ErrorHandlerService
    ) { }

    // Authentication
    login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, credentials)
            .pipe(
                catchError(error => {
                    this.errorHandler.handleError(error);
                    return throwError(() => error);
                })
            );
    }

    register(userData: RegisterRequest): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/register`, userData);
    }

    logout(): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/auth/logout`, {});
    }

    refreshToken(): Observable<ApiResponse<{ accessToken: string }>> {
        const refreshToken = localStorage.getItem('refresh_token');
        return this.http.post<ApiResponse<{ accessToken: string }>>(`${this.baseUrl}/auth/refresh`, {
            refreshToken: refreshToken
        });
    }

    // Users
    getUsers(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/users`);
    }

    getUserById(id: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/users/${id}`);
    }

    updateUser(id: string, userData: any): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/${id}`, userData);
    }

    deleteUser(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${id}`);
    }

    // Groups
    getGroups(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/groups`);
    }

    getGroupById(id: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/groups/${id}`);
    }

    createGroup(groupData: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/groups`, groupData);
    }

    updateGroup(id: string, groupData: any): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.baseUrl}/groups/${id}`, groupData);
    }

    deleteGroup(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/groups/${id}`);
    }

    joinGroup(id: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/groups/${id}/join`, {});
    }

    leaveGroup(id: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/groups/${id}/leave`, {});
    }

    // Channels
    getChannels(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/channels`);
    }

    getChannelById(id: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/channels/${id}`);
    }

    createChannel(channelData: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/channels`, channelData);
    }

    updateChannel(id: string, channelData: any): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.baseUrl}/channels/${id}`, channelData);
    }

    deleteChannel(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/channels/${id}`);
    }

    // Messages
    getMessages(channelId: string, page = 1, limit = 50): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/messages/${channelId}?page=${page}&limit=${limit}`);
    }

    sendMessage(messageData: any): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/messages`, messageData);
    }

    updateMessage(id: string, messageData: any): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.baseUrl}/messages/${id}`, messageData);
    }

    deleteMessage(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/messages/${id}`);
    }

    // Upload
    uploadFile(file: File, type: 'avatar' | 'image' | 'file' = 'file'): Observable<ApiResponse<{ url: string }>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return this.http.post<ApiResponse<{ url: string }>>(`${this.baseUrl}/upload`, formData);
    }

    uploadMultipleFiles(files: File[], type: 'image' | 'file' = 'file'): Observable<ApiResponse<{ urls: string[] }>> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('type', type);

        return this.http.post<ApiResponse<{ urls: string[] }>>(`${this.baseUrl}/upload/multiple`, formData);
    }

    // Video Calls
    getCallHistory(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/video-calls/history`);
    }

    getActiveCalls(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/video-calls/active`);
    }

    getCallStats(): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/video-calls/stats`);
    }

    // Health Check
    healthCheck(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(`${this.baseUrl.replace('/api', '')}/health`);
    }
}
