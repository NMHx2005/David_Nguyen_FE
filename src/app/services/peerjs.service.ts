import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Peer from 'peerjs';
import { SocketService } from './socket.service';

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
    private isPeerJSEnabled = true;
    private socketService: SocketService;

    private connectionSubject = new BehaviorSubject<PeerConnection | null>(null);
    private callEventSubject = new BehaviorSubject<CallEvent | null>(null);

    public connection$ = this.connectionSubject.asObservable();
    public callEvents$ = this.callEventSubject.asObservable();

    constructor(socketService: SocketService) {
        this.socketService = socketService;
        console.log('🔍 PeerJS - Service initialized');

        // Suppress PeerJS connection errors for old peer IDs
        this.suppressOldPeerErrors();

        // Delay initialization to avoid connection issues on startup
        setTimeout(() => {
            this.initializePeer();
        }, 1000);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
    }

    /**
     * Suppress old peer connection errors
     */
    private suppressOldPeerErrors(): void {
        // Store original console.error
        const originalConsoleError = console.error;

        // Override console.error to filter out PeerJS connection errors
        console.error = (...args: any[]) => {
            const message = args.join(' ');

            // Check if this is a PeerJS connection error for old peer IDs
            if (message.includes('Could not connect to peer') &&
                (message.includes('anonymous_') || message.includes('_'))) {
                // Suppress these errors - they're normal for old peer IDs
                return;
            }

            // For all other errors, use the original console.error
            originalConsoleError.apply(console, args);
        };
    }

    /**
     * Initialize PeerJS connection
     */
    private initializePeer(): void {
        try {
            // Check if PeerJS is already initialized
            if (this.peer) {
                console.log('🔍 PeerJS - Already initialized, skipping');
                return;
            }

            // Generate unique peer ID based on user ID and timestamp
            const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
            const userId = currentUser.id || localStorage.getItem('user_id') || 'anonymous';
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const peerId = `${userId}_${Date.now()}_${randomSuffix}`;

            console.log('🔍 PeerJS - Initializing with peer ID:', peerId);

            this.peer = new Peer(peerId, {
                host: 'localhost',
                port: 9000, // PeerJS server port
                path: '/peerjs',
                debug: 0, // Reduce debug logging to minimize console spam
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

                // Auto-answer the call for group video calls
                this.answerIncomingCall(call);

                this.callEventSubject.next({
                    type: 'incoming_call',
                    data: { peerId: call.peer, call }
                });
            });

            this.peer.on('error', (error) => {
                // Only log errors that are not related to old peer connections
                const errorMessage = error.message || error.toString();
                const isOldPeerError = errorMessage.includes('Could not connect to peer') &&
                    (errorMessage.includes('anonymous_') || errorMessage.includes('_'));

                if (!isOldPeerError) {
                    console.error('🔍 PeerJS - Error:', error);
                }

                // Handle different error types
                if (error.type === 'server-error' || error.type === 'network') {
                    console.log('🔍 PeerJS - Server connection failed, disabling PeerJS');
                    this.isPeerJSEnabled = false;
                    this.callEventSubject.next({
                        type: 'connection_lost',
                        data: { error: 'PeerJS server unavailable' }
                    });
                } else if (error.type === 'peer-unavailable') {
                    // Suppress peer-unavailable errors for old peer IDs to reduce console spam
                    if (!isOldPeerError) {
                        console.log('🔍 PeerJS - Peer unavailable (normal for old peer IDs)');
                    }
                    // Don't disable PeerJS for peer-unavailable errors - this is normal
                } else if (error.type === 'webrtc') {
                    console.log('🔍 PeerJS - WebRTC error:', error.message);
                } else {
                    if (!isOldPeerError) {
                        console.log('🔍 PeerJS - Other error:', error.message);
                    }
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
     * Check if peer is available
     */
    async checkPeerAvailability(peerId: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.peer) {
                resolve(false);
                return;
            }

            // Try to connect with a timeout
            const conn = (this.peer as any).connect(peerId);
            const timeout = setTimeout(() => {
                conn.close();
                resolve(false);
            }, 5000);

            conn.on('open', () => {
                clearTimeout(timeout);
                conn.close();
                resolve(true);
            });

            conn.on('error', () => {
                clearTimeout(timeout);
                resolve(false);
            });
        });
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
                // Create data connection
                const conn = (this.peer as any).connect(peerId);
                this.currentConnection = conn;
                this.setupDataConnection(conn);

                conn.on('open', () => {
                    console.log('🔍 PeerJS - Connected to peer:', peerId);

                    // Start video call if we have local stream
                    if (this.localStream) {
                        this.startVideoCall(peerId);
                    }

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
     * Start video call with a peer
     */
    private startVideoCall(peerId: string): void {
        if (!this.peer || !this.localStream) {
            console.error('🔍 PeerJS - Cannot start video call: peer or stream not available');
            return;
        }

        try {
            const call = (this.peer as any).call(peerId, this.localStream);

            if (!call) {
                console.error('🔍 PeerJS - Failed to create call object');
                return;
            }

            call.on('stream', (remoteStream: MediaStream) => {
                console.log('🔍 PeerJS - Received remote stream from:', peerId);
                this.callEventSubject.next({
                    type: 'call_answered',
                    data: { remoteStream, peerId, call }
                });
            });

            call.on('close', () => {
                console.log('🔍 PeerJS - Call ended with:', peerId);
            });

            call.on('error', (error: any) => {
                console.error('🔍 PeerJS - Call error with:', peerId, error);
            });

        } catch (error) {
            console.error('🔍 PeerJS - Failed to start video call:', error);
        }
    }

    /**
     * Start a video call (simplified - no peer availability check)
     */
    async startCall(peerId: string): Promise<boolean> {
        try {
            if (!this.isPeerJSAvailable()) {
                console.error('🔍 PeerJS - PeerJS not available or disabled');
                this.callEventSubject.next({
                    type: 'connection_lost',
                    data: { error: 'PeerJS not available' }
                });
                return false;
            }

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Make the call directly without checking peer availability
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
     * Join a video room (group call)
     */
    async joinVideoRoom(roomId: string): Promise<boolean> {
        try {
            if (!this.isPeerJSAvailable()) {
                console.error('🔍 PeerJS - PeerJS not available');
                return false;
            }

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            const peerId = this.getPeerId();
            console.log('🔍 PeerJS - Joining video room:', roomId, 'with peer ID:', peerId);

            // Broadcast room join event via Socket.io
            const socket = this.socketService.getSocket();
            if (socket && peerId) {
                console.log('🔍 PeerJS - Broadcasting room join:', { roomId, peerId });
                const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
                socket.emit('join_video_room', {
                    roomId,
                    peerId,
                    userId: currentUser.id || localStorage.getItem('user_id') || 'anonymous'
                });
            } else {
                console.error('🔍 PeerJS - Socket not available for room join');
            }

            // Listen for other peers joining the room
            this.setupRoomListeners(roomId);

            // Try direct peer connection for testing (fallback)
            this.tryDirectPeerConnection(roomId);

            // Emit room join event
            this.callEventSubject.next({
                type: 'connection_established',
                data: { roomId, peerId, localStream: this.localStream }
            });

            return true;

        } catch (error) {
            console.error('🔍 PeerJS - Failed to join video room:', error);
            return false;
        }
    }

    /**
     * Setup room listeners for group video calls
     */
    private setupRoomListeners(roomId: string): void {
        const socket = this.socketService.getSocket();
        if (!socket) {
            console.log('🔍 PeerJS - Socket not available, using sessionStorage fallback');
            return;
        }

        console.log('🔍 PeerJS - Setting up room listeners for:', roomId);

        // Listen for other peers joining the room
        socket.on('peer_joined_room', (data: { roomId: string, peerId: string, userId: string, username: string }) => {
            if (data.roomId === roomId && data.peerId !== this.getPeerId()) {
                console.log('🔍 PeerJS - Peer joined room:', data.peerId, 'User:', data.username);
                this.connectToPeer(data.peerId);
            }
        });

        // Listen for peers leaving the room
        socket.on('peer_left_room', (data: { roomId: string, peerId: string }) => {
            if (data.roomId === roomId) {
                console.log('🔍 PeerJS - Peer left room:', data.peerId);
                // Handle peer disconnection
            }
        });

        // Listen for room participants list
        socket.on('room_participants', (data: { roomId: string, participants: string[] }) => {
            if (data.roomId === roomId) {
                console.log('🔍 PeerJS - Room participants:', data.participants);
                // Connect to existing participants
                data.participants.forEach((peerId: string) => {
                    if (peerId !== this.getPeerId()) {
                        console.log('🔍 PeerJS - Connecting to existing participant:', peerId);
                        this.connectToPeer(peerId);
                    }
                });
            }
        });
    }

    /**
     * Try direct peer connection for testing
     */
    private tryDirectPeerConnection(roomId: string): void {
        console.log('🔍 PeerJS - Trying direct peer connection for room:', roomId);

        // Use sessionStorage to share peer IDs between tabs
        const currentPeerId = this.getPeerId();
        if (!currentPeerId) return;

        // Store our peer ID in sessionStorage
        const roomKey = `video_room_${roomId}`;
        const existingPeers = JSON.parse(sessionStorage.getItem(roomKey) || '[]');

        if (!existingPeers.includes(currentPeerId)) {
            existingPeers.push(currentPeerId);
            sessionStorage.setItem(roomKey, JSON.stringify(existingPeers));
            console.log('🔍 PeerJS - Stored peer ID in sessionStorage:', currentPeerId);
        }

        // Try to connect to existing peers
        existingPeers.forEach((peerId: string) => {
            if (peerId !== currentPeerId) {
                console.log('🔍 PeerJS - Attempting to connect to existing peer:', peerId);
                this.connectToPeer(peerId);
            }
        });

        // Keep checking for new peers
        setTimeout(() => {
            this.tryDirectPeerConnection(roomId);
        }, 3000);
    }

    /**
     * Simple peer discovery without socket (fallback)
     */
    private simplePeerDiscovery(roomId: string): void {
        console.log('🔍 PeerJS - Starting simple peer discovery for room:', roomId);

        // Store our peer ID in localStorage for other tabs to find
        const roomKey = `video_room_${roomId}`;
        const currentPeerId = this.getPeerId();

        if (currentPeerId) {
            localStorage.setItem(roomKey, currentPeerId);
            console.log('🔍 PeerJS - Stored peer ID in localStorage:', currentPeerId);
        }

        // Try to find other peers in the same room
        setTimeout(() => {
            this.findRoomPeers(roomId);
        }, 1000);
    }

    /**
     * Find other peers in the room
     */
    private findRoomPeers(roomId: string): void {
        const roomKey = `video_room_${roomId}`;
        const storedPeerId = localStorage.getItem(roomKey);
        const currentPeerId = this.getPeerId();

        console.log('🔍 PeerJS - Looking for room peers:', { roomId, storedPeerId, currentPeerId });

        if (storedPeerId && storedPeerId !== currentPeerId) {
            console.log('🔍 PeerJS - Found peer in room:', storedPeerId);
            this.connectToPeer(storedPeerId);
        } else {
            console.log('🔍 PeerJS - No other peers found in room yet, will keep checking...');
            // Keep checking for new peers every 2 seconds
            setTimeout(() => {
                this.findRoomPeers(roomId);
            }, 2000);
        }
    }

    /**
     * Auto-answer incoming call for group video calls
     */
    private async answerIncomingCall(call: any): Promise<void> {
        try {
            console.log('🔍 PeerJS - Auto-answering incoming call from:', call.peer);

            // Get user media if not already available
            if (!this.localStream) {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            }

            // Answer the call
            call.answer(this.localStream);

            call.on('stream', (remoteStream: MediaStream) => {
                console.log('🔍 PeerJS - Received remote stream from:', call.peer);
                this.callEventSubject.next({
                    type: 'call_answered',
                    data: { remoteStream, peerId: call.peer, call }
                });
            });

            call.on('close', () => {
                console.log('🔍 PeerJS - Call ended with:', call.peer);
                this.endCall();
            });

            call.on('error', (error: any) => {
                console.error('🔍 PeerJS - Call error with:', call.peer, error);
            });

        } catch (error) {
            console.error('🔍 PeerJS - Failed to auto-answer call:', error);
        }
    }

    /**
     * Answer an incoming call (manual)
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
        // Batch cleanup operations to improve performance
        this.performBatchCleanup();

        this.callEventSubject.next({
            type: 'call_ended',
            data: null
        });
    }

    /**
     * Perform batch cleanup operations
     */
    private performBatchCleanup(): void {
        // Close connections
        if (this.currentCall) {
            this.currentCall.close();
            this.currentCall = null;
        }

        if (this.currentConnection) {
            this.currentConnection.close();
            this.currentConnection = null;
        }

        // Stop media streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Batch cleanup storage data
        this.cleanupStorageData();
    }

    /**
     * Clean up storage data efficiently
     */
    private cleanupStorageData(): void {
        // Use requestIdleCallback for non-critical cleanup
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
                this.cleanupStorageDataSync();
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.cleanupStorageDataSync();
            }, 0);
        }
    }

    /**
     * Synchronous storage cleanup
     */
    private cleanupStorageDataSync(): void {
        // Clean up localStorage room data
        const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('video_room_'));
        roomKeys.forEach(key => localStorage.removeItem(key));

        // Clean up sessionStorage room data
        const sessionRoomKeys = Object.keys(sessionStorage).filter(key => key.startsWith('video_room_'));
        sessionRoomKeys.forEach(key => sessionStorage.removeItem(key));
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
     * Check if PeerJS is enabled and working
     */
    isPeerJSAvailable(): boolean {
        return this.isPeerJSEnabled && this.peer !== null && (this.peer as any).id !== undefined;
    }

    /**
     * Retry PeerJS connection
     */
    retryConnection(): void {
        if (this.peer) {
            this.peer.destroy();
        }
        this.peer = null;
        this.isPeerJSEnabled = true;

        setTimeout(() => {
            this.initializePeer();
        }, 2000);
    }

    /**
     * Generate room ID based on channel
     */
    generateRoomId(channelId: string): string {
        return `room_${channelId}`;
    }

    /**
     * Start group video call for a channel
     */
    async startGroupVideoCall(channelId: string): Promise<boolean> {
        const roomId = this.generateRoomId(channelId);
        return await this.joinVideoRoom(roomId);
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
        console.log('🔍 PeerJS - Destroying service and cleaning up resources');

        this.endCall();

        if (this.currentConnection) {
            this.currentConnection.close();
            this.currentConnection = null;
        }

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        // Stop all media streams
        if (this.localStream) {
            this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            this.localStream = null;
        }
    }
}
