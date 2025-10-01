import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UploadService, UploadResponse, UploadProgress } from './upload.service';

@Component({
    selector: 'app-avatar-upload',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    template: `
    <div class="avatar-upload-container">
      <!-- Current Avatar Display -->
      <div class="avatar-display" (click)="triggerFileInput()">
        <img *ngIf="currentAvatarUrl" 
             [src]="currentAvatarUrl" 
             [alt]="altText"
             class="avatar-image">
        <div *ngIf="!currentAvatarUrl" class="avatar-placeholder">
          <mat-icon>person</mat-icon>
        </div>
        
        <!-- Upload Overlay -->
        <div class="upload-overlay" [class.uploading]="isUploading">
          <mat-icon *ngIf="!isUploading">camera_alt</mat-icon>
          <mat-spinner *ngIf="isUploading" diameter="24"></mat-spinner>
        </div>
      </div>

      <!-- Upload Progress -->
      <div *ngIf="isUploading" class="upload-progress">
        <mat-progress-bar 
          mode="determinate" 
          [value]="uploadProgress.percentage">
        </mat-progress-bar>
        <span class="progress-text">{{ uploadProgress.percentage }}%</span>
      </div>

      <!-- Upload Button -->
      <button *ngIf="!isUploading" 
              mat-stroked-button 
              color="primary" 
              (click)="triggerFileInput()"
              class="upload-button">
        <mat-icon>upload</mat-icon>
        {{ buttonText }}
      </button>

      <!-- Remove Button -->
      <button *ngIf="currentAvatarUrl && !isUploading" 
              mat-stroked-button 
              color="warn" 
              (click)="removeAvatar()"
              class="remove-button">
        <mat-icon>delete</mat-icon>
        Remove
      </button>

      <!-- Hidden File Input -->
      <input #fileInput 
             type="file" 
             accept="image/*" 
             (change)="onFileSelected($event)"
             style="display: none;">
    </div>
  `,
    styles: [`
    .avatar-upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .avatar-display {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .avatar-display:hover {
      border-color: #2196f3;
      transform: scale(1.05);
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .avatar-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .avatar-display:hover .upload-overlay {
      opacity: 1;
    }

    .upload-overlay.uploading {
      opacity: 1;
      background-color: rgba(33, 150, 243, 0.8);
    }

    .upload-progress {
      width: 100%;
      max-width: 200px;
    }

    .progress-text {
      font-size: 12px;
      color: #666;
      text-align: center;
      display: block;
      margin-top: 4px;
    }

    .upload-button, .remove-button {
      min-width: 120px;
    }

    .remove-button {
      margin-top: 8px;
    }
  `]
})
export class AvatarUploadComponent {
    @Input() currentAvatarUrl: string = '';
    @Input() altText: string = 'Avatar';
    @Input() buttonText: string = 'Upload Avatar';
    @Input() maxSizeInMB: number = 2;
    @Input() allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    @Output() avatarUploaded = new EventEmitter<UploadResponse>();
    @Output() avatarRemoved = new EventEmitter<void>();
    @Output() uploadError = new EventEmitter<string>();

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    uploadService = inject(UploadService);
    snackBar = inject(MatSnackBar);

    isUploading = false;
    uploadProgress: UploadProgress = { loaded: 0, total: 0, percentage: 0 };

    ngOnInit(): void {
        // Subscribe to upload progress
        this.uploadService.uploadProgress$.subscribe(progress => {
            this.uploadProgress = progress;
        });
    }

    triggerFileInput(): void {
        if (!this.isUploading) {
            this.fileInput.nativeElement.click();
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        // Validate file type
        if (!this.uploadService.validateFileType(file, this.allowedTypes)) {
            this.snackBar.open('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'Close', {
                duration: 3000
            });
            this.uploadError.emit('Invalid file type');
            return;
        }

        // Validate file size
        if (!this.uploadService.validateFileSize(file, this.maxSizeInMB)) {
            this.snackBar.open(`File size must be less than ${this.maxSizeInMB}MB`, 'Close', {
                duration: 3000
            });
            this.uploadError.emit('File too large');
            return;
        }

        this.uploadAvatar(file);
    }

    private uploadAvatar(file: File): void {
        this.isUploading = true;
        this.uploadService.resetProgress();

        this.uploadService.uploadAvatar(file).subscribe({
            next: (response) => {
                if (response) {
                    this.isUploading = false;
                    this.currentAvatarUrl = response.data.avatarUrl || '';
                    this.avatarUploaded.emit(response);
                    this.snackBar.open('Avatar uploaded successfully!', 'Close', {
                        duration: 3000
                    });
                }
            },
            error: (error) => {
                this.isUploading = false;
                console.error('Avatar upload error:', error);
                this.snackBar.open('Failed to upload avatar. Please try again.', 'Close', {
                    duration: 3000
                });
                this.uploadError.emit(error.message || 'Upload failed');
            }
        });
    }

    removeAvatar(): void {
        this.currentAvatarUrl = '';
        this.avatarRemoved.emit();
        this.snackBar.open('Avatar removed', 'Close', {
            duration: 2000
        });
    }
}
