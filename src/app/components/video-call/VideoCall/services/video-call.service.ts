import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from '../../../chat/socket.service';
import Peer from 'peerjs';

export interface VideoCallData {
    callId: string;
    initiatorId: string;
    recipientId: string;
    channelId: string;
    status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
}

export interface IncomingCall {
    callId: string;
    initiatorId: string;
    initiatorUsername: string;
    channelId: string;
}

export interface CallOffer {
    callId: string;
    initiatorId: string;
    recipientId: string;
    channelId: string;
    offer: RTCSessionDescriptionInit;
}

export interface CallAnswer {
    callId: string;
    answer: RTCSessionDescriptionInit;
}

export interface IceCandidate {
    callId: string;
    candidate: RTCIceCandidateInit;
}

@Injectable({
    providedIn: 'root'
})
export class VideoCallService {
    private peer: Peer | null = null;
    private currentCall: VideoCallData | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private peerConnection: RTCPeerConnection | null = null;

    // Observables
    private incomingCallSubject = new BehaviorSubject<IncomingCall | null>(null);
    private callStatusSubject = new BehaviorSubject<VideoCallData | null>(null);
    private localStreamSubject = new BehaviorSubject<MediaStream | null>(null);
    private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
    private callErrorSubject = new BehaviorSubject<string | null>(null);

    // Public observables
    public incomingCall$ = this.incomingCallSubject.asObservable();
    public callStatus$ = this.callStatusSubject.asObservable();
    public localStream$ = this.localStreamSubject.asObservable();
    public remoteStream$ = this.remoteStreamSubject.asObservable();
    public callError$ = this.callErrorSubject.asObservable();

    constructor(private socketService: SocketService) {
        this.initializePeer();
        this.setupSocketListeners();
    }

    private initializePeer(): void {
        this.peer = new Peer(undefined, {
            host: 'localhost',
            port: 9000,
            path: '/peerjs',
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id: string) => {
            console.log('Peer connection opened with ID:', id);
        });

        this.peer.on('error', (error: any) => {
            console.error('Peer error:', error);
            this.callErrorSubject.next('Connection error: ' + error.message);
        });

        this.peer.on('call', (call) => {
            console.log('Incoming call from peer:', call.peer);
            // Handle incoming call from peer
        });
    }

    private setupSocketListeners(): void {
        // Listen for incoming video calls
        this.socketService.socket?.on('video_call_incoming', (data: IncomingCall) => {
            this.incomingCallSubject.next(data);
        });

        // Listen for call status updates
        this.socketService.socket?.on('video_call_initiated', (data: VideoCallData) => {
            this.currentCall = data;
            this.callStatusSubject.next(data);
        });

        this.socketService.socket?.on('video_call_accepted', (data: VideoCallData) => {
            this.currentCall = data;
            this.callStatusSubject.next(data);
        });

        this.socketService.socket?.on('video_call_rejected', (data: VideoCallData) => {
            this.currentCall = data;
            this.callStatusSubject.next(data);
            this.cleanupCall();
        });

        this.socketService.socket?.on('video_call_ended', (data: VideoCallData) => {
            this.currentCall = data;
            this.callStatusSubject.next(data);
            this.cleanupCall();
        });

        // Listen for WebRTC signaling
        this.socketService.socket?.on('video_call_offer', (data: CallOffer) => {
            this.handleOffer(data);
        });

        this.socketService.socket?.on('video_call_answer', (data: CallAnswer) => {
            this.handleAnswer(data);
        });

        this.socketService.socket?.on('video_call_ice_candidate', (data: IceCandidate) => {
            this.handleIceCandidate(data);
        });

        // Listen for errors
        this.socketService.socket?.on('video_call_error', (data: { message: string }) => {
            this.callErrorSubject.next(data.message);
        });
    }

