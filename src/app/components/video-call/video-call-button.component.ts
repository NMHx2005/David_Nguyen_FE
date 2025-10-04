import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { VideoCallComponent } from './video-call.component';
import { VideoCallService } from '../../services/video-call.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-video-call-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <button mat-icon-button 
            [matMenuTriggerFor]="callMenu" 
            [disabled]="!canMakeCall"
            matTooltip="Start Video Call"
            class="video-call-button">
      <mat-icon>videocam</mat-icon>
    </button>

    <mat-menu #callMenu="matMenu" class="call-menu">
      <button mat-menu-item (click)="startVideoCall()" [disabled]="!canMakeCall">
        <mat-icon>videocam</mat-icon>
        <span>Start Video Call</span>
      </button>
      
      <button mat-menu-item (click)="openCallHistory()">
        <mat-icon>history</mat-icon>
        <span>Call History</span>
      </button>
      
      <button mat-menu-item (click)="openCallSettings()">
        <mat-icon>settings</mat-icon>
        <span>Call Settings</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .video-call-button {
      transition: all 0.3s ease;
    }

    .video-call-button:hover:not([disabled]) {
      background-color: rgba(33, 150, 243, 0.1);
      color: #2196F3;
    }

    .video-call-button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .call-menu {
      min-width: 180px;
    }

    .call-menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      width: 100%;
      text-align: left;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .call-menu button:hover:not([disabled]) {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .call-menu button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class VideoCallButtonComponent {
  @Input() channelId: string = '';
  @Input() receiverId: string = '';
  @Input() receiverName: string = '';
  @Input() canMakeCall: boolean = true;
  @Output() callStarted = new EventEmitter<void>();

  // Services
  videoCallService = inject(VideoCallService);
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  /**
   * Start video call
   */
  startVideoCall(): void {
    console.log('🔍 VideoCallButton - startVideoCall called');
    console.log('🔍 VideoCallButton - canMakeCall:', this.canMakeCall);
    console.log('🔍 VideoCallButton - receiverId:', this.receiverId);
    console.log('🔍 VideoCallButton - channelId:', this.channelId);
    console.log('🔍 VideoCallButton - receiverName:', this.receiverName);

    if (!this.canMakeCall || !this.receiverId) {
      this.snackBar.open('Cannot start call - missing required information', 'Close', { duration: 3000 });
      return;
    }

    // Check if user has camera and microphone permissions
    console.log('🔍 VideoCallButton - Checking media permissions...');
    this.checkMediaPermissions().then(hasPermissions => {
      console.log('🔍 VideoCallButton - Media permissions result:', hasPermissions);
      if (hasPermissions) {
        console.log('🔍 VideoCallButton - Opening video call dialog...');
        this.openVideoCallDialog();
      } else {
        console.log('🔍 VideoCallButton - Media permissions denied');
        this.snackBar.open('Camera and microphone permissions are required for video calls', 'Close', { duration: 5000 });
      }
    }).catch(error => {
      console.error('🔍 VideoCallButton - Error checking media permissions:', error);
      this.snackBar.open('Failed to check media permissions', 'Close', { duration: 3000 });
    });
  }

  /**
   * Check media permissions
   */
  private async checkMediaPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Open video call dialog
   */
  private openVideoCallDialog(): void {
    console.log('🔍 VideoCallButton - openVideoCallDialog called');
    console.log('🔍 VideoCallButton - Dialog data:', {
      channelId: this.channelId,
      receiverId: this.receiverId,
      receiverName: this.receiverName
    });

    try {
      const dialogRef = this.dialog.open(VideoCallComponent, {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        panelClass: 'video-call-dialog',
        data: {
          channelId: this.channelId,
          receiverId: this.receiverId,
          receiverName: this.receiverName
        },
        disableClose: true
      });

      console.log('🔍 VideoCallButton - Dialog opened successfully');

      dialogRef.componentInstance.channelId = this.channelId;
      dialogRef.componentInstance.receiverId = this.receiverId;
      dialogRef.componentInstance.receiverName = this.receiverName;

      dialogRef.componentInstance.callEnded.subscribe(() => {
        console.log('🔍 VideoCallButton - Call ended, closing dialog');
        dialogRef.close();
        this.callStarted.emit();
      });
    } catch (error) {
      console.error('🔍 VideoCallButton - Error opening dialog:', error);
      this.snackBar.open('Failed to open video call dialog', 'Close', { duration: 3000 });
    }
  }

  /**
   * Open call history
   */
  openCallHistory(): void {
    const dialogRef = this.dialog.open(VideoCallComponent, {
      width: '800px',
      height: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'call-history-dialog',
      data: {
        showHistoryOnly: true
      }
    });

    dialogRef.componentInstance.channelId = this.channelId;
  }

  /**
   * Open call settings
   */
  openCallSettings(): void {
    this.snackBar.open('Call settings coming soon', 'Close', { duration: 2000 });
  }
}