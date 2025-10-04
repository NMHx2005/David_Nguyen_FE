import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="image-upload-container">
      <input
        #fileInput
        type="file"
        accept="image/*"
        (change)="onFileSelected($event)"
        style="display: none"
        [multiple]="multiple"
      />
      
      <button
        mat-icon-button
        (click)="fileInput.click()"
        [disabled]="uploading"
        matTooltip="{{ tooltip || 'Upload image' }}"
        class="upload-button">
        <mat-icon>{{ icon || 'image' }}</mat-icon>
      </button>
      
      <div *ngIf="uploading" class="upload-progress">
        <mat-progress-bar mode="determinate" [value]="uploadProgressValue"></mat-progress-bar>
        <span class="progress-text">{{ uploadProgressValue }}%</span>
      </div>
      
      <div *ngIf="previewUrl && !uploading" class="image-preview">
        <img [src]="previewUrl" [alt]="'Preview'" class="preview-image">
        <button
          mat-icon-button
          (click)="removeImage()"
          class="remove-button"
          matTooltip="Remove image">
          <mat-icon>close</mat-icon>
        </button>
      </div>
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
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 16px;
      background-color: #fafafa;
      transition: all 0.3s ease;
    }
    
    .upload-button:hover:not(:disabled) {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }
    
    .upload-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .upload-progress {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .progress-text {
      font-size: 12px;
      text-align: center;
      color: #666;
    }
    
    .image-preview {
      position: relative;
      display: inline-block;
    }
    
    .preview-image {
      max-width: 100px;
      max-height: 100px;
      border-radius: 8px;
      object-fit: cover;
    }
    
    .remove-button {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #f44336;
      color: white;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    
    .remove-button:hover {
      background-color: #d32f2f;
    }
  `]
})
export class ImageUploadComponent {
  @Input() multiple = false;
  @Input() tooltip = '';
  @Input() icon = '';
  @Input() maxSize = 5 * 1024 * 1024; // 5MB default
  @Input() allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  @Output() imageSelected = new EventEmitter<File>();
  @Output() imagesSelected = new EventEmitter<File[]>();
  @Output() uploadProgress = new EventEmitter<number>();
  @Output() uploadComplete = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  uploading = false;
  uploadProgressValue = 0;
  previewUrl: string | null = null;

  constructor(private snackBar: MatSnackBar) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    if (this.multiple) {
      this.handleMultipleFiles(Array.from(files));
    } else {
      this.handleSingleFile(files[0]);
    }
  }

  private handleSingleFile(file: File): void {
    if (!this.validateFile(file)) return;

    this.previewUrl = URL.createObjectURL(file);
    this.imageSelected.emit(file);
  }

  private handleMultipleFiles(files: File[]): void {
    const validFiles = files.filter(file => this.validateFile(file));

    if (validFiles.length === 0) return;

    if (validFiles.length === 1) {
      this.previewUrl = URL.createObjectURL(validFiles[0]);
    }

    this.imagesSelected.emit(validFiles);
  }

  private validateFile(file: File): boolean {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      this.snackBar.open(`File type ${file.type} is not allowed`, 'Close', { duration: 3000 });
      return false;
    }

    // Check file size
    if (file.size > this.maxSize) {
      this.snackBar.open(`File size must be less than ${this.maxSize / (1024 * 1024)}MB`, 'Close', { duration: 3000 });
      return false;
    }

    return true;
  }

  removeImage(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  setUploading(uploading: boolean): void {
    this.uploading = uploading;
  }

  setProgress(progress: number): void {
    this.uploadProgressValue = progress;
    this.uploadProgress.emit(progress);
  }

  setPreviewUrl(url: string): void {
    this.previewUrl = url;
  }

  reset(): void {
    this.removeImage();
    this.uploading = false;
    this.uploadProgressValue = 0;
  }
}