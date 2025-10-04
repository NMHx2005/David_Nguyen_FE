import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MessageReactionService, MessageReactionData } from '../../../services/message-reaction.service';
import { Subject, takeUntil } from 'rxjs';
import { SocketMessage } from '../../../services/socket.service';
import { AvatarService, AvatarInfo } from '../../../services/avatar.service';

@Component({
  selector: 'app-message-display',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="message-item" [class.own-message]="isOwnMessage">
      <!-- Avatar -->
      <div class="message-avatar" [matTooltip]="avatarInfo?.username || 'Unknown'">
        <img *ngIf="avatarInfo?.avatarUrl && !avatarLoading && !avatarError" 
             [src]="avatarInfo?.avatarUrl" 
             [alt]="avatarInfo?.username"
             class="avatar-image"
             (error)="onAvatarError()">
        
        <div *ngIf="avatarLoading" class="avatar-loading">
          <mat-spinner diameter="20"></mat-spinner>
        </div>
        
        <div *ngIf="!avatarInfo?.avatarUrl || avatarError" 
             class="default-avatar"
             [style.background-color]="avatarColor">
          {{ avatarInfo?.initials || 'U' }}
        </div>
      </div>

      <!-- Message Content -->
      <div class="message-content">
        <!-- Message Header -->
        <div class="message-header">
          <span class="username" *ngIf="!isOwnMessage">{{ message.username || 'Unknown' }}</span>
          <span class="timestamp">{{ formatTime(getMessageTimestamp()) }}</span>
        </div>
        
        <!-- Message Body -->
        <div class="message-body">
          <!-- Text Message -->
          <div *ngIf="message.type === 'text'" class="message-text">
            <p>{{ message.text }}</p>
          </div>
          
          <!-- Image Message -->
          <div *ngIf="message.type === 'image'" class="message-image">
            <img [src]="message.imageUrl" 
                 [alt]="message.text || 'Image'"
                  (click)="openImageModal(message.imageUrl!)"
                 (error)="onImageError()"
                 class="image-content">
            <div *ngIf="message.text" class="image-caption">{{ message.text }}</div>
          </div>
          
          <!-- File Message -->
          <div *ngIf="message.type === 'file'" class="message-file">
            <div class="file-content">
              <mat-icon class="file-icon">{{ getFileIcon(message.fileName || message.text) }}</mat-icon>
              <div class="file-info">
                <div class="file-name" [matTooltip]="message.fileName || message.text">
                  {{ message.fileName || message.text }}
                </div>
                <div class="file-details">
                  <span class="file-size" *ngIf="message.fileSize">
                    {{ formatFileSize(message.fileSize) }}
                  </span>
                  <span class="file-type">{{ getFileType(message.fileName || message.text) }}</span>
                </div>
                <div class="file-actions">
                  <button mat-icon-button 
                          (click)="downloadFile(message.fileUrl!, message.fileName || message.text)"
                          matTooltip="Download file"
                          class="file-action-button">
                    <mat-icon>download</mat-icon>
                  </button>
                  <button mat-icon-button 
                          (click)="previewFile(message)"
                          matTooltip="Preview file"
                          class="file-action-button"
                          *ngIf="canPreview(message)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- System Message (commented out - not in type definition) -->
          <!-- <div *ngIf="message.type === 'system'" class="message-system">
            <mat-icon>info</mat-icon>
            <span>{{ message.text }}</span>
          </div> -->
        
        <!-- Message Reactions -->
        <div class="message-reactions" *ngIf="showReactions && getMessageReactions().length > 0">
          <mat-chip *ngFor="let reaction of getMessageReactions()" 
                    [class.user-reacted]="hasUserReacted(reaction.reaction)"
                    (click)="reactToMessage(reaction.reaction)"
                    class="reaction-chip">
            <span class="reaction-emoji">{{ reaction.reaction }}</span>
            <span class="reaction-count">{{ reaction.count }}</span>
          </mat-chip>
        </div>

        <!-- Message Actions -->
        <div class="message-actions" *ngIf="showActions">
          <!-- React Button -->
          <button mat-icon-button 
                  matTooltip="React to message"
                  [matMenuTriggerFor]="reactionsMenu"
                  class="action-button"
                  *ngIf="showReactions">
            <mat-icon>emoji_emotions</mat-icon>
          </button>
          
          <!-- Reply Button -->
          <button mat-icon-button 
                  matTooltip="Reply to message"
                  (click)="replyToMessage()"
                  class="action-button"
                  *ngIf="showReply">
            <mat-icon>reply</mat-icon>
          </button>
          
          <!-- More Options Menu -->
          <button mat-icon-button 
                  matTooltip="More options"
                  [matMenuTriggerFor]="moreOptionsMenu"
                  class="action-button"
                  *ngIf="showMoreOptions">
            <mat-icon>more_horiz</mat-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Reactions Menu -->
    <mat-menu #reactionsMenu="matMenu" class="reactions-menu">
      <div class="reactions-grid">
        <button mat-menu-item 
                *ngFor="let reaction of availableReactions"
                (click)="reactToMessage(reaction)"
                class="reaction-option">
          <span class="reaction-emoji">{{ reaction }}</span>
        </button>
      </div>
    </mat-menu>

    <!-- More Options Menu -->
    <mat-menu #moreOptionsMenu="matMenu" class="more-options-menu">
      <button mat-menu-item (click)="copyMessage()">
        <mat-icon>content_copy</mat-icon>
        <span>Copy message</span>
      </button>
      
      <button mat-menu-item (click)="replyToMessage()" *ngIf="showReply">
        <mat-icon>reply</mat-icon>
        <span>Reply</span>
      </button>
      
      <button mat-menu-item (click)="editMessage()" *ngIf="isOwnMessage">
        <mat-icon>edit</mat-icon>
        <span>Edit message</span>
      </button>
      
      <button mat-menu-item (click)="deleteMessage()" *ngIf="isOwnMessage" class="delete-option">
        <mat-icon>delete</mat-icon>
        <span>Delete message</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-start;
      transition: background-color 0.2s ease;
      padding: 8px;
      border-radius: 8px;
      max-width: 70%;
      margin-right: auto;
    }

    .message-item:not(.own-message) {
      margin-left: 0;
      margin-right: auto;
    }

    .message-item:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .message-item.own-message {
      flex-direction: row-reverse;
      justify-content: flex-end;
      align-self: flex-end;
      max-width: 70%;
      margin-left: auto;
      margin-right: 0;
    }

    .message-item.own-message .message-avatar {
      order: 2;
    }

    .message-item.own-message .message-content {
      order: 1;
    }

    .message-item.own-message .message-content {
      background-color: #2196f3;
      color: white;
      margin-left: auto;
      margin-right: 0;
    }

    .message-item:not(.own-message) .message-avatar {
      order: 1;
    }

    .message-item:not(.own-message) .message-content {
      order: 2;
    }

    .message-item.own-message .message-content .username {
      color: rgba(255, 255, 255, 0.9);
    }

    .message-item.own-message .message-content .timestamp {
      color: rgba(255, 255, 255, 0.7);
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      position: relative;
      cursor: pointer;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e0e0e0;
    }

    .avatar-loading {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 50%;
    }

    .default-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      color: white;
      border: 2px solid #e0e0e0;
    }

    .message-content {
      background-color: #f5f5f5;
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 70%;
      min-width: 120px;
      position: relative;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .message-item.own-message .message-header {
      justify-content: flex-end;
    }

    .message-item.own-message .timestamp {
      color: rgba(255, 255, 255, 0.7);
    }

    .message-item.own-message .message-header .timestamp {
      margin-left: 0;
    }

    .message-item.own-message .message-header {
      gap: 0;
    }

    .message-item.own-message .message-header .timestamp {
      margin-right: 0;
    }

    .message-item.own-message .message-header .timestamp {
      margin-left: 0;
    }

    .username {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .timestamp {
      font-size: 12px;
      color: #666;
      opacity: 0.8;
    }

    .message-body {
      word-wrap: break-word;
    }

    .message-text p {
      margin: 0;
      line-height: 1.4;
      font-size: 14px;
    }

    .message-image {
      margin-top: 4px;
    }

    .image-content {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .image-content:hover {
      transform: scale(1.02);
    }

    .image-caption {
      margin-top: 8px;
      font-size: 13px;
      color: #666;
      font-style: italic;
    }

    .message-file {
      margin-top: 4px;
    }

    .file-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      transition: all 0.2s ease;
    }

    .file-content:hover {
      background-color: rgba(0, 0, 0, 0.08);
      border-color: #2196f3;
    }

    .file-icon {
      color: #666;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .file-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-name {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .file-details {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .file-size {
      font-size: 12px;
      color: #666;
    }

    .file-type {
      font-size: 11px;
      color: #999;
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }

    .file-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .file-action-button {
      width: 32px;
      height: 32px;
      min-width: 32px;
    }

    .file-action-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .message-system {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: rgba(33, 150, 243, 0.1);
      border-radius: 8px;
      font-size: 13px;
      color: #2196f3;
    }

    .message-system mat-icon {
      font-size: 16px;
    }

    .message-actions {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .message-item:hover .message-actions {
      opacity: 1;
    }

    .action-button {
      width: 32px;
      height: 32px;
      min-width: 32px;
    }

    .action-button mat-icon {
      font-size: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .message-content {
        max-width: 85%;
      }
      
      .image-content {
        max-width: 150px;
        max-height: 150px;
      }
    }

    /* Message Reactions */
    .message-reactions {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .reaction-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 16px;
      background-color: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 12px;
    }

    .reaction-chip:hover {
      background-color: rgba(0, 0, 0, 0.1);
      transform: scale(1.05);
    }

    .reaction-chip.user-reacted {
      background-color: #e3f2fd;
      border-color: #2196f3;
    }

    .reaction-emoji {
      font-size: 14px;
    }

    .reaction-count {
      font-weight: 500;
      color: #666;
    }

    /* Message Actions */
    .message-actions {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .message-item:hover .message-actions {
      opacity: 1;
    }

    .action-button {
      width: 32px;
      height: 32px;
      min-width: 32px;
    }

    .action-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Reactions Menu */
    .reactions-menu {
      .reactions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        padding: 8px;
      }

      .reaction-option {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        min-width: 40px;
        min-height: 40px;
      }

      .reaction-option:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .reaction-option .reaction-emoji {
        font-size: 20px;
      }
    }

    /* More Options Menu */
    .more-options-menu {
      .delete-option {
        color: #f44336;
      }

      .delete-option:hover {
        background-color: rgba(244, 67, 54, 0.1);
      }
    }
  `]
})
export class MessageDisplayComponent implements OnInit, OnDestroy {
  @Input() message!: SocketMessage;
  @Input() currentUserId!: string;
  @Input() showActions = true;
  @Input() showReactions = true;
  @Input() showReply = true;
  @Input() showMoreOptions = true;

  @Output() onReact = new EventEmitter<{ messageId: string; reaction: string }>();
  @Output() onReply = new EventEmitter<SocketMessage>();
  @Output() onEdit = new EventEmitter<SocketMessage>();
  @Output() onDelete = new EventEmitter<SocketMessage>();
  @Output() onCopy = new EventEmitter<string>();

  avatarInfo: AvatarInfo | null = null;
  avatarLoading = false;
  avatarError = false;
  avatarColor = '#667eea';

  // Available reactions
  availableReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Message reactions (mock data - in real app, this would come from API)
  messageReactions: { [key: string]: number } = {};
  messageReactionData: MessageReactionData | null = null;
  reactionsLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private avatarService: AvatarService,
    private messageReactionService: MessageReactionService
  ) { }

  ngOnInit(): void {
    this.loadAvatar();
    this.loadMessageReactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isOwnMessage(): boolean {
    const isOwn = this.message.userId === this.currentUserId;
    return isOwn;
  }

  private loadAvatar(): void {
    if (!this.message.userId || !this.message.username) return;

    this.avatarLoading = true;
    this.avatarError = false;

    this.avatarService.getAvatarInfo(this.message.userId, this.message.username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (avatarInfo: AvatarInfo) => {
          this.avatarInfo = avatarInfo;
          this.avatarColor = this.avatarService.getDefaultAvatarColor(this.message.username);
          this.avatarLoading = false;
        },
        error: () => {
          this.avatarError = true;
          this.avatarLoading = false;
          this.avatarColor = this.avatarService.getDefaultAvatarColor(this.message.username);
        }
      });
  }

  onAvatarError(): void {
    this.avatarError = true;
    this.avatarLoading = false;
  }

  onImageError(): void {
    console.error('Failed to load image:', this.message.imageUrl);
  }

  getMessageTimestamp(): number {
    return new Date(this.message.createdAt).getTime();
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'zip':
      case 'rar':
        return 'archive';
      case 'mp3':
      case 'wav':
        return 'audiotrack';
      case 'mp4':
      case 'avi':
        return 'video_file';
      default:
        return 'attach_file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }



  /**
   * Get file type from filename
   */
  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? extension.toUpperCase() : 'FILE';
  }

  /**
   * Check if file can be previewed
   */
  canPreview(message: SocketMessage): boolean {
    if (!message.fileUrl) return false;

    const extension = (message.fileName || message.text).split('.').pop()?.toLowerCase();
    const previewableTypes = ['pdf', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
    return previewableTypes.includes(extension || '');
  }

  /**
   * Download file
   */
  downloadFile(fileUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Preview file
   */
  previewFile(message: SocketMessage): void {
    if (!message.fileUrl) return;

    const extension = (message.fileName || message.text).split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        // Open PDF in new tab
        window.open(message.fileUrl, '_blank');
        break;
      case 'txt':
        // Open text file in new tab
        window.open(message.fileUrl, '_blank');
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        // Open image in new tab
        window.open(message.fileUrl, '_blank');
        break;
      default:
        // For other file types, just download
        this.downloadFile(message.fileUrl, message.fileName || message.text);
    }
  }

  /**
   * Open image in modal (simple implementation)
   */
  openImageModal(imageUrl: string): void {
    // Simple implementation - open image in new tab
    // In a real app, you might want to use a proper modal component
    window.open(imageUrl, '_blank');
  }

  /**
   * React to message
   */
  reactToMessage(reaction: string): void {
    this.onReact.emit({ messageId: this.message._id, reaction });
  }

  /**
   * Reply to message
   */
  replyToMessage(): void {
    this.onReply.emit(this.message);
  }

  /**
   * Edit message
   */
  editMessage(): void {
    this.onEdit.emit(this.message);
  }

  /**
   * Delete message
   */
  deleteMessage(): void {
    this.onDelete.emit(this.message);
  }

  /**
   * Copy message text
   */
  copyMessage(): void {
    const textToCopy = this.message.text || this.message.fileName || '';
    this.onCopy.emit(textToCopy);

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('Message copied to clipboard');
      });
    }
  }

  /**
   * Get reaction count for a specific reaction
   */
  getReactionCount(reaction: string): number {
    return this.messageReactions[reaction] || 0;
  }

  /**
   * Check if current user has reacted with specific reaction
   */
  hasUserReacted(reaction: string): boolean {
    if (this.messageReactionData?.userReactions?.[reaction]) {
      return this.messageReactionData.userReactions[reaction].includes(this.currentUserId);
    }
    return false;
  }

  /**
   * Get all reactions for this message
   */
  getMessageReactions(): Array<{ reaction: string; count: number }> {
    if (this.messageReactionData?.reactionCounts) {
      return Object.entries(this.messageReactionData.reactionCounts)
        .filter(([_, count]) => count > 0)
        .map(([reaction, count]) => ({ reaction, count }));
    }

    // Fallback to mock data
    return Object.entries(this.messageReactions)
      .filter(([_, count]) => count > 0)
      .map(([reaction, count]) => ({ reaction, count }));
  }

  /**
   * Load message reactions from API
   */
  loadMessageReactions(): void {
    if (!this.message._id) return;

    this.reactionsLoading = true;
    this.messageReactionService.getMessageReactions(this.message._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.messageReactionData = response.data;
            this.messageReactions = response.data.reactionCounts;
          }
        },
        error: (error) => {
          console.error('Failed to load message reactions:', error);
          // Keep mock data as fallback
        },
        complete: () => {
          this.reactionsLoading = false;
        }
      });
  }
}
