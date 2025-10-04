import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ImageUploadComponent } from '../../shared/Common/image-upload.component';
import { MessageDisplayComponent } from '../../shared/Common/message-display.component';
import { VideoCallComponent } from '../../video-call/video-call.component';
import { VideoCallButtonComponent } from '../../video-call/video-call-button.component';
import { AuthService } from '../../auth/auth.service';
import { SocketService, SocketMessage, UserPresence, ChannelJoin, ChannelLeave, TypingIndicator } from '../../../services/socket.service';
import { MessageService, Message, MessageSearchResponse } from '../../../services/message.service';
import { VideoCallService } from '../../../services/video-call.service';
import { ChannelService } from '../../../services/channel.service';
import { GroupService } from '../../../services/group.service';
import { UploadService, UploadResponse, UploadProgress } from '../../shared/Common/upload.service';
import { Group } from '../../../models/group.model';
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
    MatProgressBarModule,
    MatSnackBarModule,
    TextFieldModule,
    ImageUploadComponent,
    MessageDisplayComponent,
    VideoCallButtonComponent,
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
                    <mat-badge [matBadge]="group.channels.length || 0" matBadgeColor="primary" matBadgeSize="small">
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
                <mat-icon [class]="socketService.isSocketConnected() ? 'connected' : 'disconnected'">
                  {{ socketService.isSocketConnected() ? 'wifi' : 'wifi_off' }}
                </mat-icon>
                <span [class]="socketService.isSocketConnected() ? 'connected' : 'disconnected'">
                  {{ socketService.isSocketConnected() ? 'Connected' : 'Disconnected' }}
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
                      <span>{{ getOnlineUsersCount() }} online</span>
                    </div>
                    <div class="typing-indicator" *ngIf="typingUsers.length > 0">
                      <span>{{ getTypingText() }}</span>
                    </div>
                    <app-video-call-button 
                      [channelId]="selectedChannel._id || ''"
                      [receiverId]="getChannelReceiverId()"
                      [receiverName]="getChannelReceiverName()"
                      [canMakeCall]="canMakeVideoCall()"
                      (callStarted)="onVideoCallStarted()">
                    </app-video-call-button>
                    <button mat-icon-button (click)="toggleUserList()" matTooltip="Show online users">
                      <mat-icon>list</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Search Section -->
                <div class="search-section" *ngIf="selectedChannel">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search messages...</mat-label>
                    <input matInput 
                           [(ngModel)]="searchQuery" 
                           (keydown.enter)="searchMessages()"
                           placeholder="Search messages in this channel">
                    <mat-icon matSuffix (click)="searchMessages()">search</mat-icon>
                  </mat-form-field>
                  <button mat-icon-button (click)="clearSearch()" *ngIf="searchQuery" matTooltip="Clear search">
                    <mat-icon>clear</mat-icon>
                  </button>
                </div>
              </mat-card>
            </div>

            <!-- Online Users List -->
            <div *ngIf="showUserList" class="users-list">
              <mat-card class="users-card">
                <mat-card-header>
                  <mat-card-title>Online Users</mat-card-title>
                  <button mat-icon-button (click)="toggleUserList()" class="close-button">
                    <mat-icon>close</mat-icon>
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <mat-list>
                    <mat-list-item *ngFor="let user of getOnlineUsers()" class="user-item">
                      <div class="user-info">
                        <mat-icon matListItemIcon>person</mat-icon>
                        <span matListItemTitle>{{ user.username }}</span>
                        <span matListItemLine [class]="user.status === 'online' ? 'online' : 'offline'">
                          {{ user.status === 'online' ? 'Online' : 'Offline' }}
                        </span>
                      </div>
                      <div class="user-actions">
                        <!-- Video call button commented out - component not fully implemented -->
                        <!-- <app-video-call-button
                          [userId]="user.userId"
                          [username]="user.username"
                          [channelId]="selectedChannel._id"
                          [disabled]="user.userId === currentUserId || !user.isOnline"
                          [isOnline]="user.isOnline"
                          buttonType="initiate"
                          (videoCallInitiated)="onVideoCallInitiated($event)">
                        </app-video-call-button> -->
                        <button mat-icon-button matTooltip="Video Call (Coming Soon)">
                          <mat-icon>videocam</mat-icon>
                        </button>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Messages Area -->
            <div class="messages-container" #messagesContainer>
              <!-- Load More Messages Button -->
              <div *ngIf="hasMoreMessages && !loadingMessages" class="load-more-container">
                <button mat-stroked-button (click)="loadMoreMessages()" [disabled]="isLoadingMoreMessages">
                  <mat-icon *ngIf="!isLoadingMoreMessages">keyboard_arrow_up</mat-icon>
                  <mat-spinner *ngIf="isLoadingMoreMessages" diameter="20"></mat-spinner>
                  {{ isLoadingMoreMessages ? 'Loading...' : 'Load more messages' }}
                </button>
              </div>

              <div *ngIf="loadingMessages" class="loading-messages">
                <mat-spinner diameter="30"></mat-spinner>
                <p>Loading messages...</p>
              </div>

              <div *ngIf="!loadingMessages && messages.length === 0 && !showSearchResults" class="no-messages">
                <mat-icon>chat_bubble_outline</mat-icon>
                <p>No messages yet. Start the conversation!</p>
              </div>

              <!-- Search Results -->
              <div *ngIf="showSearchResults" class="search-results">
                <div class="search-results-header">
                  <h4>Search Results ({{ searchResults.length }})</h4>
                  <button mat-icon-button (click)="clearSearch()" matTooltip="Close search">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div *ngIf="isSearching" class="search-loading">
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Searching...</span>
                </div>
                <div *ngIf="!isSearching && searchResults.length === 0" class="no-search-results">
                  <mat-icon>search_off</mat-icon>
                  <p>No messages found for "{{ searchQuery }}"</p>
                </div>
                <div *ngIf="!isSearching && searchResults.length > 0" class="search-results-list">
                  <app-message-display
                    *ngFor="let message of searchResults; trackBy: trackByMessageId"
                    [message]="mapMessageToSocketMessage(message)"
                    [currentUserId]="currentUserId"
                    [showActions]="true">
                  </app-message-display>
                  <div *ngIf="searchPage < searchTotalPages" class="load-more-search">
                    <button mat-stroked-button (click)="loadMoreSearchResults()" [disabled]="isSearching">
                      <mat-icon *ngIf="!isSearching">keyboard_arrow_down</mat-icon>
                      <mat-spinner *ngIf="isSearching" diameter="20"></mat-spinner>
                      {{ isSearching ? 'Loading...' : 'Load more results' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Regular Messages -->
              <div *ngIf="!loadingMessages && messages.length > 0 && !showSearchResults" class="messages-list">
                <app-message-display
                  *ngFor="let message of messages; trackBy: trackByMessageId"
                  [message]="message"
                  [currentUserId]="currentUserId"
                  [showActions]="true">
                </app-message-display>
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input">
              <mat-card class="input-card">
                <div class="input-container">
                  <mat-form-field appearance="outline" class="message-field">
                    <mat-label>Type your message...</mat-label>
                    <textarea matInput 
                              [(ngModel)]="newMessage" 
                              (keydown)="onKeyDown($event)"
                              (input)="onTyping()"
                              placeholder="Type your message..."
                              [disabled]="!socketService.isSocketConnected"
                              rows="1"
                              maxlength="1000"
                              cdkTextareaAutosize
                              cdkAutosizeMinRows="1"
                              cdkAutosizeMaxRows="4">
                    </textarea>
                    <mat-hint align="end">{{ newMessage.length || 0 }}/1000</mat-hint>
                  </mat-form-field>
                  
                  <div class="input-actions">
                    <!-- File Upload Button -->
                    <input #fileInput 
                           type="file" 
                           accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                           (change)="onFileSelected($event.target.files?.[0] || null)"
                           style="display: none">
                    
                    <button mat-icon-button 
                            (click)="fileInput.click()"
                            matTooltip="Upload file"
                            [disabled]="isUploading">
                      <mat-icon>attach_file</mat-icon>
                    </button>
                    
                    <app-image-upload
                      (imageSelected)="onImageSelected($event)"
                      (uploadError)="onUploadError($event)"
                      tooltip="Upload image"
                      icon="image">
                    </app-image-upload>
                    
                    <button mat-icon-button matTooltip="Emoji" class="emoji-button" [disabled]="isUploading">
                      <mat-icon>emoji_emotions</mat-icon>
                    </button>
                    
                    <button mat-fab 
                            color="primary" 
                            (click)="sendMessage()"
                            [disabled]="!newMessage.trim() || !socketService.isSocketConnected || isUploading"
                            class="send-button">
                      <mat-icon>send</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-card>
            </div>

            <!-- Upload Progress Indicator -->
            <div *ngIf="isUploading" class="upload-progress">
              <mat-card class="upload-progress-card">
                <mat-card-content>
                  <div class="upload-info">
                    <mat-icon>{{ uploadType === 'image' ? 'image' : 'attach_file' }}</mat-icon>
                    <div class="upload-details">
                      <span class="upload-filename">{{ uploadingFileName }}</span>
                      <span class="upload-type">{{ uploadType === 'image' ? 'Image' : 'File' }} upload</span>
                    </div>
                    <span class="upload-percentage">{{ uploadProgress.percentage }}%</span>
                  </div>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="uploadProgress.percentage"
                    class="upload-progress-bar">
                  </mat-progress-bar>
                </mat-card-content>
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

    .message-input {
      flex-shrink: 0;
      position: relative;
    }

    .input-card {
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .message-field {
      flex: 1;
    }

    .message-field ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 24px;
    }

    .message-field ::ng-deep textarea {
      min-height: 24px;
    }

    .input-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 4px;
    }

    .emoji-button {
      width: 40px;
      height: 40px;
    }

    .send-button {
      width: 48px;
      height: 48px;
      min-width: 48px;
    }

    .send-button mat-icon {
      margin: 0;
    }

    .input-actions ::ng-deep app-image-upload button {
      width: 40px;
      height: 40px;
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

    /* Search section styles */
    .search-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-top: 1px solid #e0e0e0;
    }

    .search-field {
      flex: 1;
    }

    .search-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    /* Search results styles */
    .search-results {
      background: #f8f9fa;
      border-radius: 8px;
      margin: 8px;
      padding: 16px;
    }

    .search-results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-results-header h4 {
      margin: 0;
      color: #333;
    }

    .search-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      justify-content: center;
    }

    .no-search-results {
      text-align: center;
      padding: 32px;
      color: #666;
    }

    .no-search-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .search-results-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .load-more-search {
      text-align: center;
      padding: 16px 0;
    }

    /* Load more messages styles */
    .load-more-container {
      text-align: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .load-more-container button {
      min-width: 200px;
    }

    /* Upload progress styles */
    .upload-progress {
      margin-top: 8px;
    }

    .upload-progress-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }

    .upload-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .upload-info mat-icon {
      color: #666;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .upload-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .upload-filename {
      font-weight: 500;
      color: #333;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .upload-type {
      font-size: 12px;
      color: #666;
    }

    .upload-percentage {
      font-weight: 600;
      color: #1976d2;
      font-size: 14px;
      min-width: 40px;
      text-align: right;
    }

    .upload-progress-bar {
      height: 4px;
      border-radius: 2px;
    }

    .upload-progress-bar ::ng-deep .mat-mdc-progress-bar-buffer {
      background-color: #e0e0e0;
    }

    .upload-progress-bar ::ng-deep .mat-mdc-progress-bar-fill::after {
      background-color: #1976d2;
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
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  groupService = inject(GroupService);
  uploadService = inject(UploadService);
  videoCallService = inject(VideoCallService);
  snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

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

  // Search functionality
  searchQuery = '';
  searchResults: Message[] = [];
  isSearching = false;
  showSearchResults = false;
  searchPage = 1;
  searchTotalPages = 1;

  // Message pagination
  hasMoreMessages = true;
  isLoadingMoreMessages = false;
  lastMessageId: string | null = null;

  // Socket data
  typingUsers: TypingIndicator[] = [];
  showUserList: boolean = false;
  onlineUsers: UserPresence[] = [];
  userPresenceMap: Map<string, UserPresence> = new Map();

  // File upload data
  uploadProgress: UploadProgress = { loaded: 0, total: 0, percentage: 0 };
  isUploading = false;
  uploadType: 'image' | 'file' | null = null;
  uploadingFileName = '';

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || '';
    this.normalizeMessagesInLocalStorage(); // Clean up old message format
    this.loadGroups();
    this.setupSocketSubscriptions();
    this.setupUploadSubscriptions();
    this.socketService.connect();

    // Update user presence when component initializes
    this.updateUserPresence();
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
    // Messages subscription
    this.socketService.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: SocketMessage) => {
        this.messages.push(message);
        this.scrollToBottom();
      });

    // Typing users subscription
    this.socketService.typing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((typingIndicator: TypingIndicator) => {
        if (typingIndicator.channelId === this.selectedChannel?._id) {
          if (typingIndicator.isTyping) {
            const existingIndex = this.typingUsers.findIndex(u => u.userId === typingIndicator.userId);
            if (existingIndex === -1) {
              this.typingUsers.push(typingIndicator);
            }
          } else {
            this.typingUsers = this.typingUsers.filter(u => u.userId !== typingIndicator.userId);
          }
        }
      });

    // User presence subscription
    this.socketService.presence$
      .pipe(takeUntil(this.destroy$))
      .subscribe((presence: UserPresence) => {
        this.userPresenceMap.set(presence.userId, presence);
        this.updateOnlineUsersList();
      });

    // User join subscription
    this.socketService.userJoined$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: ChannelJoin) => {
        if (event.channelId === this.selectedChannel?._id) {
          this.showNotification(`${event.username} joined the channel`);
        }
      });

    // User leave subscription
    this.socketService.userLeft$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: ChannelLeave) => {
        if (event.channelId === this.selectedChannel?._id) {
          this.showNotification(`${event.username} left the channel`);
        }
      });

    // Connection status subscription
    this.socketService.connection$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isConnected: boolean) => {
        if (isConnected) {
          console.log('Socket connected successfully');
        }
      });

    // Real-time message subscription
    this.socketService.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe((socketMessage: any) => {
        console.log('Received real-time message:', socketMessage);
        console.log('Message object:', socketMessage.message);

        // Only add message if it's for the current channel
        if (socketMessage.channelId === this.selectedChannel?._id) {
          // Check if this is our own message (prevent duplicate)
          const currentUser = this.authService.getCurrentUser();
          console.log('Current user ID:', currentUser?.id);
          console.log('Message user ID:', socketMessage.message.userId);
          console.log('Are they equal?', socketMessage.message.userId === currentUser?.id);

          if (socketMessage.message.userId === currentUser?.id) {
            console.log('Skipping own message from Socket.IO');
            return;
          }

          // Map Socket.IO message to SocketMessage format
          const mappedMessage = this.mapMessageToSocketMessage(socketMessage.message);
          console.log('Mapped message:', mappedMessage);

          // Validate mapped message before adding
          if (mappedMessage._id && mappedMessage.text && mappedMessage.userId) {
            this.messages.push(mappedMessage);
            this.cdr.detectChanges(); // Trigger change detection
            this.scrollToBottom();
          } else {
            console.warn('Invalid message format, skipping:', mappedMessage);
          }
        }
      });
  }

  private async loadGroups(): Promise<void> {
    try {
      this.loadingGroups = true;
      const response = await this.groupService.getMyGroups().toPromise();
      const groups = response?.data || [];

      // Map groups to include channels
      this.groups = groups.map((group: any) => ({
        id: group._id || group.id,
        name: group.name,
        description: group.description,
        category: group.category || 'general',
        status: group.status || 'active',
        createdBy: group.createdBy,
        admins: group.admins || [],
        members: group.members || [],
        channels: group.channels || [],
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt),
        isActive: group.isActive !== undefined ? group.isActive : true,
        memberCount: group.memberCount || 0,
        maxMembers: group.maxMembers
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

    // Leave previous channel
    if (this.selectedChannel) {
      this.socketService.leaveChannel(this.selectedChannel._id);
    }

    this.selectedChannel = channel;
    this.messages = []; // Clear messages for new channel
    this.loadingMessages = true;

    // No need to join channel since user is already in the group

    // Update user presence to show current channel
    this.updateUserPresence();

    // Load previous messages
    this.loadChannelMessages(channel._id);
  }

  private loadChannelMessages(channelId: string): void {
    this.loadingMessages = true;
    this.hasMoreMessages = true;
    this.lastMessageId = null;
    this.messages = [];

    this.messageService.getMessagesByChannel(channelId, { limit: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Map API messages to SocketMessage format
            this.messages = response.data.map(msg => this.mapMessageToSocketMessage(msg));
            this.lastMessageId = this.messages.length > 0 ? this.messages[this.messages.length - 1]._id : null;
            this.hasMoreMessages = response.data.length === 50; // If we got 50 messages, there might be more
            this.scrollToBottom();
          } else {
            this.snackBar.open('Failed to load messages', 'Close', { duration: 3000 });
          }
          this.loadingMessages = false;
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.snackBar.open('Failed to load messages', 'Close', { duration: 3000 });
          this.loadingMessages = false;
        }
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChannel || !this.socketService.isSocketConnected) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Send via Socket.IO for real-time messaging
    if (this.socketService.isSocketConnected()) {
      const messageData = {
        channelId: this.selectedChannel._id,
        text: this.newMessage.trim(),
        type: 'text' as const
      };

      this.socketService.sendMessage(messageData);
      this.newMessage = '';
      this.stopTyping();
    } else {
      // Fallback to HTTP API if Socket.IO not connected
      this.messageService.sendTextMessage(this.selectedChannel._id, this.newMessage.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.newMessage = '';
              this.stopTyping();
            } else {
              this.snackBar.open('Failed to send message', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.snackBar.open('Failed to send message', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping(): void {
    if (!this.selectedChannel || !this.socketService.isSocketConnected) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.socketService.sendTyping(this.selectedChannel._id, true);

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
    if (this.selectedChannel && this.socketService.isSocketConnected()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.socketService.sendTyping(this.selectedChannel._id, false);
      }
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

  getOnlineUsersCount(): number {
    return this.onlineUsers.filter(user => user.status === 'online').length;
  }

  getOnlineUsers(): UserPresence[] {
    return this.onlineUsers.filter(user => user.status === 'online');
  }

  /**
   * Update online users list based on presence data
   */
  private updateOnlineUsersList(): void {
    this.onlineUsers = Array.from(this.userPresenceMap.values())
      .filter(user => user.status === 'online' || user.status === 'away')
      .sort((a, b) => {
        // Sort by status (online first) then by username
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return a.username.localeCompare(b.username);
      });
  }

  /**
   * Update user presence status
   */
  private updateUserPresence(): void {
    if (this.socketService.isSocketConnected()) {
      const currentChannelId = this.selectedChannel?._id;
      this.socketService.updatePresence('online', currentChannelId);
    }
  }

  /**
   * Setup upload progress subscriptions
   */
  private setupUploadSubscriptions(): void {
    this.uploadService.uploadProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.uploadProgress = progress;
        this.isUploading = progress.percentage > 0 && progress.percentage < 100;
      });
  }

  trackByMessageId(index: number, message: SocketMessage): string {
    return message._id;
  }

  /**
   * Map API Message to SocketMessage format
   */
  mapMessageToSocketMessage(message: any): SocketMessage {
    return {
      _id: message._id || '',
      channelId: message.channelId || '',
      userId: message.userId || '',
      username: message.username || 'Unknown',
      text: message.text || '',
      type: message.type || 'text',
      imageUrl: message.imageUrl,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      createdAt: message.createdAt ?
        (typeof message.createdAt === 'string' ? message.createdAt : message.createdAt.toISOString()) :
        new Date().toISOString()
    };
  }

  /**
   * Search messages in current channel
   */
  searchMessages(): void {
    if (!this.searchQuery.trim() || !this.selectedChannel) {
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.searchPage = 1;

    this.messageService.searchMessages(this.searchQuery.trim(), {
      channelId: this.selectedChannel._id,
      limit: 20,
      offset: 0
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.searchResults = response.data.messages;
            this.searchTotalPages = response.data.totalPages;
            this.showSearchResults = true;
          } else {
            this.snackBar.open('Search failed', 'Close', { duration: 3000 });
          }
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error searching messages:', error);
          this.snackBar.open('Search failed', 'Close', { duration: 3000 });
          this.isSearching = false;
        }
      });
  }

  /**
   * Load more search results
   */
  loadMoreSearchResults(): void {
    if (this.searchPage >= this.searchTotalPages || !this.selectedChannel) return;

    this.searchPage++;
    this.isSearching = true;

    this.messageService.searchMessages(this.searchQuery.trim(), {
      channelId: this.selectedChannel._id,
      limit: 20,
      offset: (this.searchPage - 1) * 20
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.searchResults = [...this.searchResults, ...response.data.messages];
          }
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error loading more search results:', error);
          this.isSearching = false;
        }
      });
  }

  /**
   * Clear search results
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.searchPage = 1;
  }

  /**
   * Load more messages (pagination)
   */
  loadMoreMessages(): void {
    if (!this.hasMoreMessages || this.isLoadingMoreMessages || !this.selectedChannel || !this.lastMessageId) {
      return;
    }

    this.isLoadingMoreMessages = true;

    this.messageService.getMessageHistory(this.selectedChannel._id, {
      before: this.lastMessageId,
      limit: 50
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data.length > 0) {
            const newMessages = response.data.map(msg => this.mapMessageToSocketMessage(msg));
            this.messages = [...newMessages, ...this.messages];
            this.lastMessageId = newMessages[0]._id;
            this.hasMoreMessages = response.data.length === 50;
          } else {
            this.hasMoreMessages = false;
          }
          this.isLoadingMoreMessages = false;
        },
        error: (error) => {
          console.error('Error loading more messages:', error);
          this.isLoadingMoreMessages = false;
        }
      });
  }

  formatTime(timestamp: number): string {
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

  onImageSelected(file: File): void {
    if (!this.selectedChannel) return;

    // Validate file type and size
    if (!this.uploadService.validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
      this.snackBar.open('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'Close', { duration: 3000 });
      return;
    }

    if (!this.uploadService.validateFileSize(file, 10)) { // 10MB limit
      this.snackBar.open('Image size must be less than 10MB', 'Close', { duration: 3000 });
      return;
    }

    this.uploadType = 'image';
    this.uploadingFileName = file.name;
    this.isUploading = true;

    // Upload image using UploadService
    this.uploadService.uploadImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data.imageUrl) {
            // Send image message via MessageService for persistence
            this.messageService.sendImageMessage(
              this.selectedChannel!._id,
              response.data.imageUrl,
              response.data.originalName || file.name,
              response.data.size || file.size
            )
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (messageResponse) => {
                  if (messageResponse.success) {
                    // Message will be received via socket
                    this.snackBar.open('Image sent successfully', 'Close', { duration: 2000 });
                  } else {
                    this.snackBar.open('Failed to send image message', 'Close', { duration: 3000 });
                  }
                },
                error: (error) => {
                  console.error('Error sending image message:', error);
                  this.snackBar.open('Failed to send image message', 'Close', { duration: 3000 });
                }
              });
          } else {
            this.snackBar.open('Failed to upload image', 'Close', { duration: 3000 });
          }
          this.isUploading = false;
          this.uploadType = null;
          this.uploadingFileName = '';
        },
        error: (error) => {
          console.error('Image upload failed:', error);
          this.snackBar.open('Failed to upload image', 'Close', { duration: 3000 });
          this.isUploading = false;
          this.uploadType = null;
          this.uploadingFileName = '';
        }
      });
  }

  /**
   * Handle file selection for upload
   */
  onFileSelected(file: File | null): void {
    if (!this.selectedChannel || !file) return;

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (!this.uploadService.validateFileType(file, allowedTypes)) {
      this.snackBar.open('Please select a valid file (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR)', 'Close', { duration: 3000 });
      return;
    }

    if (!this.uploadService.validateFileSize(file, 50)) { // 50MB limit
      this.snackBar.open('File size must be less than 50MB', 'Close', { duration: 3000 });
      return;
    }

    this.uploadType = 'file';
    this.uploadingFileName = file.name;
    this.isUploading = true;

    // Upload file using UploadService
    this.uploadService.uploadFile(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data.fileUrl) {
            // Send file message via MessageService for persistence
            this.messageService.sendFileMessage(
              this.selectedChannel!._id,
              response.data.fileUrl,
              response.data.originalName || file.name,
              response.data.size || file.size
            )
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (messageResponse) => {
                  if (messageResponse.success) {
                    // Message will be received via socket
                    this.snackBar.open('File sent successfully', 'Close', { duration: 2000 });
                  } else {
                    this.snackBar.open('Failed to send file message', 'Close', { duration: 3000 });
                  }
                },
                error: (error) => {
                  console.error('Error sending file message:', error);
                  this.snackBar.open('Failed to send file message', 'Close', { duration: 3000 });
                }
              });
          } else {
            this.snackBar.open('Failed to upload file', 'Close', { duration: 3000 });
          }
          this.isUploading = false;
          this.uploadType = null;
          this.uploadingFileName = '';
        },
        error: (error) => {
          console.error('File upload failed:', error);
          this.snackBar.open('Failed to upload file', 'Close', { duration: 3000 });
          this.isUploading = false;
          this.uploadType = null;
          this.uploadingFileName = '';
        }
      });
  }

  /**
   * Get file icon based on file type
   */
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'xls':
      case 'xlsx': return 'table_chart';
      case 'ppt':
      case 'pptx': return 'slideshow';
      case 'txt': return 'text_snippet';
      case 'zip':
      case 'rar': return 'folder_zip';
      default: return 'insert_drive_file';
    }
  }

  /**
   * Download file
   */
  downloadFile(fileUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    return this.uploadService.getFileSizeString(bytes);
  }

  onImageUploaded(response: UploadResponse): void {
    // This method is kept for compatibility but the main logic is in onImageSelected
    console.log('Image uploaded:', response);
  }

  onUploadError(error: string): void {
    this.snackBar.open(error, 'Close', { duration: 3000 });
    this.isUploading = false;
    this.uploadType = null;
    this.uploadingFileName = '';
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  // Video call methods
  onVideoCall(event: { userId: string; username: string }): void {
    const dialogRef = this.dialog.open(VideoCallComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'video-call-dialog'
    });

    // Video call functionality commented out - component simplified
    // dialogRef.componentInstance.startCall(event.userId, event.username);
  }

  toggleUserList(): void {
    this.showUserList = !this.showUserList;
  }





  // Helper methods for message handling
  getMessageText(message: SocketMessage): string {
    return message.text || '';
  }

  /**
   * Normalize old message format in localStorage
   * Convert 'content' to 'text' and ensure all required fields exist
   */
  private normalizeMessagesInLocalStorage(): void {
    try {
      // Get all localStorage keys that might contain messages
      const keys = Object.keys(localStorage);
      const messageKeys = keys.filter(key =>
        key.startsWith('messages_') ||
        key.includes('channel_') ||
        key.includes('chat_')
      );

      messageKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return;

          const messages = JSON.parse(data);
          if (!Array.isArray(messages)) return;

          // Normalize each message
          const normalizedMessages = messages.map((msg: any) => {
            // If message has old format with 'content', convert to 'text'
            if (msg.content && !msg.text) {
              msg.text = msg.content;
              delete msg.content;
            }

            // Ensure required fields exist
            return {
              id: msg.id || `msg_${Date.now()}_${Math.random()}`,
              text: msg.text || msg.content || '',
              senderId: msg.senderId || msg.userId || '1',
              senderName: msg.senderName || msg.username || 'Unknown',
              timestamp: msg.timestamp || Date.now(),
              type: msg.type || 'TEXT',
              isEdited: msg.isEdited || false,
              isDeleted: msg.isDeleted || false,
              // Keep additional fields if they exist
              ...(msg.imageUrl && { imageUrl: msg.imageUrl }),
              ...(msg.fileUrl && { fileUrl: msg.fileUrl })
            };
          });

          // Save normalized messages back to localStorage
          localStorage.setItem(key, JSON.stringify(normalizedMessages));
        } catch (err) {
          console.error(`Error normalizing messages for key ${key}:`, err);
        }
      });

      console.log('✅ Messages normalized successfully');
    } catch (error) {
      console.error('Error normalizing messages in localStorage:', error);
    }
  }

  /**
   * Get channel receiver ID for video calls
   */
  getChannelReceiverId(): string {
    // For now, return empty string - in a real implementation,
    // you might want to get the first online user or a specific user
    return '';
  }

  /**
   * Get channel receiver name for video calls
   */
  getChannelReceiverName(): string {
    // For now, return channel name - in a real implementation,
    // you might want to get a specific user's name
    return this.selectedChannel?.name || '';
  }

  /**
   * Check if video call can be made
   */
  canMakeVideoCall(): boolean {
    return !!(this.selectedChannel && this.getOnlineUsersCount() > 1);
  }

  /**
   * Handle video call started event
   */
  onVideoCallStarted(): void {
    this.snackBar.open('Video call started', 'Close', { duration: 2000 });
  }
}
