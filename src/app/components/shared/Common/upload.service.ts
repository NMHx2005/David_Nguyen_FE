import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/api.service';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        avatarUrl?: string;
        imageUrl?: string;
        fileUrl?: string;
        filename: string;
        originalName?: string;
        size?: number;
        mimeType?: string;
    };
}

export interface MultipleUploadResponse {
    success: boolean;
    message: string;
    data: {
        files: Array<{
            fileUrl: string;
            filename: string;
            originalName: string;
            size: number;
            mimeType: string;
        }>;
        count: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private uploadProgressSubject = new BehaviorSubject<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
    public uploadProgress$ = this.uploadProgressSubject.asObservable();

    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) { }

    // Upload avatar
    uploadAvatar(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.http.post<UploadResponse>(`${environment.apiUrl}/upload/avatar`, formData, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<UploadResponse>) => {
                if (event.type === HttpEventType.UploadProgress) {
                    const progress = event as HttpProgressEvent;
                    const percentage = Math.round(100 * progress.loaded / (progress.total || 1));
                    this.uploadProgressSubject.next({
                        loaded: progress.loaded,
                        total: progress.total || 0,
                        percentage: percentage
                    });
                    return null;
                } else if (event.type === HttpEventType.Response) {
                    this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                    return event.body!;
                }
                return null;
            }),
            map(response => response!),
            catchError(error => {
                this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                throw error;
            })
        );
    }

    // Upload image
    uploadImage(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('image', file);

        return this.http.post<UploadResponse>(`${environment.apiUrl}/upload/image`, formData, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<UploadResponse>) => {
                if (event.type === HttpEventType.UploadProgress) {
                    const progress = event as HttpProgressEvent;
                    const percentage = Math.round(100 * progress.loaded / (progress.total || 1));
                    this.uploadProgressSubject.next({
                        loaded: progress.loaded,
                        total: progress.total || 0,
                        percentage: percentage
                    });
                    return null;
                } else if (event.type === HttpEventType.Response) {
                    this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                    return event.body!;
                }
                return null;
            }),
            map(response => response!),
            catchError(error => {
                this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                throw error;
            })
        );
    }

    // Upload file
    uploadFile(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<UploadResponse>(`${environment.apiUrl}/upload/file`, formData, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<UploadResponse>) => {
                if (event.type === HttpEventType.UploadProgress) {
                    const progress = event as HttpProgressEvent;
                    const percentage = Math.round(100 * progress.loaded / (progress.total || 1));
                    this.uploadProgressSubject.next({
                        loaded: progress.loaded,
                        total: progress.total || 0,
                        percentage: percentage
                    });
                    return null;
                } else if (event.type === HttpEventType.Response) {
                    this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                    return event.body!;
                }
                return null;
            }),
            map(response => response!),
            catchError(error => {
                this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                throw error;
            })
        );
    }

    // Upload multiple files
    uploadMultipleFiles(files: File[]): Observable<MultipleUploadResponse> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        return this.http.post<MultipleUploadResponse>(`${environment.apiUrl}/upload/multiple`, formData, {
            reportProgress: true,
            observe: 'events'
        }).pipe(
            map((event: HttpEvent<MultipleUploadResponse>) => {
                if (event.type === HttpEventType.UploadProgress) {
                    const progress = event as HttpProgressEvent;
                    const percentage = Math.round(100 * progress.loaded / (progress.total || 1));
                    this.uploadProgressSubject.next({
                        loaded: progress.loaded,
                        total: progress.total || 0,
                        percentage: percentage
                    });
                    return null;
                } else if (event.type === HttpEventType.Response) {
                    this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                    return event.body!;
                }
                return null;
            }),
            map(response => response!),
            catchError(error => {
                this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
                throw error;
            })
        );
    }

    // Get file info
    getFileInfo(filename: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/upload/info/${filename}`);
    }

    // Delete file
    deleteFile(filename: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/upload/${filename}`);
    }

    // Get file URL
    getFileUrl(filename: string): string {
        return `${environment.apiUrl.replace('/api', '')}/uploads/${filename}`;
    }

    // Get avatar URL
    getAvatarUrl(filename: string): string {
        return `${environment.apiUrl.replace('/api', '')}/uploads/avatars/${filename}`;
    }

    // Get image URL
    getImageUrl(filename: string): string {
        return `${environment.apiUrl.replace('/api', '')}/uploads/images/${filename}`;
    }

    // Validate file type
    validateFileType(file: File, allowedTypes: string[]): boolean {
        return allowedTypes.includes(file.type);
    }

    // Validate file size
    validateFileSize(file: File, maxSizeInMB: number): boolean {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return file.size <= maxSizeInBytes;
    }

    // Get file size in human readable format
    getFileSizeString(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Reset upload progress
    resetProgress(): void {
        this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
    }
}
