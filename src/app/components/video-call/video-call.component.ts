import { Component, OnInit, OnDestroy, inject, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, takeUntil, interval } from 'rxjs';
import { VideoCallService, VideoCall, CallQualityMetrics } from '../../services/video-call.service';
import { WebRTCService, WebRTCStats } from '../../services/webrtc.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../auth/auth.service';
import { PeerJSService, CallEvent } from '../../services/peerjs.service';
import { CallQualityIndicatorComponent } from './call-quality-indicator.component';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatCheckboxModule,
    CallQualityIndicatorComponent,
  ],
  template: `
    <div class="video-call-container" [class.active-call]="isInCall">
      <!-- Incoming Call Modal -->
      <div *ngIf="incomingCall" class="incoming-call-overlay">
        <mat-card class="incoming-call-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="call-icon">videocam</mat-icon>
              Incoming Video Call
            </mat-card-title>
          </mat-card-header>
        <mat-card-content>
            <div class="caller-info">
              <div class="caller-avatar">
                <mat-icon>account_circle</mat-icon>
              </div>
              <div class="caller-details">
                <h3>{{ incomingCall.callerName }}</h3>
                <p>is calling you...</p>
              </div>
            </div>
            <div class="call-actions">
              <button mat-fab color="warn" (click)="rejectCall()" matTooltip="Reject Call">
                <mat-icon>call_end</mat-icon>
              </button>
              <button mat-fab color="primary" (click)="answerCall()" matTooltip="Answer Call">
                <mat-icon>videocam</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Active Call Interface -->
      <div *ngIf="isInCall" class="active-call-interface">
        <!-- Call Quality Indicator -->
        <app-call-quality-indicator></app-call-quality-indicator>
        
        <div class="call-header">
          <div class="call-info">
            <h3>{{ currentCall?.receiverName || currentCall?.callerName }}</h3>
            <p>{{ formatCallDuration() }}</p>
          </div>
          <div class="call-controls">
            <button mat-icon-button (click)="toggleMute()" [class.muted]="isMuted" matTooltip="Toggle Microphone">
              <mat-icon>{{ isMuted ? 'mic_off' : 'mic' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleCamera()" [class.camera-off]="!isCameraOn" matTooltip="Toggle Camera">
              <mat-icon>{{ isCameraOn ? 'videocam' : 'videocam_off' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleScreenShare()" [class.screen-sharing]="isScreenSharing" matTooltip="Toggle Screen Share">
              <mat-icon>screen_share</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleRecording()" [class.recording]="isRecording" matTooltip="Toggle Recording">
              <mat-icon>{{ isRecording ? 'stop' : 'fiber_manual_record' }}</mat-icon>
            </button>
            <button mat-fab color="warn" (click)="endCall()" matTooltip="End Call">
              <mat-icon>call_end</mat-icon>
            </button>
          </div>
        </div>

        <div class="video-container">
          <div class="remote-video">
            <video #remoteVideo autoplay playsinline></video>
            <div *ngIf="!isRemoteVideoActive" class="no-video-placeholder">
              <mat-icon>person</mat-icon>
              <p>{{ currentCall?.receiverName || currentCall?.callerName }}</p>
            </div>
          </div>
          
          <div class="local-video" [class.hidden]="!isCameraOn">
            <video #localVideo autoplay playsinline muted></video>
            <div *ngIf="!isCameraOn" class="video-placeholder">
              <mat-icon>videocam_off</mat-icon>
              <p>Camera is off</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Call Initiation Interface -->
      <div *ngIf="!isInCall && !incomingCall && !showHistoryOnly" class="call-initiation">
        <div class="initiation-content">
          <div class="caller-info">
            <div class="caller-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="caller-details">
              <h2>{{ receiverName || 'Unknown User' }}</h2>
              <p>Ready to start video call</p>
            </div>
          </div>
          
          <div class="initiation-actions">
            <button mat-fab color="primary" (click)="initiateCall()" matTooltip="Start Video Call">
              <mat-icon>videocam</mat-icon>
            </button>
            <button mat-fab color="warn" (click)="closeDialog()" matTooltip="Cancel">
              <mat-icon>call_end</mat-icon>
            </button>
          </div>
          
          <div class="call-settings">
            <mat-checkbox [(ngModel)]="isCameraOn" (change)="toggleCamera()">
              Camera
            </mat-checkbox>
            <mat-checkbox [(ngModel)]="isMuted" (change)="toggleMute()">
              Microphone
            </mat-checkbox>
          </div>
        </div>
      </div>

      <!-- Call History -->
      <div *ngIf="!isInCall && !incomingCall && showHistoryOnly" class="call-history">
        <div class="history-header">
          <h2>Call History</h2>
          <button mat-icon-button (click)="refreshCallHistory()" matTooltip="Refresh History">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <div *ngIf="isLoadingHistory" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading call history...</p>
        </div>

        <div *ngIf="!isLoadingHistory && callHistory.length === 0" class="no-history">
          <mat-icon>call_end</mat-icon>
          <h3>No call history</h3>
          <p>Your video call history will appear here</p>
        </div>

        <div *ngIf="!isLoadingHistory && callHistory.length > 0" class="history-list">
          <mat-card *ngFor="let call of callHistory" class="call-item">
            <mat-card-content>
              <div class="call-info">
                <div class="call-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div class="call-details">
                  <h4>{{ getCallParticipantName(call) }}</h4>
                  <p>{{ formatCallTime(call.startTime) }}</p>
                  <mat-chip [class]="'status-chip ' + call.status">
                    {{ getStatusLabel(call.status) }}
                  </mat-chip>
                </div>
              </div>
              <div class="call-actions">
                <span class="call-duration" *ngIf="call.duration">
                  {{ formatDuration(call.duration) }}
                </span>
                <button mat-icon-button (click)="initiateCall(call)" matTooltip="Call Again">
                  <mat-icon>videocam</mat-icon>
                </button>
          </div>
        </mat-card-content>
      </mat-card>
        </div>
      </div>
    </div>
    `,
  styles: [`
    .video-call-container {
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      position: relative;
    }

    .active-call {
      background: #000;
    }

    /* Incoming Call Overlay */
    .incoming-call-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .incoming-call-card {
      max-width: 400px;
      width: 90%;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .call-icon {
      color: #2196F3;
      margin-right: 8px;
    }

    .caller-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .caller-avatar {
      font-size: 48px;
      color: #666;
    }

    .caller-details h3 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .caller-details p {
      margin: 0;
      color: #666;
    }

    .call-actions {
      display: flex;
      justify-content: center;
      gap: 24px;
    }

    /* Active Call Interface */
    .active-call-interface {
      width: 100%;
      height: 100vh;
      background: #000;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .call-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
    }

    .call-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
    }

    .call-info p {
      margin: 0;
      color: #ccc;
      font-size: 0.9rem;
    }

    .call-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .call-controls button {
      color: white;
    }

    .call-controls button.muted {
      background: #f44336;
    }

    .call-controls button.camera-off {
      background: #f44336;
    }

    .call-controls button.screen-sharing {
      background: #4CAF50;
    }

    .call-controls button.recording {
      background: #f44336;
      animation: recording-pulse 1.5s infinite;
    }

    @keyframes recording-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .video-container {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remote-video {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remote-video video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ccc;
      font-size: 48px;
    }

    .no-video-placeholder p {
      margin-top: 16px;
      font-size: 1.2rem;
    }

    .local-video {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 200px;
      height: 150px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #333;
      transition: opacity 0.3s ease;
    }

    .local-video.hidden {
      opacity: 0;
    }

    .local-video video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }

    .video-placeholder mat-icon {
      font-size: 32px;
      margin-bottom: 4px;
      opacity: 0.7;
    }

    .video-placeholder p {
      margin: 0;
      opacity: 0.8;
    }

    /* Call Initiation Interface */
    .call-initiation {
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .initiation-content {
      text-align: center;
      max-width: 400px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .initiation-content .caller-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
    }

    .initiation-content .caller-avatar {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.9;
    }

    .initiation-content .caller-details h2 {
      margin: 0 0 8px 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .initiation-content .caller-details p {
      margin: 0;
      opacity: 0.8;
      font-size: 1.1rem;
    }

    .initiation-actions {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
    }

    .initiation-actions button {
      width: 80px;
      height: 80px;
      font-size: 36px;
    }

    .call-settings {
      display: flex;
      justify-content: center;
      gap: 30px;
      color: white;
    }

    .call-settings mat-checkbox {
      color: white;
    }

    .call-settings ::ng-deep .mat-checkbox-frame {
      border-color: rgba(255, 255, 255, 0.7);
    }

    .call-settings ::ng-deep .mat-checkbox-checked .mat-checkbox-background {
      background-color: rgba(255, 255, 255, 0.9);
    }

    .call-settings ::ng-deep .mat-checkbox-checkmark {
      color: #667eea;
    }

    /* Call History */
    .call-history {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .history-header h2 {
      margin: 0;
      color: #333;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .no-history {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-history mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-history h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-history p {
      margin: 0;
      color: #666;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .call-item {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .call-item mat-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .call-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .call-avatar {
      font-size: 40px;
      color: #666;
    }

    .call-details h4 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .call-details p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .status-chip {
      font-size: 12px;
      height: 24px;
    }

    .status-chip.initiated {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-chip.answered {
      background: #e8f5e8;
      color: #4caf50;
    }

    .status-chip.rejected {
      background: #ffebee;
      color: #f44336;
    }

    .status-chip.ended {
      background: #f3e5f5;
      color: #9c27b0;
    }

    .status-chip.failed {
      background: #fafafa;
      color: #666;
    }

    .call-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .call-duration {
      color: #666;
      font-size: 0.9rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .call-history {
        padding: 16px;
      }

      .local-video {
        width: 150px;
        height: 112px;
        top: 16px;
        right: 16px;
      }

      .call-header {
        padding: 12px 16px;
      }

      .call-controls {
        gap: 8px;
      }

      .call-controls button {
        width: 40px;
        height: 40px;
      }
    }
    `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @Input() channelId: string = '';
  @Input() receiverId: string = '';
  @Input() receiverName: string = '';
  @Output() callEnded = new EventEmitter<void>();

  @ViewChild('localVideo', { static: false }) localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideoRef!: ElementRef<HTMLVideoElement>;

  private destroy$ = new Subject<void>();

  // Services
  videoCallService = inject(VideoCallService);
  webrtcService = inject(WebRTCService);
  socketService = inject(SocketService);
  authService = inject(AuthService);
  peerJSService = inject(PeerJSService);
  snackBar = inject(MatSnackBar);

  // Component state
  isInCall = false;
  incomingCall: VideoCall | null = null;
  currentCall: VideoCall | null = null;
  callHistory: VideoCall[] = [];
  isLoadingHistory = false;
  showHistoryOnly = false;

  // Call controls
  isMuted = false;
  isCameraOn = true;
  isScreenSharing = false;
  isRecording = false;
  isRemoteVideoActive = false;

  // Call duration
  callStartTime: Date | null = null;
  callDuration = 0;
  private durationInterval: any;

  // WebRTC
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  ngOnInit(): void {
    this.loadCallHistory();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    console.log('🔍 VideoCallComponent - Component destroying');
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCallTimer();
    this.endCall();
    this.cleanupCall();
  }

  /**
   * Load call history
   */
  private loadCallHistory(): void {
    this.isLoadingHistory = true;

    this.videoCallService.getCallHistory({ limit: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.callHistory = response.data;
          }
          this.isLoadingHistory = false;
        },
        error: (error) => {
          console.error('Error loading call history:', error);
          this.isLoadingHistory = false;
        }
      });
  }

  /**
   * Refresh call history
   */
  refreshCallHistory(): void {
    this.loadCallHistory();
    this.snackBar.open('Call history refreshed', 'Close', { duration: 2000 });
  }

  /**
   * Setup socket listeners for video call events
   */
  private setupSocketListeners(): void {
    // Listen for incoming calls
    this.socketService.getSocket()?.on('video_call_incoming', (call: VideoCall) => {
      this.incomingCall = call;
    });

    // Listen for call answered
    this.socketService.getSocket()?.on('video_call_answered', (call: VideoCall) => {
      this.incomingCall = null;
      this.startCall(call);
    });

    // Listen for call rejected
    this.socketService.getSocket()?.on('video_call_rejected', (call: VideoCall) => {
      this.incomingCall = null;
      this.snackBar.open('Call was rejected', 'Close', { duration: 3000 });
    });

    // Listen for call ended
    this.socketService.getSocket()?.on('video_call_ended', (call: VideoCall) => {
      this.endCall();
    });
  }


  /**
   * Answer incoming call
   */
  answerCall(): void {
    if (!this.incomingCall) return;

    this.videoCallService.answerCall(this.incomingCall._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.startCall(response.data);
            this.incomingCall = null;
          }
        },
        error: (error) => {
          console.error('Error answering call:', error);
          this.snackBar.open('Failed to answer call', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Reject incoming call
   */
  rejectCall(): void {
    if (!this.incomingCall) return;

    this.videoCallService.rejectCall(this.incomingCall._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.incomingCall = null;
          this.snackBar.open('Call rejected', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error rejecting call:', error);
          this.incomingCall = null;
        }
      });
  }

  /**
   * End current call
   */
  endCall(): void {
    // Perform immediate cleanup for better performance
    this.performImmediateCleanup();

    // End PeerJS call
    this.peerJSService.endCall();

    // Handle backend call end
    if (this.currentCall) {
      this.videoCallService.endCall(this.currentCall._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.performFinalCleanup();
            this.snackBar.open('Call ended', 'Close', { duration: 2000 });
          },
          error: (error) => {
            this.performFinalCleanup();
          }
        });
    } else {
      this.performFinalCleanup();
    }
  }

  /**
   * Perform immediate cleanup operations
   */
  private performImmediateCleanup(): void {
    // Stop timer immediately
    this.stopCallTimer();

    // Clean up local stream
    if ((this as any).localStream) {
      (this as any).localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      (this as any).localStream = null;
    }

    // Update UI state immediately
    this.isInCall = false;
    this.isCameraOn = false;
    this.isMuted = false;
  }

  /**
   * Perform final cleanup operations
   */
  private performFinalCleanup(): void {
    // Use requestIdleCallback for non-critical cleanup
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.cleanupCall();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.cleanupCall();
      }, 0);
    }
  }

  /**
   * Start call with WebRTC
   */
  private async startCall(call: VideoCall): Promise<void> {
    this.isInCall = true;
    this.currentCall = call;
    this.callStartTime = new Date();

    try {
      // Create peer connection using WebRTCService
      this.peerConnection = this.webrtcService.createPeerConnection();

      // Get user media using WebRTCService
      this.localStream = await this.webrtcService.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Start quality monitoring
      this.webrtcService.startQualityMonitoring();

      // Setup WebRTC event listeners
      this.setupWebRTCEventListeners();

      // Start call duration timer
      this.startCallDurationTimer();

      // Start recording if enabled
      if (this.isRecording) {
        await this.startRecording();
      }

    } catch (error) {
      console.error('Error starting call:', error);
      this.snackBar.open('Failed to start call - check camera and microphone permissions', 'Close', { duration: 5000 });
      this.endCall();
    }
  }

  /**
   * Setup WebRTC event listeners
   */
  private setupWebRTCEventListeners(): void {
    // Listen for remote stream
    this.webrtcService.onEvent('remote-stream', (stream: MediaStream) => {
      this.remoteStream = stream;
      this.isRemoteVideoActive = true;
    });

    // Listen for ICE candidates
    this.webrtcService.onEvent('ice-candidate', (candidate: RTCIceCandidate) => {
      this.socketService.getSocket()?.emit('video_call_ice_candidate', {
        callId: this.currentCall?._id,
        candidate: candidate
      });
    });

    // Listen for quality updates
    this.webrtcService.onEvent('quality-update', (stats: WebRTCStats) => {
      this.updateCallQuality(stats);
    });

    // Listen for screen share events
    this.webrtcService.onEvent('screen-share-started', (stream: MediaStream) => {
      this.isScreenSharing = true;
      this.snackBar.open('Screen sharing started', 'Close', { duration: 2000 });
    });

    this.webrtcService.onEvent('screen-share-ended', () => {
      this.isScreenSharing = false;
      this.snackBar.open('Screen sharing ended', 'Close', { duration: 2000 });
    });

    // Listen for recording events
    this.webrtcService.onEvent('recording-complete', (blob: Blob) => {
      this.handleRecordingComplete(blob);
    });
  }

  /**
   * Start call duration timer
   */
  private startCallDurationTimer(): void {
    this.durationInterval = setInterval(() => {
      if (this.callStartTime) {
        this.callDuration = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
      }
    }, 1000);
  }

  /**
   * Cleanup call resources
   */
  private cleanupCall(): void {
    // Reset call state
    this.isInCall = false;
    this.currentCall = null;
    this.callStartTime = null;
    this.callDuration = 0;

    // Clear timer
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }

    // Cleanup WebRTC resources
    this.webrtcService.cleanup();

    // Reset media states
    this.remoteStream = null;
    this.isRemoteVideoActive = false;
    this.isMuted = false;
    this.isCameraOn = true;
    this.isScreenSharing = false;
    this.isRecording = false;

    // Emit events and refresh history
    this.callEnded.emit();

    // Use requestIdleCallback for non-critical operations
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.loadCallHistory();
      });
    } else {
      setTimeout(() => {
        this.loadCallHistory();
      }, 100);
    }
  }

  /**
   * Toggle microphone
   */
  toggleMute(): void {
    const localStream = (this as any).localStream;
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      this.isMuted = !audioTracks[0]?.enabled;
      console.log('🔍 VideoCallComponent - Microphone toggled:', this.isMuted ? 'muted' : 'unmuted');
    } else {
      this.isMuted = !this.isMuted;
      console.log('🔍 VideoCallComponent - Microphone toggled (no stream):', this.isMuted ? 'muted' : 'unmuted');
    }
  }

  /**
   * Toggle camera
   */
  toggleCamera(): void {
    const localStream = (this as any).localStream;
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      this.isCameraOn = videoTracks[0]?.enabled || false;
      console.log('🔍 VideoCallComponent - Camera toggled:', this.isCameraOn ? 'on' : 'off');
    } else {
      this.isCameraOn = !this.isCameraOn;
      console.log('🔍 VideoCallComponent - Camera toggled (no stream):', this.isCameraOn ? 'on' : 'off');
    }
  }

  /**
   * Toggle screen sharing
   */
  async toggleScreenShare(): Promise<void> {
    try {
      if (!this.isScreenSharing) {
        await this.webrtcService.switchToScreenShare();
      } else {
        await this.webrtcService.switchToCamera();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      this.snackBar.open('Failed to toggle screen sharing', 'Close', { duration: 3000 });
    }
  }

  /**
   * Toggle recording
   */
  async toggleRecording(): Promise<void> {
    try {
      if (!this.isRecording) {
        await this.startRecording();
      } else {
        this.stopRecording();
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      this.snackBar.open('Failed to toggle recording', 'Close', { duration: 3000 });
    }
  }

  /**
   * Start recording
   */
  private async startRecording(): Promise<void> {
    try {
      await this.webrtcService.startRecording();
      this.isRecording = true;

      if (this.currentCall) {
        this.videoCallService.startRecording(this.currentCall._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open('Recording started', 'Close', { duration: 2000 });
              }
            },
            error: (error) => {
              console.error('Error starting recording:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      this.snackBar.open('Failed to start recording', 'Close', { duration: 3000 });
    }
  }

  /**
   * Stop recording
   */
  private stopRecording(): void {
    try {
      const recordingBlob = this.webrtcService.stopRecording();
      this.isRecording = false;

      if (this.currentCall && recordingBlob) {
        this.videoCallService.stopRecording(this.currentCall._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open('Recording stopped', 'Close', { duration: 2000 });
                this.handleRecordingComplete(recordingBlob);
              }
            },
            error: (error) => {
              console.error('Error stopping recording:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  /**
   * Handle recording completion
   */
  private handleRecordingComplete(blob: Blob): void {
    // Create download link for recording
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call-recording-${new Date().toISOString().split('T')[0]}.webm`;
    link.click();
    URL.revokeObjectURL(url);

    this.snackBar.open('Recording saved', 'Close', { duration: 3000 });
  }

  /**
   * Update call quality metrics
   */
  private updateCallQuality(stats: WebRTCStats): void {
    if (!this.currentCall) return;

    const qualityMetrics: CallQualityMetrics = {
      audioLevel: stats.audioLevel,
      videoBitrate: stats.videoBitrate,
      audioBitrate: stats.audioBitrate,
      packetLoss: stats.packetLoss,
      latency: stats.latency,
      resolution: stats.resolution,
      frameRate: stats.frameRate,
      connectionQuality: stats.connectionQuality
    };

    this.videoCallService.updateCallQuality(this.currentCall._id, qualityMetrics)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentCall!.qualityMetrics = qualityMetrics;
          }
        },
        error: (error) => {
          console.error('Error updating call quality:', error);
        }
      });
  }

  /**
   * Format call duration
   */
  formatCallDuration(): string {
    const minutes = Math.floor(this.callDuration / 60);
    const seconds = this.callDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format duration in seconds to readable format
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format call time
   */
  formatCallTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString();
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get call participant name
   */
  getCallParticipantName(call: VideoCall): string {
    const currentUserId = this.authService.getCurrentUser()?.id;
    return call.callerId === currentUserId ? call.receiverName : call.callerName;
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'initiated': return 'Initiated';
      case 'answered': return 'Answered';
      case 'rejected': return 'Rejected';
      case 'ended': return 'Ended';
      case 'failed': return 'Failed';
      default: return status;
    }
  }

  /**
   * Initiate a new call
   */
  async initiateCall(call?: VideoCall): Promise<void> {
    console.log('🔍 VideoCallComponent - Initiating call to:', this.receiverName);

    const receiverId = call ? (call.callerId === this.authService.getCurrentUser()?.id ? call.receiverId : call.callerId) : this.receiverId;
    const receiverName = call ? (call.callerId === this.authService.getCurrentUser()?.id ? call.receiverName : call.callerName) : this.receiverName;

    if (!receiverId) {
      this.snackBar.open('No receiver specified', 'Close', { duration: 3000 });
      return;
    }

    // Create call object
    this.currentCall = {
      _id: Date.now().toString(),
      callerId: this.authService.getCurrentUser()?.id || '',
      receiverId: receiverId,
      callerName: this.authService.getCurrentUser()?.username || 'You',
      receiverName: receiverName,
      channelId: this.channelId,
      status: 'initiated',
      startTime: new Date().toISOString(),
      endTime: undefined,
      duration: 0
    };

    // Start the call
    this.isInCall = true;
    this.startCallTimer();

    // Initialize WebRTC with PeerJS
    await this.initializeWebRTCWithPeerJS(receiverId);

    this.snackBar.open(`Starting group video call for channel...`, 'Close', { duration: 3000 });
  }

  /**
   * Close dialog
   */
  closeDialog(): void {
    console.log('🔍 VideoCallComponent - Closing dialog');
    this.stopCallTimer();
    this.endCall();
    this.callEnded.emit();
  }

  /**
   * Stop call timer
   */
  private stopCallTimer(): void {
    // Stop the duration timer
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
      console.log('🔍 VideoCallComponent - Call timer stopped');
    }
  }

  /**
   * Start call timer
   */
  private startCallTimer(): void {
    console.log('🔍 VideoCallComponent - Starting call timer');

    // Set call start time for the existing timer system
    this.callStartTime = new Date();
    this.callDuration = 0;

    // Start the existing duration timer
    this.startCallDurationTimer();
  }

  /**
   * Initialize WebRTC with PeerJS (Group Call Mode)
   */
  private async initializeWebRTCWithPeerJS(receiverId: string): Promise<void> {
    console.log('🔍 VideoCallComponent - Initializing WebRTC with PeerJS (Group Call Mode)');

    try {
      // Subscribe to call events first
      this.peerJSService.callEvents$.pipe(takeUntil(this.destroy$)).subscribe(event => {
        if (event) {
          this.handlePeerJSEvent(event);
        }
      });

      // Check if PeerJS service is available
      const peerId = this.peerJSService.getPeerId();
      if (!peerId) {
        console.log('🔍 VideoCallComponent - PeerJS not connected, falling back to local mode');
        await this.initializeWebRTCLocalMode();
        return;
      }

      // Start group video call for the channel
      if (this.channelId) {
        console.log('🔍 VideoCallComponent - Starting group video call for channel:', this.channelId);
        const success = await this.peerJSService.startGroupVideoCall(this.channelId);
        if (success) {
          console.log('🔍 VideoCallComponent - Group video call started successfully');
        } else {
          console.log('🔍 VideoCallComponent - Failed to start group video call, falling back to local mode');
          await this.initializeWebRTCLocalMode();
        }
      } else {
        console.log('🔍 VideoCallComponent - No channel ID, falling back to local mode');
        await this.initializeWebRTCLocalMode();
      }

      // Debug video elements
      this.debugVideoElements();

      // Group call is now active - display local video
      const localStream = this.peerJSService.getLocalStream();
      if (localStream) {
        this.displayLocalVideo(localStream);
        console.log('🔍 VideoCallComponent - Group video call is now active with local video');
      } else {
        console.log('🔍 VideoCallComponent - No local stream available, getting user media directly');
        // Get user media directly if PeerJS doesn't have it
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
          this.displayLocalVideo(stream);
          (this as any).localStream = stream;
          console.log('🔍 VideoCallComponent - Got user media directly and displayed');
        } catch (error) {
          console.error('🔍 VideoCallComponent - Failed to get user media:', error);
        }
      }

    } catch (error) {
      console.error('🔍 VideoCallComponent - Error initializing PeerJS:', error);
      console.log('🔍 VideoCallComponent - Falling back to local mode');
      await this.initializeWebRTCLocalMode();
    }
  }

  /**
   * Initialize WebRTC in local mode (without PeerJS)
   */
  private async initializeWebRTCLocalMode(): Promise<void> {
    console.log('🔍 VideoCallComponent - Initializing WebRTC in local mode');

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Display local video
      this.displayLocalVideo(stream);

      // Store stream for controls
      (this as any).localStream = stream;

      this.snackBar.open('Video call started (local mode - waiting for peer connection)', 'Close', { duration: 5000 });

    } catch (error) {
      console.error('🔍 VideoCallComponent - Error in local mode:', error);
      this.snackBar.open('Failed to access camera/microphone', 'Close', { duration: 5000 });
    }
  }

  /**
   * Handle PeerJS events (Group Call Mode)
   */
  private handlePeerJSEvent(event: CallEvent): void {
    console.log('🔍 VideoCallComponent - PeerJS event:', event.type);

    switch (event.type) {
      case 'connection_established':
        if (event.data?.roomId) {
          console.log('🔍 VideoCallComponent - Joined video room:', event.data.roomId);
          this.snackBar.open(`Joined video room: ${event.data.roomId}`, 'Close', { duration: 3000 });
        }
        break;

      case 'call_answered':
        if (event.data?.remoteStream) {
          this.displayRemoteVideo(event.data.remoteStream, event.data.peerId);
          this.snackBar.open(`Connected to ${event.data.peerId}!`, 'Close', { duration: 3000 });
        }
        break;

      case 'call_ended':
        this.endCall();
        break;

      case 'incoming_call':
        // Handle incoming call if needed
        break;

      case 'connection_lost':
        console.log('🔍 VideoCallComponent - PeerJS connection lost, falling back to local mode');
        this.initializeWebRTCLocalMode();
        break;
    }
  }

  /**
   * Debug video elements
   */
  private debugVideoElements(): void {
    console.log('🔍 VideoCallComponent - Debugging video elements:');
    console.log('🔍 VideoCallComponent - localVideoRef:', this.localVideoRef);
    console.log('🔍 VideoCallComponent - remoteVideoRef:', this.remoteVideoRef);

    const localVideoElement = document.querySelector('#localVideo');
    const remoteVideoElement = document.querySelector('#remoteVideo');

    console.log('🔍 VideoCallComponent - localVideo element:', localVideoElement);
    console.log('🔍 VideoCallComponent - remoteVideo element:', remoteVideoElement);

    if (localVideoElement) {
      const htmlElement = localVideoElement as HTMLElement;
      console.log('🔍 VideoCallComponent - localVideo dimensions:', {
        width: htmlElement.clientWidth,
        height: htmlElement.clientHeight,
        offsetWidth: htmlElement.offsetWidth,
        offsetHeight: htmlElement.offsetHeight
      });
    }
  }

  /**
   * Display local video stream
   */
  private displayLocalVideo(stream: MediaStream): void {
    console.log('🔍 VideoCallComponent - displayLocalVideo called with stream:', stream);

    if (this.localVideoRef?.nativeElement) {
      const localVideo = this.localVideoRef.nativeElement;
      localVideo.srcObject = stream;
      localVideo.play().catch(e => console.error('Error playing local video:', e));

      // Update camera/mic status
      this.isCameraOn = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
      this.isMuted = stream.getAudioTracks().length === 0 || !stream.getAudioTracks()[0].enabled;

      console.log('🔍 VideoCallComponent - Local video displayed successfully, Camera:', this.isCameraOn, 'Mic:', this.isMuted);
    } else {
      console.error('🔍 VideoCallComponent - Local video element not found!');
      // Fallback to document.querySelector
      const localVideo = document.querySelector('#localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.play().catch(e => console.error('Error playing local video:', e));
        console.log('🔍 VideoCallComponent - Local video displayed via fallback');
      } else {
        console.error('🔍 VideoCallComponent - No local video element found anywhere!');
      }
    }
  }

  /**
   * Display remote video stream
   */
  private displayRemoteVideo(stream: MediaStream, peerId?: string): void {
    console.log('🔍 VideoCallComponent - displayRemoteVideo called with stream:', stream, 'from peer:', peerId);

    if (this.remoteVideoRef?.nativeElement) {
      const remoteVideo = this.remoteVideoRef.nativeElement;

      // Check if this is the same stream to avoid unnecessary updates
      if (remoteVideo.srcObject === stream) {
        console.log('🔍 VideoCallComponent - Same stream, skipping update');
        return;
      }

      remoteVideo.srcObject = stream;
      // Handle video play with proper error handling
      const playPromise = remoteVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🔍 VideoCallComponent - Remote video playing successfully from:', peerId);
            this.isRemoteVideoActive = true;
          })
          .catch(error => {
            // Only log non-abort errors to reduce console spam
            if (error.name !== 'AbortError') {
              console.error('Error playing remote video:', error);
            } else {
              console.log('🔍 VideoCallComponent - Video play interrupted (this is normal)');
            }
          });
      }
      this.isRemoteVideoActive = true;
      console.log('🔍 VideoCallComponent - Remote video displayed successfully from:', peerId);
    } else {
      console.error('🔍 VideoCallComponent - Remote video element not found!');
      // Fallback to document.querySelector
      const remoteVideo = document.querySelector('#remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        // Check if this is the same stream to avoid unnecessary updates
        if (remoteVideo.srcObject === stream) {
          console.log('🔍 VideoCallComponent - Same stream (fallback), skipping update');
          return;
        }

        remoteVideo.srcObject = stream;
        // Handle video play with proper error handling
        const playPromise = remoteVideo.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('🔍 VideoCallComponent - Remote video playing successfully from:', peerId);
              this.isRemoteVideoActive = true;
            })
            .catch(error => {
              // Only log non-abort errors to reduce console spam
              if (error.name !== 'AbortError') {
                console.error('Error playing remote video:', error);
              } else {
                console.log('🔍 VideoCallComponent - Video play interrupted (this is normal)');
              }
            });
        }
        this.isRemoteVideoActive = true;
        console.log('🔍 VideoCallComponent - Remote video displayed via fallback from:', peerId);
      } else {
        console.error('🔍 VideoCallComponent - No remote video element found anywhere!');
      }
    }
  }

  /**
   * Initialize WebRTC for the call (legacy method)
   */
  private initializeWebRTC(): void {
    console.log('🔍 VideoCallComponent - Initializing WebRTC');

    // Get user media with better constraints
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }).then(stream => {
      console.log('🔍 VideoCallComponent - Got user media stream');

      // Set local video stream
      const localVideo = document.querySelector('#localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.play().catch(e => console.error('Error playing local video:', e));

        // Update camera/mic status based on actual stream
        this.isCameraOn = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
        this.isMuted = stream.getAudioTracks().length === 0 || !stream.getAudioTracks()[0].enabled;

        console.log('🔍 VideoCallComponent - Camera on:', this.isCameraOn, 'Mic muted:', this.isMuted);
        console.log('🔍 VideoCallComponent - Video tracks:', stream.getVideoTracks().length);
        console.log('🔍 VideoCallComponent - Audio tracks:', stream.getAudioTracks().length);
      }

      // Store stream for later use
      (this as any).localStream = stream;

      // Show success message
      this.snackBar.open('Camera and microphone connected successfully!', 'Close', { duration: 3000 });

      // TODO: Implement WebRTC peer connection
      // This would involve creating offer, sending to receiver, etc.

    }).catch(error => {
      console.error('🔍 VideoCallComponent - Error getting user media:', error);

      let errorMessage = 'Failed to access camera/microphone';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please check your devices.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is being used by another application.';
      }

      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });

      // Still show the interface even if media fails
      this.isCameraOn = false;
      this.isMuted = true;
    });
  }
}