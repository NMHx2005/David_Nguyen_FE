import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

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

    constructor(private apiService: ApiService) { }

    // Upload avatar
    uploadAvatar(file: File): Observable<UploadResponse> {
        return this.apiService.uploadFile(file, 'avatar').pipe(
            map(response => ({
                success: response.success,
                message: response.message,
                data: {
                    avatarUrl: response.data?.url,
                    filename: file.name,
                    originalName: file.name,
                    size: file.size,
                    mimeType: file.type
                }
            })),
            catchError(error => {
                console.error('Avatar upload error:', error);
                throw error;
            })
        );
    }

    // Upload image
    uploadImage(file: File): Observable<UploadResponse> {
        return this.apiService.uploadFile(file, 'image').pipe(
            map(response => ({
                success: response.success,
                message: response.message,
                data: {
                    imageUrl: response.data?.url,
                    filename: file.name,
                    originalName: file.name,
                    size: file.size,
                    mimeType: file.type
                }
            })),
            catchError(error => {
                console.error('Image upload error:', error);
                throw error;
            })
        );
    }

    // Upload file
    uploadFile(file: File): Observable<UploadResponse> {
        return this.apiService.uploadFile(file, 'file').pipe(
            map(response => ({
                success: response.success,
                message: response.message,
                data: {
                    fileUrl: response.data?.url,
                    filename: file.name,
                    originalName: file.name,
                    size: file.size,
                    mimeType: file.type
                }
            })),
            catchError(error => {
                console.error('File upload error:', error);
                throw error;
            })
        );
    }

    // Upload multiple files
    uploadMultipleFiles(files: File[], type: 'image' | 'file' = 'file'): Observable<MultipleUploadResponse> {
        return this.apiService.uploadMultipleFiles(files, type).pipe(
            map(response => ({
                success: response.success,
                message: response.message,
                data: {
                    files: response.data?.urls.map((url, index) => ({
                        fileUrl: url,
                        filename: files[index].name,
                        originalName: files[index].name,
                        size: files[index].size,
                        mimeType: files[index].type
                    })) || [],
                    count: files.length
                }
            })),
            catchError(error => {
                console.error('Multiple files upload error:', error);
                throw error;
            })
        );
    }

    // Get upload progress
    getUploadProgress(): Observable<UploadProgress> {
        return this.uploadProgress$;
    }

    // Reset upload progress
    resetUploadProgress(): void {
        this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
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

    // Get file extension
    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    // Format file size
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
