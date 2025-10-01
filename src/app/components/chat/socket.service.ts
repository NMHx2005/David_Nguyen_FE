import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SocketMessage {
    channelId: string;
    message: {
        _id: string;
        channelId: string;
        userId: {
            _id: string;
            username: string;
            avatarUrl?: string;
        };
        username: string;
        text: string;
        type: 'text' | 'image' | 'file';
        imageUrl?: string;
        fileUrl?: string;
        createdAt: string;
    };
}

export interface SocketUser {
    userId: string;
    username: string;
    isOnline: boolean;
    currentChannel?: string;
}

export interface ChannelUsers {
    channelId: string;
    users: SocketUser[];
}

export interface TypingUser {
    channelId: string;
    userId: string;
    username: string;
    isTyping: boolean;
}

export interface JoinChannelData {
    channelId: string;
    channelName: string;
}

export interface SendMessageData {
    channelId: string;
    text: string;
    type?: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    public socket: Socket | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Observables for real-time data
    private onlineUsersSubject = new BehaviorSubject<SocketUser[]>([]);
    private onlineUsersCountSubject = new BehaviorSubject<number>(0);
    private channelUsersSubject = new BehaviorSubject<ChannelUsers | null>(null);
    private newMessageSubject = new BehaviorSubject<SocketMessage | null>(null);
    private previousMessagesSubject = new BehaviorSubject<SocketMessage[]>([]);
    private userJoinedSubject = new BehaviorSubject<{ channelId: string; userId: string; username: string; message: string } | null>(null);
    private userLeftSubject = new BehaviorSubject<{ channelId: string; userId: string; username: string; message: string } | null>(null);
    private typingUsersSubject = new BehaviorSubject<TypingUser[]>([]);
    private errorSubject = new BehaviorSubject<string | null>(null);

    // Public observables
    public onlineUsers$ = this.onlineUsersSubject.asObservable();
    public onlineUsersCount$ = this.onlineUsersCountSubject.asObservable();
    public channelUsers$ = this.channelUsersSubject.asObservable();
    public newMessage$ = this.newMessageSubject.asObservable();
    public previousMessages$ = this.previousMessagesSubject.asObservable();
    public userJoined$ = this.userJoinedSubject.asObservable();
    public userLeft$ = this.userLeftSubject.asObservable();
    public typingUsers$ = this.typingUsersSubject.asObservable();
    public error$ = this.errorSubject.asObservable();

    constructor() {
        this.initializeSocket();
    }

    private initializeSocket(): void {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.warn('No access token found, cannot initialize socket');
            return;
        }

        this.socket = io(environment.apiUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
            this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.errorSubject.next('Connection failed. Please try again.');
        });

        // Real-time data events
        this.socket.on('online_users', (users: SocketUser[]) => {
            this.onlineUsersSubject.next(users);
        });

        this.socket.on('online_users_count', (data: { count: number }) => {
            this.onlineUsersCountSubject.next(data.count);
        });

        this.socket.on('channel_users', (data: ChannelUsers) => {
            this.channelUsersSubject.next(data);
        });

        this.socket.on('new_message', (data: SocketMessage) => {
            this.newMessageSubject.next(data);
        });

        this.socket.on('previous_messages', (data: { channelId: string; messages: SocketMessage[] }) => {
            this.previousMessagesSubject.next(data.messages);
        });

        this.socket.on('user_joined', (data: { channelId: string; userId: string; username: string; message: string }) => {
            this.userJoinedSubject.next(data);
        });

        this.socket.on('user_left', (data: { channelId: string; userId: string; username: string; message: string }) => {
            this.userLeftSubject.next(data);
        });

        this.socket.on('user_typing', (data: TypingUser) => {
            const currentTyping = this.typingUsersSubject.value;
            const existingIndex = currentTyping.findIndex(
                user => user.userId === data.userId && user.channelId === data.channelId
            );

            if (data.isTyping) {
                if (existingIndex === -1) {
                    this.typingUsersSubject.next([...currentTyping, data]);
                }
            } else {
                if (existingIndex !== -1) {
                    const updatedTyping = currentTyping.filter(
                        user => !(user.userId === data.userId && user.channelId === data.channelId)
                    );
                    this.typingUsersSubject.next(updatedTyping);
                }
            }
        });

        this.socket.on('user_stop_typing', (data: { channelId: string; userId: string; username: string }) => {
            const currentTyping = this.typingUsersSubject.value;
            const updatedTyping = currentTyping.filter(
                user => !(user.userId === data.userId && user.channelId === data.channelId)
            );
            this.typingUsersSubject.next(updatedTyping);
        });

        this.socket.on('error', (data: { message: string }) => {
            this.errorSubject.next(data.message);
        });
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.initializeSocket();
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
            this.errorSubject.next('Connection lost. Please refresh the page.');
        }
    }

    // Public methods
    public connect(): void {
        if (!this.socket || !this.isConnected) {
            this.initializeSocket();
        }
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    public joinChannel(data: JoinChannelData): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_channel', data);
        } else {
            console.error('Socket not connected');
            this.errorSubject.next('Not connected to server');
        }
    }

    public leaveChannel(channelId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave_channel', { channelId });
        }
    }

    public sendMessage(data: SendMessageData): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('send_message', data);
        } else {
            console.error('Socket not connected');
            this.errorSubject.next('Not connected to server');
        }
    }

    public startTyping(channelId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing', { channelId, isTyping: true });
        }
    }

    public stopTyping(channelId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('stop_typing', { channelId });
        }
    }

    public getOnlineUsers(): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('get_online_users');
        }
    }

    public getChannelUsers(channelId: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('get_channel_users', { channelId });
        }
    }

    // Getters
    public get isSocketConnected(): boolean {
        return this.isConnected;
    }

    public get socketId(): string | undefined {
        return this.socket?.id;
    }

    // Clear subjects (useful for cleanup)
    public clearSubjects(): void {
        this.onlineUsersSubject.next([]);
        this.onlineUsersCountSubject.next(0);
        this.channelUsersSubject.next(null);
        this.newMessageSubject.next(null);
        this.previousMessagesSubject.next([]);
        this.userJoinedSubject.next(null);
        this.userLeftSubject.next(null);
        this.typingUsersSubject.next([]);
        this.errorSubject.next(null);
    }
}
