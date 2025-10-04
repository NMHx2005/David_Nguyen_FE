import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface SocketMessage {
    _id: string;
    channelId: string;
    userId: string;
    username: string;
    text: string;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    createdAt: string;
}

export interface UserPresence {
    userId: string;
    username: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    currentChannel?: string;
    lastSeen: string;
}

export interface ChannelJoin {
    channelId: string;
    userId: string;
    username: string;
}

export interface ChannelLeave {
    channelId: string;
    userId: string;
    username: string;
}

export interface TypingIndicator {
    channelId: string;
    userId: string;
    username: string;
    isTyping: boolean;
}

export interface VideoCallOffer {
    callId: string;
    callerId: string;
    callerName: string;
    channelId: string;
    offer: RTCSessionDescriptionInit;
}

export interface VideoCallAnswer {
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
export class SocketService {
    private socket: Socket | null = null;
    private isConnected = false;
    private connectionSubject = new BehaviorSubject<boolean>(false);
    private messageSubject = new Subject<SocketMessage>();
    private userJoinedSubject = new Subject<ChannelJoin>();
    private userLeftSubject = new Subject<ChannelLeave>();
    private typingSubject = new Subject<TypingIndicator>();
    private presenceSubject = new Subject<UserPresence>();
    private videoCallSubject = new Subject<any>();

    public connection$ = this.connectionSubject.asObservable();
    public message$ = this.messageSubject.asObservable();
    public userJoined$ = this.userJoinedSubject.asObservable();
    public userLeft$ = this.userLeftSubject.asObservable();
    public typing$ = this.typingSubject.asObservable();
    public presence$ = this.presenceSubject.asObservable();
    public videoCall$ = this.videoCallSubject.asObservable();

    constructor(private authService: AuthService) { }

    /**
     * Check if server is available
     */
    private async checkServerStatus(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${environment.apiUrl.replace('/api', '')}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.warn('Server health check failed:', error);
            return false;
        }
    }

    /**
     * Connect to socket server
     */
    async connect(): Promise<void> {
        if (this.socket?.connected) {
            return;
        }

        // Ensure user data is loaded from localStorage
        this.authService.ensureUserLoaded();

        const token = this.authService.getToken();
        const user = this.authService.getCurrentUser();

        console.log('🔍 SocketService.connect - Token:', token ? 'present' : 'missing');
        console.log('🔍 SocketService.connect - User:', user ? 'present' : 'missing');

        if (!token || !user) {
            console.error('Cannot connect to socket: No authentication token or user');
            console.error('🔍 SocketService.connect - Token:', token);
            console.error('🔍 SocketService.connect - User:', user);
            return;
        }

        // Check server status before connecting
        const serverAvailable = await this.checkServerStatus();
        if (!serverAvailable) {
            console.warn('Server is not available, will retry connection...');
        }

        this.socket = io(environment.socketUrl, {
            auth: {
                token,
                userId: user.id,
                username: user.username
            },
            transports: ['polling', 'websocket'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            forceNew: true,
            upgrade: true,
            rememberUpgrade: true,
            autoConnect: true,
            withCredentials: true
        });

        this.setupEventListeners();
    }

    /**
     * Disconnect from socket server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.connectionSubject.next(false);
        }
    }

    /**
     * Join a channel
     */
    joinChannel(channelId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('join_channel', { channelId });
        }
    }

