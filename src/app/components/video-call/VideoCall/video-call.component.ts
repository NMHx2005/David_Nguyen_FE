import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { VideoCallService, VideoCallData, IncomingCall } from './services/video-call.service';

@Component({
    selector: 'app-video-call',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    template: `
    <div class="video-call-container" [class.incoming-call]="isIncomingCall">
      <!-- Incoming Call UI -->
      <div *ngIf="isIncomingCall && incomingCall" class="incoming-call-ui">
        <mat-card class="call-card">
          <mat-card-header>
            <div mat-card-avatar class="caller-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <mat-card-title>{{ incomingCall.initiatorUsername }}</mat-card-title>
            <mat-card-subtitle>Incoming video call</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="call-actions">
              <button mat-fab color="warn" (click)="rejectCall()" class="call-button">
                <mat-icon>call_end</mat-icon>
              </button>
              <button mat-fab color="primary" (click)="acceptCall()" class="call-button">
                <mat-icon>call</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Active Call UI -->
      <div *ngIf="isCallActive" class="active-call-ui">
        <div class="video-container">
          <!-- Remote Video -->
          <div class="remote-video-container">
            <video 
              #remoteVideo 
              [srcObject]="remoteStream" 
              autoplay 
              playsinline
              class="remote-video"
              [class.hidden]="!remoteStream">
            </video>
            <div *ngIf="!remoteStream" class="no-video-placeholder">
              <mat-icon>videocam_off</mat-icon>
              <p>Waiting for remote video...</p>
            </div>
          </div>

          <!-- Local Video -->
          <div class="local-video-container">
            <video 
              #localVideo 
              [srcObject]="localStream" 
              autoplay 
              playsinline 
              muted
              class="local-video"
              [class.hidden]="!localStream">
            </video>
            <div *ngIf="!localStream" class="no-video-placeholder">
              <mat-icon>videocam_off</mat-icon>
            </div>
          </div>
        </div>

        <!-- Call Controls -->
        <div class="call-controls">
          <button 
            mat-fab 
            [color]="isVideoEnabled ? 'primary' : 'warn'"
            (click)="toggleVideo()"
            class="control-button">
            <mat-icon>{{ isVideoEnabled ? 'videocam' : 'videocam_off' }}</mat-icon>
          </button>
          
          <button 
            mat-fab 
            [color]="isAudioEnabled ? 'primary' : 'warn'"
            (click)="toggleAudio()"
            class="control-button">
            <mat-icon>{{ isAudioEnabled ? 'mic' : 'mic_off' }}</mat-icon>
          </button>
          
          <button 
            mat-fab 
            color="warn" 
            (click)="endCall()"
            class="control-button end-call">
            <mat-icon>call_end</mat-icon>
          </button>
        </div>

        <!-- Call Status -->
        <div class="call-status">
          <div *ngIf="callStatus === 'ringing'" class="status-ringing">
            <mat-spinner diameter="30"></mat-spinner>
            <span>Calling...</span>
          </div>
          <div *ngIf="callStatus === 'accepted'" class="status-connected">
            <mat-icon>call</mat-icon>
            <span>Connected</span>
          </div>
        </div>
      </div>

      <!-- Call Error -->
      <div *ngIf="callError" class="call-error">
        <mat-card>
          <mat-card-content>
            <div class="error-content">
              <mat-icon color="warn">error</mat-icon>
              <span>{{ callError }}</span>
              <button mat-button (click)="clearError()">Dismiss</button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .video-call-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .incoming-call-ui {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }

    .call-card {
      text-align: center;
    }

    .caller-avatar {
      background-color: #3f51b5;
      color: white;
    }

    .call-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }

    .call-button {
      width: 60px;
      height: 60px;
    }

    .active-call-ui {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .video-container {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remote-video-container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remote-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .local-video-container {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 200px;
      height: 150px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid #fff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .local-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-video-placeholder {
      width: 100%;
      height: 100%;
      background: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #666;
    }

    .no-video-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }

    .call-controls {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      background: rgba(0, 0, 0, 0.7);
      padding: 15px;
      border-radius: 50px;
    }

    .control-button {
      width: 50px;
      height: 50px;
    }

    .end-call {
      background-color: #f44336 !important;
    }

    .call-status {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
    }

    .status-ringing {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .status-connected {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(76, 175, 80, 0.8);
      padding: 10px 20px;
      border-radius: 25px;
    }

    .call-error {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      max-width: 400px;
      width: 90%;
    }

    .error-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hidden {
      display: none;
    }

    @media (max-width: 768px) {
      .local-video-container {
        width: 150px;
        height: 112px;
        top: 10px;
        right: 10px;
      }

      .call-controls {
        bottom: 20px;
        gap: 10px;
        padding: 10px;
      }

      .control-button {
        width: 45px;
        height: 45px;
      }
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
    @Input() isIncomingCall: boolean = false;
    @Output() callEnded = new EventEmitter<void>();

    // Call data
    incomingCall: IncomingCall | null = null;
    callStatus: string | null = null;
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;
    callError: string | null = null;

    // Call state
    isVideoEnabled: boolean = true;
    isAudioEnabled: boolean = true;

    // Subscriptions
    private subscriptions: Subscription[] = [];

    constructor(
        private videoCallService: VideoCallService,
        private dialogRef: MatDialogRef<VideoCallComponent>
    ) { }

    ngOnInit(): void {
        this.setupSubscriptions();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.videoCallService.clearSubjects();
    }

    private setupSubscriptions(): void {
        // Listen for incoming calls
        this.subscriptions.push(
            this.videoCallService.incomingCall$.subscribe(call => {
                this.incomingCall = call;
                this.isIncomingCall = !!call;
            })
        );

        // Listen for call status changes
        this.subscriptions.push(
            this.videoCallService.callStatus$.subscribe(status => {
                if (status) {
                    this.callStatus = status.status;
                    this.isIncomingCall = false;
                }
            })
        );

        // Listen for local stream
        this.subscriptions.push(
            this.videoCallService.localStream$.subscribe(stream => {
                this.localStream = stream;
                if (stream) {
                    this.updateStreamStates(stream);
                }
            })
        );

        // Listen for remote stream
        this.subscriptions.push(
            this.videoCallService.remoteStream$.subscribe(stream => {
                this.remoteStream = stream;
            })
        );

        // Listen for call errors
        this.subscriptions.push(
            this.videoCallService.callError$.subscribe(error => {
                this.callError = error;
            })
        );
    }

    private updateStreamStates(stream: MediaStream): void {
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        this.isVideoEnabled = videoTrack ? videoTrack.enabled : false;
        this.isAudioEnabled = audioTrack ? audioTrack.enabled : false;
    }

    acceptCall(): void {
        if (this.incomingCall) {
            this.videoCallService.acceptCall(this.incomingCall.callId);
        }
    }

    rejectCall(): void {
        if (this.incomingCall) {
            this.videoCallService.rejectCall(this.incomingCall.callId);
        }
        this.closeDialog();
    }

    endCall(): void {
        this.videoCallService.endCall();
        this.closeDialog();
    }

    toggleVideo(): void {
        this.videoCallService.toggleVideo();
        this.isVideoEnabled = !this.isVideoEnabled;
    }

    toggleAudio(): void {
        this.videoCallService.toggleAudio();
        this.isAudioEnabled = !this.isAudioEnabled;
    }

    clearError(): void {
        this.callError = null;
    }

    private closeDialog(): void {
        this.dialogRef.close();
        this.callEnded.emit();
    }

    get isCallActive(): boolean {
        return this.videoCallService.isCallActive;
    }
}
