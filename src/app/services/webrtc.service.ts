import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { CallQualityMetrics } from './video-call.service';

export interface WebRTCStats {
    audioLevel: number;
    videoBitrate: number;
    audioBitrate: number;
    packetLoss: number;
    latency: number;
    resolution: string;
    frameRate: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface MediaConstraints {
    video: boolean | MediaTrackConstraints;
    audio: boolean | MediaTrackConstraints;
}

@Injectable({
    providedIn: 'root'
})
export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private qualityStatsSubject = new BehaviorSubject<WebRTCStats | null>(null);
    private isRecordingSubject = new BehaviorSubject<boolean>(false);
    private isScreenSharingSubject = new BehaviorSubject<boolean>(false);

    public qualityStats$ = this.qualityStatsSubject.asObservable();
    public isRecording$ = this.isRecordingSubject.asObservable();
    public isScreenSharing$ = this.isScreenSharingSubject.asObservable();

    private statsInterval: any;
    private qualityUpdateInterval: any;

    constructor() { }

    /**
     * Create peer connection with advanced configuration
     */
    createPeerConnection(): RTCPeerConnection {
        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Enhanced event handlers
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // Emit ICE candidate
                this.emitEvent('ice-candidate', event.candidate);
            }
        };

        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.emitEvent('remote-stream', this.remoteStream);
        };

        this.peerConnection.onconnectionstatechange = () => {
            this.emitEvent('connection-state-change', this.peerConnection?.connectionState);
        };

        this.peerConnection.oniceconnectionstatechange = () => {
            this.emitEvent('ice-connection-state-change', this.peerConnection?.iceConnectionState);
        };

        return this.peerConnection;
    }

    /**
     * Get user media with advanced constraints
     */
    async getUserMedia(constraints: MediaConstraints = { video: true, audio: true }): Promise<MediaStream> {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.localStream;
        } catch (error) {
            console.error('Error accessing user media:', error);
            throw error;
        }
    }

    /**
     * Get screen sharing stream
     */
    async getScreenShare(): Promise<MediaStream> {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: true
            });

            this.isScreenSharingSubject.next(true);

            // Handle screen share end
            screenStream.getVideoTracks()[0].onended = () => {
                this.isScreenSharingSubject.next(false);
                this.emitEvent('screen-share-ended', null);
            };

            return screenStream;
        } catch (error) {
            console.error('Error accessing screen share:', error);
            throw error;
        }
    }

    /**
     * Start call quality monitoring
     */
    startQualityMonitoring(): void {
        if (!this.peerConnection) return;

        this.statsInterval = setInterval(async () => {
            try {
                const stats = await this.peerConnection!.getStats();
                const qualityStats = this.analyzeStats(stats);
                this.qualityStatsSubject.next(qualityStats);
            } catch (error) {
                console.error('Error getting WebRTC stats:', error);
            }
        }, 1000);

        // Update quality metrics every 5 seconds
        this.qualityUpdateInterval = setInterval(() => {
            const currentStats = this.qualityStatsSubject.value;
            if (currentStats) {
                this.emitEvent('quality-update', currentStats);
            }
        }, 5000);
    }

    /**
     * Stop quality monitoring
     */
    stopQualityMonitoring(): void {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
        if (this.qualityUpdateInterval) {
            clearInterval(this.qualityUpdateInterval);
            this.qualityUpdateInterval = null;
        }
    }

    /**
     * Analyze WebRTC statistics
     */
    private analyzeStats(stats: RTCStatsReport): WebRTCStats {
        let audioLevel = 0;
        let videoBitrate = 0;
        let audioBitrate = 0;
        let packetLoss = 0;
        let latency = 0;
        let resolution = '0x0';
        let frameRate = 0;

        stats.forEach((report) => {
            if (report.type === 'media-source') {
                if (report.kind === 'audio') {
                    audioLevel = report.audioLevel || 0;
                }
            }

            if (report.type === 'outbound-rtp') {
                if (report.kind === 'video') {
                    videoBitrate = report.bytesSent || 0;
                    frameRate = report.framesPerSecond || 0;
                } else if (report.kind === 'audio') {
                    audioBitrate = report.bytesSent || 0;
                }
            }

            if (report.type === 'inbound-rtp') {
                if (report.kind === 'video') {
                    const width = report.frameWidth || 0;
                    const height = report.frameHeight || 0;
                    resolution = `${width}x${height}`;
                }
            }

            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
                packetLoss = report.packetsLost ? (report.packetsLost / (report.packetsSent || 1)) * 100 : 0;
            }
        });

        const connectionQuality = this.calculateConnectionQuality(audioLevel, videoBitrate, packetLoss, latency);

        return {
            audioLevel,
            videoBitrate,
            audioBitrate,
            packetLoss,
            latency,
            resolution,
            frameRate,
            connectionQuality
        };
    }

    /**
     * Calculate connection quality based on metrics
     */
    private calculateConnectionQuality(
        audioLevel: number,
        videoBitrate: number,
        packetLoss: number,
        latency: number
    ): 'excellent' | 'good' | 'fair' | 'poor' {
        let score = 100;

        // Penalize high packet loss
        if (packetLoss > 5) score -= 30;
        else if (packetLoss > 2) score -= 15;

        // Penalize high latency
        if (latency > 300) score -= 25;
        else if (latency > 150) score -= 10;

        // Penalize low audio level
        if (audioLevel < 0.1) score -= 20;

        // Penalize low video bitrate
        if (videoBitrate < 100000) score -= 15;

        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    /**
     * Start recording the call
     */
    async startRecording(): Promise<void> {
        if (!this.localStream && !this.remoteStream) {
            throw new Error('No streams available for recording');
        }

        try {
            // Combine local and remote streams
            const combinedStream = new MediaStream();

            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });
            }

            if (this.remoteStream) {
                this.remoteStream.getTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });
            }

            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9,opus'
            });

            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                this.emitEvent('recording-complete', blob);
            };

            this.mediaRecorder.start(1000); // Record in 1-second chunks
            this.isRecordingSubject.next(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    /**
     * Stop recording the call
     */
    stopRecording(): Blob | null {
        if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
            return null;
        }

        this.mediaRecorder.stop();
        this.isRecordingSubject.next(false);

        if (this.recordedChunks.length > 0) {
            return new Blob(this.recordedChunks, { type: 'video/webm' });
        }

        return null;
    }

    /**
     * Switch to screen sharing
     */
    async switchToScreenShare(): Promise<void> {
        if (!this.peerConnection) return;

        try {
            const screenStream = await this.getScreenShare();
            const videoTrack = screenStream.getVideoTracks()[0];

            // Replace video track
            const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                await sender.replaceTrack(videoTrack);
            }

            this.emitEvent('screen-share-started', screenStream);
        } catch (error) {
            console.error('Error switching to screen share:', error);
            throw error;
        }
    }

    /**
     * Switch back to camera
     */
    async switchToCamera(): Promise<void> {
        if (!this.peerConnection || !this.localStream) return;

        try {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');

            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
            }

            this.isScreenSharingSubject.next(false);
            this.emitEvent('camera-switched', this.localStream);
        } catch (error) {
            console.error('Error switching to camera:', error);
            throw error;
        }
    }

    /**
     * Toggle audio mute
     */
    toggleAudioMute(): boolean {
        if (!this.localStream) return false;

        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            return !audioTrack.enabled;
        }
        return false;
    }

    /**
     * Toggle video mute
     */
    toggleVideoMute(): boolean {
        if (!this.localStream) return false;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            return !videoTrack.enabled;
        }
        return false;
    }

    /**
     * Get current connection state
     */
    getConnectionState(): string {
        return this.peerConnection?.connectionState || 'new';
    }

    /**
     * Get ICE connection state
     */
    getIceConnectionState(): string {
        return this.peerConnection?.iceConnectionState || 'new';
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.stopQualityMonitoring();

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        this.recordedChunks = [];
        this.qualityStatsSubject.next(null);
        this.isRecordingSubject.next(false);
        this.isScreenSharingSubject.next(false);
    }

    /**
     * Emit custom events
     */
    private emitEvent(eventName: string, data: any): void {
        const event = new CustomEvent(`webrtc-${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Listen for WebRTC events
     */
    onEvent(eventName: string, callback: (data: any) => void): () => void {
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent;
            callback(customEvent.detail);
        };
        window.addEventListener(`webrtc-${eventName}`, handler);

        return () => window.removeEventListener(`webrtc-${eventName}`, handler);
    }
}
