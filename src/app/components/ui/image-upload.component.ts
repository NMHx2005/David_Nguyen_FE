import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UploadService, UploadResponse, UploadProgress } from '../../services/upload.service';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSnackBarModule
    ],
    template: `
    <div class="image-upload-container">
      <!-- Upload Button -->
      <button mat-icon-button 
              color="primary" 
              (click)="triggerFileInput()"
              [disabled]="isUploading"
              class="upload-button">
        <mat-icon>attach_file</mat-icon>
      </button>

      <!-- Upload Progress -->
      <div *ngIf="isUploading" class="upload-progress">
        <mat-progress-bar 
          mode="determinate" 
          [value]="uploadProgress.percentage">
        </mat-progress-bar>
        <span class="progress-text">{{ uploadProgress.percentage }}%</span>
      </div>

      <!-- Hidden File Input -->
      <input #fileInput 
             type="file" 
             [accept]="acceptedTypes" 
             [multiple]="allowMultiple"
             (change)="onFileSelected($event)"
             style="display: none;">
    </div>
  `,
    styles: [`
    .image-upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .upload-button {
      min-width: 40px;
      min-height: 40px;
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
  `]
})
export class ImageUploadComponent {
    @Input() allowMultiple: boolean = false;
    @Input() maxSizeInMB: number = 5;
    @Input() acceptedTypes: string = 'image/*';

    @Output() imageUploaded = new EventEmitter<UploadResponse>();
    @Output() imagesUploaded = new EventEmitter<UploadResponse[]>();
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
        const files = Array.from(input.files || []);

        if (files.length === 0) return;

        // Validate files
        for (const file of files) {
            if (!this.validateFile(file)) {
                return;
            }
        }

        if (this.allowMultiple && files.length > 1) {
            this.uploadMultipleImages(files);
        } else {
            this.uploadSingleImage(files[0]);
        }
    }

    private validateFile(file: File): boolean {
        // Validate file type
        const allowedTypes = this.acceptedTypes.split(',').map(type => type.trim());
        const isValidType = allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                const baseType = type.replace('/*', '');
                return file.type.startsWith(baseType);
            }
            return file.type === type;
        });

        if (!isValidType) {
            this.snackBar.open('Please select a valid image file', 'Close', {
                duration: 3000
            });
            this.uploadError.emit('Invalid file type');
            return false;
        }

        // Validate file size
        if (!this.uploadService.validateFileSize(file, this.maxSizeInMB)) {
            this.snackBar.open(`File size must be less than ${this.maxSizeInMB}MB`, 'Close', {
                duration: 3000
            });
            this.uploadError.emit('File too large');
            return false;
        }

        return true;
    }

    private uploadSingleImage(file: File): void {
        this.isUploading = true;
        this.uploadService.resetProgress();

        this.uploadService.uploadImage(file).subscribe({
            next: (response) => {
                if (response) {
                    this.isUploading = false;
                    this.imageUploaded.emit(response);
                    this.snackBar.open('Image uploaded successfully!', 'Close', {
                        duration: 2000
                    });
                }
            },
            error: (error) => {
                this.isUploading = false;
                console.error('Image upload error:', error);
                this.snackBar.open('Failed to upload image. Please try again.', 'Close', {
                    duration: 3000
                });
                this.uploadError.emit(error.message || 'Upload failed');
            }
        });
    }

    private uploadMultipleImages(files: File[]): void {
        this.isUploading = true;
        this.uploadService.resetProgress();

        this.uploadService.uploadMultipleFiles(files).subscribe({
            next: (response) => {
                if (response) {
                    this.isUploading = false;
                    const uploadResponses = response.data.files.map(file => ({
                        success: true,
                        message: 'File uploaded successfully',
                        data: file
                    }));
                    this.imagesUploaded.emit(uploadResponses);
                    this.snackBar.open(`${response.data.count} images uploaded successfully!`, 'Close', {
                        duration: 2000
                    });
                }
            },
            error: (error) => {
                this.isUploading = false;
                console.error('Multiple images upload error:', error);
                this.snackBar.open('Failed to upload images. Please try again.', 'Close', {
                    duration: 3000
                });
                this.uploadError.emit(error.message || 'Upload failed');
            }
        });
    }
}
