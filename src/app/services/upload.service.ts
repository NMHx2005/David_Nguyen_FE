import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResponse {
    success: boolean;
    data: {
        filename: string;
        originalName: string;
        path: string;
        size: number;
        mimeType: string;
        url: string;
    };
    message?: string;
}

export interface AvatarUploadResponse {
    success: boolean;
    data: {
        avatarUrl: string;
        filename: string;
        path: string;
    };
    message?: string;
}

export interface ImageUploadResponse {
    success: boolean;
    data: {
        imageUrl: string;
        filename: string;
        path: string;
        size: number;
        width?: number;
        height?: number;
    };
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private readonly API_URL = `${environment.apiUrl}/upload`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Upload avatar image
     */
    uploadAvatar(file: File, userId?: string): Observable<AvatarUploadResponse> {
        const formData = new FormData();
        formData.append('avatar', file);
        if (userId) {
            formData.append('userId', userId);
        }

        return this.http.post<AvatarUploadResponse>(`${this.API_URL}/avatar`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
                // Don't set Content-Type, let browser set it for FormData
            }
        });
    }

    /**
     * Upload avatar with progress tracking
     */
    uploadAvatarWithProgress(file: File, userId?: string): Observable<{
        progress?: UploadProgress;
        response?: AvatarUploadResponse;
    }> {
        const formData = new FormData();
        formData.append('avatar', file);
        if (userId) {
            formData.append('userId', userId);
        }

        return this.http.post<AvatarUploadResponse>(`${this.API_URL}/avatar`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
            },
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<AvatarUploadResponse>) => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progressEvent = event as HttpProgressEvent;
                        return {
                            progress: {
                                loaded: progressEvent.loaded,
                                total: progressEvent.total || 0,
                                percentage: progressEvent.total ? Math.round(100 * progressEvent.loaded / progressEvent.total) : 0
                            }
                        };
                    case HttpEventType.Response:
                        return { response: event.body! };
                    default:
                        return {};
                }
            })
        );
    }

    /**
     * Upload image for chat messages
     */
    uploadImage(file: File, channelId?: string): Observable<ImageUploadResponse> {
        const formData = new FormData();
        formData.append('image', file);
        if (channelId) {
            formData.append('channelId', channelId);
        }

        return this.http.post<ImageUploadResponse>(`${this.API_URL}/image`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
            }
        });
    }

    /**
     * Upload image with progress tracking
     */
    uploadImageWithProgress(file: File, channelId?: string): Observable<{
        progress?: UploadProgress;
        response?: ImageUploadResponse;
    }> {
        const formData = new FormData();
        formData.append('image', file);
        if (channelId) {
            formData.append('channelId', channelId);
        }

        return this.http.post<ImageUploadResponse>(`${this.API_URL}/image`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
            },
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<ImageUploadResponse>) => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progressEvent = event as HttpProgressEvent;
                        return {
                            progress: {
                                loaded: progressEvent.loaded,
                                total: progressEvent.total || 0,
                                percentage: progressEvent.total ? Math.round(100 * progressEvent.loaded / progressEvent.total) : 0
                            }
                        };
                    case HttpEventType.Response:
                        return { response: event.body! };
                    default:
                        return {};
                }
            })
        );
    }

    /**
     * Upload file for chat messages
     */
    uploadFile(file: File, channelId?: string): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        if (channelId) {
            formData.append('channelId', channelId);
        }

        return this.http.post<UploadResponse>(`${this.API_URL}/file`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
            }
        });
    }

    /**
     * Upload file with progress tracking
     */
    uploadFileWithProgress(file: File, channelId?: string): Observable<{
        progress?: UploadProgress;
        response?: UploadResponse;
    }> {
        const formData = new FormData();
        formData.append('file', file);
        if (channelId) {
            formData.append('channelId', channelId);
        }

        return this.http.post<UploadResponse>(`${this.API_URL}/file`, formData, {
            headers: {
                'Authorization': this.authService.getToken() ? `Bearer ${this.authService.getToken()}` : ''
            },
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<UploadResponse>) => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progressEvent = event as HttpProgressEvent;
                        return {
                            progress: {
                                loaded: progressEvent.loaded,
                                total: progressEvent.total || 0,
                                percentage: progressEvent.total ? Math.round(100 * progressEvent.loaded / progressEvent.total) : 0
                            }
                        };
                    case HttpEventType.Response:
                        return { response: event.body! };
                    default:
                        return {};
                }
            })
        );
    }

    /**
     * Delete uploaded file
     */
    deleteFile(filePath: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/file`, {
            headers: this.authService.getAuthHeaders(),
            body: { filePath }
        });
    }

    /**
     * Get file info
     */
    getFileInfo(filePath: string): Observable<{
        success: boolean;
        data: {
            filename: string;
            originalName: string;
            path: string;
            size: number;
            mimeType: string;
            url: string;
            uploadedAt: string;
        };
    }> {
        return this.http.get<{
            success: boolean;
            data: {
                filename: string;
                originalName: string;
                path: string;
                size: number;
                mimeType: string;
                url: string;
                uploadedAt: string;
            };
        }>(`${this.API_URL}/file-info?path=${encodeURIComponent(filePath)}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get upload limits
     */
    getUploadLimits(): Observable<{
        success: boolean;
        data: {
            maxFileSize: number;
            maxImageSize: number;
            maxAvatarSize: number;
            allowedImageTypes: string[];
            allowedFileTypes: string[];
        };
    }> {
        return this.http.get<{
            success: boolean;
            data: {
                maxFileSize: number;
                maxImageSize: number;
                maxAvatarSize: number;
                allowedImageTypes: string[];
                allowedFileTypes: string[];
            };
        }>(`${this.API_URL}/limits`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Validate file before upload
     */
    validateFile(file: File, type: 'avatar' | 'image' | 'file'): {
        valid: boolean;
        error?: string;
    } {
        const limits = {
            avatar: { maxSize: 2 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/gif'] }, // 2MB
            image: { maxSize: 10 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] }, // 10MB
            file: { maxSize: 50 * 1024 * 1024, types: ['*'] } // 50MB
        };

        const limit = limits[type];

        if (file.size > limit.maxSize) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${limit.maxSize / (1024 * 1024)}MB`
            };
        }

        if (type !== 'file' && !limit.types.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} is not allowed. Allowed types: ${limit.types.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Get file URL
     */
    getFileUrl(filePath: string): string {
        return `${environment.apiUrl}/uploads/${filePath}`;
    }

    /**
     * Get avatar URL
     */
    getAvatarUrl(avatarPath: string): string {
        return `${environment.apiUrl}/uploads/avatars/${avatarPath}`;
    }

    /**
     * Get image URL
     */
    getImageUrl(imagePath: string): string {
        return `${environment.apiUrl}/uploads/images/${imagePath}`;
    }
}
