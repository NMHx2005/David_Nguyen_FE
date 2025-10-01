import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientLayoutComponent } from '../layouts/client-layout.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ImageUploadComponent } from '../ui/image-upload.component';
import { VideoCallButtonComponent } from '../video-call/video-call-button.component';
import { VideoCallComponent } from '../video-call/video-call.component';
import { AuthService } from '../../services/auth.service';
import { SocketService, SocketMessage, SocketUser, ChannelUsers, TypingUser } from '../../services/socket.service';
import { VideoCallService } from '../../services/video-call.service';
import { ChannelsService } from '../../services/client/channels.service';
import { GroupsInterestService } from '../../services/client/groups-interest.service';
import { UploadService, UploadResponse } from '../../services/upload.service';
import { Group } from '../../models/group.model';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

interface Channel {
    _id: string;
    name: string;
    description: string;
    groupId: string;
    isPrivate: boolean;
}

interface GroupWithChannels extends Omit<Group, 'channels'> {
    channels: Channel[];
}

@Component({
    selector: 'app-realtime-chat',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatListModule,
        MatDividerModule,
        MatBadgeModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        ImageUploadComponent,
        VideoCallButtonComponent,
        VideoCallComponent,
        ClientLayoutComponent
    ],
    template: `
    <app-client-layout pageTitle="Real-time Chat" pageDescription="Connect with your teams and groups">
      <div class="chat-layout">
        <!-- Left Sidebar - Groups List -->
        <div class="chat-sidebar">
          <mat-card class="sidebar-card">
            <!-- Search Groups -->
            <div class="sidebar-header">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search groups...</mat-label>
                <input matInput [(ngModel)]="searchTerm" (input)="filterGroups()" placeholder="Search groups">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>

            <!-- Groups List -->
            <div class="groups-list">
              <div *ngIf="loadingGroups" class="loading-container">
                <mat-spinner diameter="30"></mat-spinner>
                <p>Loading groups...</p>
              </div>

              <div *ngIf="!loadingGroups && filteredGroups.length === 0" class="no-groups">
                <mat-icon>group_work</mat-icon>
                <p>No groups found</p>
              </div>

              <mat-nav-list *ngIf="!loadingGroups && filteredGroups.length > 0">
                <div *ngFor="let group of filteredGroups" class="group-item">
                  <a mat-list-item (click)="selectGroup(group)" [class.selected]="selectedGroup?.id === group.id">
                    <mat-icon matListItemIcon>group_work</mat-icon>
                    <span matListItemTitle>{{ group.name }}</span>
                    <span matListItemLine>{{ group.description }}</span>
                    <mat-badge [matBadge]="group.channels.length" matBadgeColor="primary" matBadgeSize="small">
                      <mat-icon>chat</mat-icon>
                    </mat-badge>
                  </a>

                  <!-- Channels in Group -->
                  <div *ngIf="selectedGroup?.id === group.id" class="channels-list">
                    <div *ngFor="let channel of group.channels" 
                         class="channel-item"
                         (click)="selectChannel(channel)"
                         [class.selected]="selectedChannel?._id === channel._id">
                      <mat-icon [class]="channel.isPrivate ? 'private-channel' : 'public-channel'">
                        {{ channel.isPrivate ? 'lock' : 'public' }}
                      </mat-icon>
                      <span>{{ channel.name }}</span>
                      <mat-icon *ngIf="channel.isPrivate" class="private-icon">lock</mat-icon>
                    </div>
                  </div>
                </div>
              </mat-nav-list>
            </div>
          </mat-card>
        </div>

        <!-- Main Chat Area -->
        <div class="chat-main">
          <!-- No Channel Selected -->
          <div *ngIf="!selectedChannel" class="no-channel-selected">
            <mat-card class="welcome-card">
              <mat-icon class="welcome-icon">chat</mat-icon>
              <h2>Welcome to Real-time Chat</h2>
              <p>Select a group and channel to start chatting</p>
              <div class="connection-status">
                <mat-icon [class]="socketService.isSocketConnected ? 'connected' : 'disconnected'">
                  {{ socketService.isSocketConnected ? 'wifi' : 'wifi_off' }}
                </mat-icon>
                <span [class]="socketService.isSocketConnected ? 'connected' : 'disconnected'">
                  {{ socketService.isSocketConnected ? 'Connected' : 'Disconnected' }}
                </span>
              </div>
            </mat-card>
          </div>

          <!-- Channel Selected -->
          <div *ngIf="selectedChannel" class="channel-chat">
            <!-- Channel Header -->
            <div class="channel-header">
              <mat-card class="header-card">
                <div class="header-content">
                  <div class="channel-info">
                    <mat-icon [class]="selectedChannel.isPrivate ? 'private-channel' : 'public-channel'">
                      {{ selectedChannel.isPrivate ? 'lock' : 'public' }}
                    </mat-icon>
                    <div>
                      <h3>{{ selectedChannel.name }}</h3>
                      <p>{{ selectedChannel.description }}</p>
                    </div>
                  </div>
                  
                  <div class="channel-stats">
                    <div class="online-users">
                      <mat-icon>people</mat-icon>
                      <span>{{ channelUsers?.users?.length || 0 }} online</span>
                    </div>
                    <div class="typing-indicator" *ngIf="typingUsers.length > 0">
                      <span>{{ getTypingText() }}</span>
                    </div>
                    <button mat-icon-button (click)="toggleUserList()" matTooltip="Show online users">
                      <mat-icon>list</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-card>
            </div>

            <!-- Online Users List -->
            <div *ngIf="showUserList && channelUsers?.users" class="users-list">
              <mat-card class="users-card">
                <mat-card-header>
                  <mat-card-title>Online Users</mat-card-title>
                  <button mat-icon-button (click)="toggleUserList()" class="close-button">
                    <mat-icon>close</mat-icon>
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <mat-list>
                    <mat-list-item *ngFor="let user of channelUsers.users" class="user-item">
                      <div class="user-info">
                        <mat-icon matListItemIcon>person</mat-icon>
                        <span matListItemTitle>{{ user.username }}</span>
                        <span matListItemLine [class]="user.isOnline ? 'online' : 'offline'">
                          {{ user.isOnline ? 'Online' : 'Offline' }}
                        </span>
                      </div>
                      <div class="user-actions">
                        <app-video-call-button
                          [userId]="user.userId"
                          [username]="user.username"
                          [channelId]="selectedChannel._id"
                          [disabled]="user.userId === currentUserId || !user.isOnline"
                          [isOnline]="user.isOnline"
                          buttonType="initiate"
                          (videoCallInitiated)="onVideoCallInitiated($event)">
                        </app-video-call-button>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Messages Area -->
            <div class="messages-container" #messagesContainer>
              <div *ngIf="loadingMessages" class="loading-messages">
                <mat-spinner diameter="30"></mat-spinner>
                <p>Loading messages...</p>
              </div>

              <div *ngIf="!loadingMessages && messages.length === 0" class="no-messages">
                <mat-icon>chat_bubble_outline</mat-icon>
                <p>No messages yet. Start the conversation!</p>
              </div>

              <div *ngIf="!loadingMessages && messages.length > 0" class="messages-list">
                <div *ngFor="let message of messages; trackBy: trackByMessageId" 
                     class="message-item"
                     [class.own-message]="message.message.userId._id === currentUserId">
                  
                  <div class="message-avatar">
                    <img *ngIf="message.message.userId.avatarUrl" 
                         [src]="message.message.userId.avatarUrl" 
                         [alt]="message.message.userId.username"
                         class="avatar">
                    <mat-icon *ngIf="!message.message.userId.avatarUrl" class="default-avatar">
                      person
                    </mat-icon>
                  </div>

                  <div class="message-content">
                    <div class="message-header">
                      <span class="username">{{ message.message.userId.username }}</span>
                      <span class="timestamp">{{ formatTime(message.message.createdAt) }}</span>
                    </div>
                    
                    <div class="message-text">
                      <p *ngIf="message.message.type === 'text'">{{ message.message.text }}</p>
                      <div *ngIf="message.message.type === 'image'" class="message-image">
                        <img [src]="message.message.imageUrl" [alt]="message.message.text">
                      </div>
                      <div *ngIf="message.message.type === 'file'" class="message-file">
                        <mat-icon>attach_file</mat-icon>
                        <a [href]="message.message.fileUrl" target="_blank">{{ message.message.text }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input">
              <mat-card class="input-card">
                <div class="input-container">
                  <mat-form-field appearance="outline" class="message-field">
                    <mat-label>Type your message...</mat-label>
                    <input matInput 
                           [(ngModel)]="newMessage" 
                           (keydown)="onKeyDown($event)"
                           (input)="onTyping()"
                           placeholder="Type your message..."
                           [disabled]="!socketService.isSocketConnected">
                  </mat-form-field>
                  
                  <app-image-upload
                    (imageUploaded)="onImageUploaded($event)"
                    (uploadError)="onUploadError($event)">
                  </app-image-upload>
                  
                  <button mat-fab 
                          color="primary" 
                          (click)="sendMessage()"
                          [disabled]="!newMessage.trim() || !socketService.isSocketConnected">
                    <mat-icon>send</mat-icon>
                  </button>
                </div>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </app-client-layout>
  `,
    styles: [`
    .chat-layout {
      display: flex;
      height: calc(100vh - 64px);
      gap: 16px;
      padding: 16px;
    }

    .chat-sidebar {
      width: 300px;
      flex-shrink: 0;
    }

    .sidebar-card {
      height: 100%;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .search-field {
      width: 100%;
    }

    .groups-list {
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .loading-container, .no-groups {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #666;
    }

    .group-item {
      border-bottom: 1px solid #f0f0f0;
    }

    .group-item a {
      padding: 12px 16px;
    }

    .group-item a.selected {
      background-color: #e3f2fd;
    }

    .channels-list {
      background-color: #f8f9fa;
      border-left: 3px solid #2196f3;
    }

    .channel-item {
      display: flex;
      align-items: center;
      padding: 8px 16px 8px 32px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .channel-item:hover {
      background-color: #e9ecef;
    }

    .channel-item.selected {
      background-color: #e3f2fd;
      font-weight: 500;
    }

    .channel-item mat-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    .public-channel {
      color: #4caf50;
    }

    .private-channel {
      color: #ff9800;
    }

    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .no-channel-selected {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .welcome-card {
      text-align: center;
      padding: 40px;
      max-width: 400px;
    }

    .welcome-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #2196f3;
      margin-bottom: 16px;
    }

    .connection-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
    }

    .connected {
      color: #4caf50;
    }

    .disconnected {
      color: #f44336;
    }

    .channel-chat {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .channel-header {
      margin-bottom: 16px;
    }

    .header-card {
      padding: 16px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .channel-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .channel-info h3 {
      margin: 0;
      font-size: 18px;
    }

    .channel-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .channel-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .online-users {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 14px;
    }

    .typing-indicator {
      color: #2196f3;
      font-style: italic;
      font-size: 12px;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 16px;
    }

    .loading-messages, .no-messages {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      text-align: center;
      color: #666;
    }

    .messages-list {
      padding: 16px;
    }

    .message-item {
      display: flex;
      margin-bottom: 16px;
      gap: 12px;
    }

    .message-item.own-message {
      flex-direction: row-reverse;
    }

    .message-item.own-message .message-content {
      background-color: #2196f3;
      color: white;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .default-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .message-content {
      background-color: #f5f5f5;
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 70%;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .username {
      font-weight: 500;
      font-size: 14px;
    }

    .timestamp {
      font-size: 12px;
      opacity: 0.7;
    }

    .message-text p {
      margin: 0;
      word-wrap: break-word;
    }

    .message-image img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
    }

    .message-file {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message-file a {
      color: inherit;
      text-decoration: none;
    }

    .message-file a:hover {
      text-decoration: underline;
    }

    .message-input {
      flex-shrink: 0;
    }

    .input-card {
      padding: 16px;
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .message-field {
      flex: 1;
    }

    .input-container button {
      flex-shrink: 0;
    }

    /* User list styles */
    .users-list {
      margin-bottom: 16px;
    }

    .users-card {
      max-height: 300px;
      overflow-y: auto;
    }

    .users-card .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-button {
      margin-left: auto;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .user-info mat-icon {
      margin-right: 12px;
    }

    .user-actions {
      display: flex;
      align-items: center;
    }

    .online {
      color: #4caf50;
    }

    .offline {
      color: #f44336;
    }

    /* Video call dialog styles */
    :host ::ng-deep .video-call-dialog .mat-dialog-container {
      padding: 0;
      max-width: 100vw;
      max-height: 100vh;
      width: 100vw;
      height: 100vh;
    }
  `]
})
export class RealtimeChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    private destroy$ = new Subject<void>();
    private typingTimeout: any;

    // Services
    authService = inject(AuthService);
    socketService = inject(SocketService);
    channelsService = inject(ChannelsService);
    groupsService = inject(GroupsInterestService);
    uploadService = inject(UploadService);
    videoCallService = inject(VideoCallService);
    snackBar = inject(MatSnackBar);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private dialog = inject(MatDialog);

    // ViewChild
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    // Component state
    loadingGroups = false;
    loadingMessages = false;
    groups: GroupWithChannels[] = [];
    filteredGroups: GroupWithChannels[] = [];
    selectedGroup: GroupWithChannels | null = null;
    selectedChannel: Channel | null = null;
    messages: SocketMessage[] = [];
    newMessage = '';
    searchTerm = '';
    currentUserId = '';

    // Socket data
    channelUsers: ChannelUsers | null = null;
    typingUsers: TypingUser[] = [];
    showUserList: boolean = false;

    ngOnInit(): void {
        this.currentUserId = this.authService.getCurrentUser()?.id || '';
        this.loadGroups();
        this.setupSocketSubscriptions();
        this.setupVideoCallSubscriptions();
        this.socketService.connect();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.socketService.disconnect();
    }

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    private setupSocketSubscriptions(): void {
        // New message subscription
        this.socketService.newMessage$
            .pipe(takeUntil(this.destroy$))
            .subscribe(message => {
                if (message && message.channelId === this.selectedChannel?._id) {
                    this.messages.push(message);
                }
            });

        // Previous messages subscription
        this.socketService.previousMessages$
            .pipe(takeUntil(this.destroy$))
            .subscribe(messages => {
                this.messages = messages;
                this.loadingMessages = false;
            });

        // Channel users subscription
        this.socketService.channelUsers$
            .pipe(takeUntil(this.destroy$))
            .subscribe(channelUsers => {
                if (channelUsers && channelUsers.channelId === this.selectedChannel?._id) {
                    this.channelUsers = channelUsers;
                }
            });

        // Typing users subscription
        this.socketService.typingUsers$
            .pipe(takeUntil(this.destroy$))
            .subscribe(typingUsers => {
                this.typingUsers = typingUsers.filter(user => user.channelId === this.selectedChannel?._id);
            });

        // User joined/left subscriptions
        this.socketService.userJoined$
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                if (data && data.channelId === this.selectedChannel?._id) {
                    this.snackBar.open(data.message, 'Close', { duration: 3000 });
                }
            });

        this.socketService.userLeft$
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                if (data && data.channelId === this.selectedChannel?._id) {
                    this.snackBar.open(data.message, 'Close', { duration: 3000 });
                }
            });

        // Error subscription
        this.socketService.error$
            .pipe(takeUntil(this.destroy$))
            .subscribe(error => {
                if (error) {
                    this.snackBar.open(error, 'Close', { duration: 5000 });
                }
            });
    }

    private async loadGroups(): Promise<void> {
        try {
            this.loadingGroups = true;
            const response = await this.groupsService.getUserGroups().toPromise();
            const groups = response?.groups || [];

            // Map groups to include channels
            this.groups = groups.map(group => ({
                ...group,
                channels: group.channels.map((channelId: string, index: number) => ({
                    _id: channelId,
                    name: `Channel ${index + 1}`,
                    description: `Channel in ${group.name}`,
                    groupId: group.id,
                    isPrivate: false
                }))
            }));

            this.filteredGroups = [...this.groups];
        } catch (error) {
            console.error('Error loading groups:', error);
            this.snackBar.open('Failed to load groups', 'Close', { duration: 3000 });
        } finally {
            this.loadingGroups = false;
        }
    }

    filterGroups(): void {
        if (!this.searchTerm.trim()) {
            this.filteredGroups = [...this.groups];
        } else {
            this.filteredGroups = this.groups.filter(group =>
                group.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                group.description.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
    }

    selectGroup(group: GroupWithChannels): void {
        this.selectedGroup = group;
        this.selectedChannel = null;
        this.messages = [];
    }

    selectChannel(channel: Channel): void {
        if (this.selectedChannel?._id === channel._id) return;

        this.selectedChannel = channel;
        this.messages = [];
        this.loadingMessages = true;

        // Join channel via socket
        this.socketService.joinChannel({
            channelId: channel._id,
            channelName: channel.name
        });

        // Get channel users
        this.socketService.getChannelUsers(channel._id);
    }

    sendMessage(): void {
        if (!this.newMessage.trim() || !this.selectedChannel || !this.socketService.isSocketConnected) {
            return;
        }

        this.socketService.sendMessage({
            channelId: this.selectedChannel._id,
            text: this.newMessage.trim(),
            type: 'text'
        });

        this.newMessage = '';
        this.stopTyping();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    onTyping(): void {
        if (!this.selectedChannel || !this.socketService.isSocketConnected) return;

        this.socketService.startTyping(this.selectedChannel._id);

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set new timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    private stopTyping(): void {
        if (this.selectedChannel && this.socketService.isSocketConnected) {
            this.socketService.stopTyping(this.selectedChannel._id);
        }
    }

    getTypingText(): string {
        if (this.typingUsers.length === 0) return '';

        const usernames = this.typingUsers.map(user => user.username);
        if (usernames.length === 1) {
            return `${usernames[0]} is typing...`;
        } else if (usernames.length === 2) {
            return `${usernames[0]} and ${usernames[1]} are typing...`;
        } else {
            return `${usernames[0]} and ${usernames.length - 1} others are typing...`;
        }
    }

    trackByMessageId(index: number, message: SocketMessage): string {
        return message.message._id;
    }

    formatTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    private scrollToBottom(): void {
        if (this.messagesContainer) {
            const element = this.messagesContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }

    onImageUploaded(response: UploadResponse): void {
        if (response.success && this.selectedChannel) {
            // Send image message via socket
            this.socketService.sendMessage({
                channelId: this.selectedChannel._id,
                text: 'Image',
                type: 'image',
                imageUrl: response.data.imageUrl
            });
        }
    }

    onUploadError(error: string): void {
        this.snackBar.open(error, 'Close', { duration: 3000 });
    }

    // Video call methods
    toggleUserList(): void {
        this.showUserList = !this.showUserList;
    }

    onVideoCallInitiated(event: { userId: string; username: string; channelId: string }): void {
        if (this.selectedChannel) {
            this.videoCallService.initiateCall(event.userId, event.channelId);
            this.openVideoCallDialog();
        }
    }

    private openVideoCallDialog(): void {
        const dialogRef = this.dialog.open(VideoCallComponent, {
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'video-call-dialog',
            disableClose: true,
            data: { isIncomingCall: false }
        });

        dialogRef.afterClosed().subscribe(() => {
            // Handle dialog close
        });
    }

    private setupVideoCallSubscriptions(): void {
        // Listen for incoming video calls
        this.videoCallService.incomingCall$
            .pipe(takeUntil(this.destroy$))
            .subscribe(incomingCall => {
                if (incomingCall) {
                    this.openIncomingCallDialog(incomingCall);
                }
            });
    }

    private openIncomingCallDialog(incomingCall: any): void {
        const dialogRef = this.dialog.open(VideoCallComponent, {
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'video-call-dialog',
            disableClose: true,
            data: { isIncomingCall: true, incomingCall }
        });

        dialogRef.afterClosed().subscribe(() => {
            // Handle dialog close
        });
    }
}