    /**
     * Leave a channel
     */
    leaveChannel(channelId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_channel', { channelId });
        }
    }

    /**
     * Send a message
     */
    sendMessage(message: {
        channelId: string;
        text: string;
        type: 'text' | 'image' | 'file';
        imageUrl?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
    }): void {
        if (this.socket?.connected) {
            this.socket.emit('send_message', message);
        }
    }

    /**
     * Send typing indicator
     */
    sendTyping(channelId: string, isTyping: boolean): void {
        if (this.socket?.connected) {
            this.socket.emit('typing', { channelId, isTyping });
        }
    }

    /**
     * Update user presence
     */
    updatePresence(status: 'online' | 'away' | 'busy' | 'offline', currentChannel?: string): void {
        if (this.socket?.connected) {
            this.socket.emit('update_presence', { status, currentChannel });
        }
    }

    /**
     * Initiate video call
     */
    initiateVideoCall(data: {
        recipientId: string;
        channelId: string;
    }): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_initiate', data);
        }
    }

    /**
     * Answer video call
     */
    answerVideoCall(callId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_answer', { callId });
        }
    }

    /**
     * Reject video call
     */
    rejectVideoCall(callId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_reject', { callId });
        }
    }

    /**
     * End video call
     */
    endVideoCall(callId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_end', { callId });
        }
    }

    /**
     * Send video call offer
     */
    sendVideoCallOffer(data: VideoCallOffer): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_offer', data);
        }
    }

    /**
     * Send video call answer
     */
    sendVideoCallAnswer(data: VideoCallAnswer): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_answer', data);
        }
    }

    /**
     * Send ICE candidate
     */
    sendIceCandidate(data: IceCandidate): void {
        if (this.socket?.connected) {
            this.socket.emit('video_call_ice_candidate', data);
        }
    }

    /**
     * Get connection status
     */
    isSocketConnected(): boolean {
        return this.isConnected && this.socket?.connected === true;
    }

    /**
     * Setup socket event listeners
     */
    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected = true;
            this.connectionSubject.next(true);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
            this.connectionSubject.next(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.connectionSubject.next(false);

            // Don't spam console with repeated connection errors
            if (error instanceof Error && 'type' in error && error.type === 'TransportError') {
                console.warn('Socket transport error - server may be unavailable. Retrying...');
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`Socket reconnected after ${attemptNumber} attempts`);
            this.isConnected = true;
            this.connectionSubject.next(true);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`Socket reconnection attempt ${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed - giving up');
            this.isConnected = false;
            this.connectionSubject.next(false);
        });

        // Message events
        this.socket.on('new_message', (message: SocketMessage) => {
            this.messageSubject.next(message);
        });

        this.socket.on('message_edited', (message: SocketMessage) => {
            this.messageSubject.next(message);
        });

        this.socket.on('message_deleted', (data: { messageId: string; channelId: string }) => {
            // Handle message deletion
            console.log('Message deleted:', data);
        });

        // Channel events
        this.socket.on('user_joined_channel', (data: ChannelJoin) => {
            this.userJoinedSubject.next(data);
        });

        this.socket.on('user_left_channel', (data: ChannelLeave) => {
            this.userLeftSubject.next(data);
        });

        // Typing events
        this.socket.on('user_typing', (data: TypingIndicator) => {
            this.typingSubject.next(data);
        });

        // Presence events
        this.socket.on('user_presence_update', (presence: UserPresence) => {
            this.presenceSubject.next(presence);
        });

        // Video call events
        this.socket.on('video_call_incoming', (data: any) => {
            this.videoCallSubject.next({ type: 'incoming', data });
        });

        this.socket.on('video_call_initiated', (data: any) => {
            this.videoCallSubject.next({ type: 'initiated', data });
        });

        this.socket.on('video_call_answered', (data: any) => {
            this.videoCallSubject.next({ type: 'answered', data });
        });

        this.socket.on('video_call_rejected', (data: any) => {
            this.videoCallSubject.next({ type: 'rejected', data });
        });

        this.socket.on('video_call_ended', (data: any) => {
            this.videoCallSubject.next({ type: 'ended', data });
        });

        this.socket.on('video_call_offer', (data: VideoCallOffer) => {
            this.videoCallSubject.next({ type: 'offer', data });
        });

        this.socket.on('video_call_answer', (data: VideoCallAnswer) => {
            this.videoCallSubject.next({ type: 'answer', data });
        });

        this.socket.on('video_call_ice_candidate', (data: IceCandidate) => {
            this.videoCallSubject.next({ type: 'ice_candidate', data });
        });

        this.socket.on('video_call_error', (error: any) => {
            this.videoCallSubject.next({ type: 'error', data: error });
        });

        // Error events
        this.socket.on('error', (error: any) => {
            console.error('Socket error:', error);
        });

        this.socket.on('auth_error', (error: any) => {
            console.error('Socket auth error:', error);
            // Handle authentication error - maybe redirect to login
        });
    }

    /**
     * Reconnect socket
     */
    reconnect(): void {
        this.disconnect();
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    /**
     * Get socket instance (for advanced usage)
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}