import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Peer from 'peerjs';

export interface PeerConnection {
    peer: Peer;
    connection: any | null;
    call: any | null;
    isConnected: boolean;
    isCallActive: boolean;
}

export interface CallEvent {
    type: 'incoming_call' | 'call_answered' | 'call_ended' | 'connection_established' | 'connection_lost';
    data?: any;
}

@Injectable({
    providedIn: 'root'
})
export class PeerJSService {
    private peer: Peer | null = null;
    private currentConnection: any | null = null;
    private currentCall: any | null = null;
    private localStream: MediaStream | null = null;

    private connectionSubject = new BehaviorSubject<PeerConnection | null>(null);
    private callEventSubject = new BehaviorSubject<CallEvent | null>(null);

    public connection$ = this.connectionSubject.asObservable();
    public callEvents$ = this.callEventSubject.asObservable();

    constructor() {
        this.initializePeer();
    }

    /**
     * Initialize PeerJS connection
     */
    private initializePeer(): void {
        try {
            // Generate unique peer ID based on user ID and timestamp
            const userId = localStorage.getItem('user_id') || 'anonymous';
            const peerId = `${userId}_${Date.now()}`;

            this.peer = new Peer(peerId, {
                host: 'localhost',
                port: 9000, // PeerJS server port
                path: '/peerjs',
                debug: 1, // Reduce debug logging
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                console.log('🔍 PeerJS - Connected with ID:', id);
                this.updateConnectionState();
            });

            (this.peer as any).on('connection', (conn: any) => {
                console.log('🔍 PeerJS - Incoming connection from:', conn.peer);
                this.currentConnection = conn;
                this.setupDataConnection(conn);
                this.updateConnectionState();
            });

            this.peer.on('call', (call: any) => {
                console.log('🔍 PeerJS - Incoming call from:', call.peer);
                this.currentCall = call;
                this.callEventSubject.next({
                    type: 'incoming_call',
                    data: { peerId: call.peer, call }
                });
            });

            this.peer.on('error', (error) => {
                console.error('🔍 PeerJS - Error:', error);

                // Handle different error types
                if (error.type === 'server-error' || error.type === 'network') {
                    console.log('🔍 PeerJS - Server connection failed, PeerJS server may not be running');
                    this.callEventSubject.next({
                        type: 'connection_lost',
                        data: { error: 'PeerJS server unavailable' }
                    });
                } else if (error.type === 'peer-unavailable') {
                    console.log('🔍 PeerJS - Peer unavailable:', error.message);
                } else if (error.type === 'webrtc') {
                    console.log('🔍 PeerJS - WebRTC error:', error.message);
                } else {
                    console.log('🔍 PeerJS - Other error:', error.message);
                }

                this.updateConnectionState();
            });

            (this.peer as any).on('close', () => {
                console.log('🔍 PeerJS - Disconnected');
                this.updateConnectionState();
            });

        } catch (error) {
            console.error('🔍 PeerJS - Failed to initialize:', error);
        }
    }

    /**
     * Connect to another peer
     */
    connectToPeer(peerId: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.peer) {
                console.error('🔍 PeerJS - Peer not initialized');
                resolve(false);
                return;
            }

            try {
                const conn = (this.peer as any).connect(peerId);
                this.currentConnection = conn;
                this.setupDataConnection(conn);

                conn.on('open', () => {
                    console.log('🔍 PeerJS - Connected to peer:', peerId);
                    this.updateConnectionState();
                    resolve(true);
                });

                conn.on('error', (error: any) => {
                    console.error('🔍 PeerJS - Connection error:', error);
                    resolve(false);
                });

            } catch (error) {
                console.error('🔍 PeerJS - Failed to connect:', error);
                resolve(false);
            }
        });
    }

    /**
     * Start a video call
     */
    async startCall(peerId: string): Promise<boolean> {
        try {
            if (!this.peer) {
                console.error('🔍 PeerJS - Peer not initialized');
                return false;
            }

            // Check if peer is connected
            if (!(this.peer as any).id) {
                console.error('🔍 PeerJS - Peer not connected to server');
                return false;
            }

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Make the call
            const call = (this.peer as any).call(peerId, this.localStream);

            if (!call) {
                console.error('🔍 PeerJS - Failed to create call object');
                return false;
            }

            this.currentCall = call;

            call.on('stream', (remoteStream: MediaStream) => {
                console.log('🔍 PeerJS - Received remote stream');
                this.callEventSubject.next({
                    type: 'call_answered',
                    data: { remoteStream, call }
                });
            });

            call.on('close', () => {
                console.log('🔍 PeerJS - Call ended');
                this.endCall();
            });

            call.on('error', (error: any) => {
                console.error('🔍 PeerJS - Call error:', error);
                this.endCall();
            });

            return true;

        } catch (error) {
            console.error('🔍 PeerJS - Failed to start call:', error);
            return false;
        }
    }

    /**
     * Answer an incoming call
     */
    async answerCall(call: any): Promise<boolean> {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Answer the call
            call.answer(this.localStream);
            this.currentCall = call;

            call.on('stream', (remoteStream: MediaStream) => {
                console.log('🔍 PeerJS - Received remote stream');
                this.callEventSubject.next({
                    type: 'call_answered',
                    data: { remoteStream, call }
                });
            });

            call.on('close', () => {
                console.log('🔍 PeerJS - Call ended');
                this.endCall();
            });

            return true;

        } catch (error) {
            console.error('🔍 PeerJS - Failed to answer call:', error);
            return false;
        }
    }

    /**
     * End current call
     */
    endCall(): void {
        if (this.currentCall) {
            this.currentCall.close();
            this.currentCall = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        this.callEventSubject.next({
            type: 'call_ended',
            data: null
        });
    }

    /**
     * Send data to connected peer
     */
    sendData(data: any): boolean {
        if (this.currentConnection && this.currentConnection.open) {
            this.currentConnection.send(data);
            return true;
        }
        return false;
    }

    /**
     * Get current peer ID
     */
    getPeerId(): string | null {
        return (this.peer as any)?.id || null;
    }

    /**
     * Check if connected to a peer
     */
    isConnected(): boolean {
        return this.currentConnection?.open || false;
    }

    /**
     * Check if in an active call
     */
    isInCall(): boolean {
        return this.currentCall !== null;
    }

    /**
     * Get local stream
     */
    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    /**
     * Setup data connection handlers
     */
    private setupDataConnection(conn: any): void {
        conn.on('data', (data: any) => {
            console.log('🔍 PeerJS - Received data:', data);
            // Handle incoming data
        });

        conn.on('close', () => {
            console.log('🔍 PeerJS - Data connection closed');
            this.currentConnection = null;
            this.updateConnectionState();
        });

        conn.on('error', (error: any) => {
            console.error('🔍 PeerJS - Data connection error:', error);
        });
    }

    /**
     * Update connection state
     */
    private updateConnectionState(): void {
        const state: PeerConnection = {
            peer: this.peer!,
            connection: this.currentConnection,
            call: this.currentCall,
            isConnected: this.isConnected(),
            isCallActive: this.isInCall()
        };

        this.connectionSubject.next(state);
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.endCall();

        if (this.currentConnection) {
            this.currentConnection.close();
            this.currentConnection = null;
        }

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}