    /**
     * Initiate a video call
     */
    async initiateCall(recipientId: string, channelId: string): Promise<void> {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.localStreamSubject.next(this.localStream);

            // Emit initiate call event
            this.socketService.socket?.emit('video_call_initiate', {
                recipientId,
                channelId
            });
        } catch (error) {
            console.error('Error initiating call:', error);
            this.callErrorSubject.next('Failed to access camera/microphone');
        }
    }

    /**
     * Accept an incoming call
     */
    async acceptCall(callId: string): Promise<void> {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.localStreamSubject.next(this.localStream);

            // Emit accept call event
            this.socketService.socket?.emit('video_call_accept', { callId });
        } catch (error) {
            console.error('Error accepting call:', error);
            this.callErrorSubject.next('Failed to access camera/microphone');
        }
    }

    /**
     * Reject an incoming call
     */
    rejectCall(callId: string): void {
        this.socketService.socket?.emit('video_call_reject', { callId });
        this.cleanupCall();
    }

    /**
     * End the current call
     */
    endCall(): void {
        if (this.currentCall) {
            this.socketService.socket?.emit('video_call_end', { callId: this.currentCall.callId });
        }
        this.cleanupCall();
    }

    /**
     * Handle incoming offer
     */
    private async handleOffer(data: CallOffer): Promise<void> {
        try {
            if (!this.peer) return;

            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Add local stream to peer connection
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection!.addTrack(track, this.localStream!);
                });
            }

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                this.remoteStream = event.streams[0];
                this.remoteStreamSubject.next(this.remoteStream);
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socketService.socket?.emit('video_call_ice_candidate', {
                        callId: data.callId,
                        candidate: event.candidate
                    });
                }
            };

            // Set remote description and create answer
            await this.peerConnection.setRemoteDescription(data.offer);
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            // Send answer
            this.socketService.socket?.emit('video_call_answer', {
                callId: data.callId,
                answer
            });
        } catch (error) {
            console.error('Error handling offer:', error);
            this.callErrorSubject.next('Failed to handle call offer');
        }
    }

    /**
     * Handle incoming answer
     */
    private async handleAnswer(data: CallAnswer): Promise<void> {
        try {
            if (!this.peerConnection) return;

            await this.peerConnection.setRemoteDescription(data.answer);
        } catch (error) {
            console.error('Error handling answer:', error);
            this.callErrorSubject.next('Failed to handle call answer');
        }
    }

    /**
     * Handle ICE candidate
     */
    private async handleIceCandidate(data: IceCandidate): Promise<void> {
        try {
            if (!this.peerConnection) return;

            await this.peerConnection.addIceCandidate(data.candidate);
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    }

    /**
     * Create offer for outgoing call
     */
    private async createOffer(callId: string, recipientId: string, channelId: string): Promise<void> {
        try {
            if (!this.peer) return;

            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Add local stream to peer connection
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    this.peerConnection!.addTrack(track, this.localStream!);
                });
            }

            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                this.remoteStream = event.streams[0];
                this.remoteStreamSubject.next(this.remoteStream);
            };

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socketService.socket?.emit('video_call_ice_candidate', {
                        callId,
                        candidate: event.candidate
                    });
                }
            };

            // Create offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Send offer
            this.socketService.socket?.emit('video_call_offer', {
                callId,
                initiatorId: this.getCurrentUserId(),
                recipientId,
                channelId,
                offer
            });
        } catch (error) {
            console.error('Error creating offer:', error);
            this.callErrorSubject.next('Failed to create call offer');
        }
    }

    /**
     * Clean up call resources
     */
    private cleanupCall(): void {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
            this.localStreamSubject.next(null);
        }

        // Stop remote stream
        this.remoteStream = null;
        this.remoteStreamSubject.next(null);

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Clear current call
        this.currentCall = null;
        this.callStatusSubject.next(null);
        this.incomingCallSubject.next(null);
    }

    /**
     * Toggle video on/off
     */
    toggleVideo(): void {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
            }
        }
    }

    /**
     * Toggle audio on/off
     */
    toggleAudio(): void {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
            }
        }
    }

    /**
     * Get current user ID (implement based on your auth service)
     */
    private getCurrentUserId(): string {
        // This should be implemented based on your authentication service
        return localStorage.getItem('userId') || '';
    }

    /**
     * Check if call is active
     */
    get isCallActive(): boolean {
        return this.currentCall !== null && this.currentCall.status === 'accepted';
    }

    /**
     * Get current call data
     */
    get currentCallData(): VideoCallData | null {
        return this.currentCall;
    }

    /**
     * Clear all subjects (useful for cleanup)
     */
    clearSubjects(): void {
        this.incomingCallSubject.next(null);
        this.callStatusSubject.next(null);
        this.localStreamSubject.next(null);
        this.remoteStreamSubject.next(null);
        this.callErrorSubject.next(null);
    }
}
