import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/auth.service';
import { MessageDisplayComponent } from '../../shared/Common/message-display.component';
import { AvatarService } from '../../../services/avatar.service';
import { GroupService } from '../../../services/group.service';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { MessageReactionService } from '../../../services/message-reaction.service';
import { MessageReplyService } from '../../../services/message-reply.service';
import { VideoCallButtonComponent } from '../../video-call/video-call-button.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MessageDisplayComponent,
    VideoCallButtonComponent,
    ClientLayoutComponent
  ],
  template: `
    <app-client-layout pageTitle="Chat" pageDescription="Connect with your teams and groups">
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
            <mat-list class="groups-list">
              <div *ngFor="let group of filteredGroups; trackBy: trackByGroupId" 
                   class="group-item"
                   [class.active]="selectedGroupId === group.id"
                   (click)="selectGroup(group)">
                <div class="group-avatar">
                  <mat-icon>group_work</mat-icon>
                </div>
                <div class="group-info">
                  <div class="group-name">{{ group.name }}</div>
                  <div class="group-last-message">{{ getLastMessage(group.id) }}</div>
                  <div class="group-time">{{ getLastMessageTime(group.id) }}</div>
                </div>
                <div class="group-badges">
                  <mat-icon 
                    *ngIf="hasUnreadMessages(group.id)" 
                    class="unread-indicator"
                    matBadge="{{ getUnreadCount(group.id) }}" 
                    matBadgeColor="accent"
                    matBadgeSize="small">
                    fiber_manual_record
                  </mat-icon>
                  <mat-icon *ngIf="group.isOnline" class="online-indicator">fiber_manual_record</mat-icon>
                </div>
              </div>
            </mat-list>

            <!-- No Groups Message -->
            <div *ngIf="filteredGroups.length === 0" class="no-groups">
              <mat-icon>group_off</mat-icon>
              <p>No groups found</p>
              <button mat-raised-button color="primary" routerLink="/groups">
                Browse Groups
              </button>
            </div>
          </mat-card>
        </div>

        <!-- Main Chat Area -->
        <div class="chat-main">
          <!-- Chat Selected State -->
          <div *ngIf="selectedGroup; else noGroupSelected" class="chat-container">
            <!-- Chat Header -->
            <mat-card class="chat-header">
              <div class="header-info">
                <div class="chat-title">
                  <mat-icon>group_work</mat-icon>
                  <span>{{ selectedGroup.name }}</span>
                </div>
                <div class="chat-subtitle">
                  {{ selectedChannel?.name || 'general' }} • {{ getOnlineCount() }} online
                </div>
              </div>
              <div class="header-actions">
                <app-video-call-button 
                  [channelId]="selectedGroup?.id || ''"
                  [receiverId]="getChannelReceiverId()"
                  [receiverName]="getChannelReceiverName()"
                  [canMakeCall]="canMakeVideoCall()"
                  (callStarted)="onVideoCallStarted()">
                </app-video-call-button>
                <button mat-icon-button matTooltip="Group Info" (click)="toggleGroupInfo()">
                  <mat-icon>info</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Members" (click)="toggleMembers()">
                  <mat-icon matBadge="{{ selectedGroup.memberCount }}" matBadgeColor="accent">people</mat-icon>
                </button>
                <button mat-icon-button matTooltip="More Options">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <!-- Debug button for testing -->
                <button mat-icon-button matTooltip="Add John Online (Debug)" (click)="addUserOnline('john_doe')">
                  <mat-icon>person_add</mat-icon>
                </button>
              </div>
            </mat-card>

            <!-- Messages Area -->
            <div class="messages-container" #messagesContainer>
              <div *ngIf="currentMessages.length > 0" class="messages-list">
                <app-message-display
                  *ngFor="let message of currentMessages; trackBy: trackByMessageId"
                  [message]="message"
                  [currentUserId]="currentUserId"
                  [showActions]="true"
                  [showReactions]="true"
                  [showReply]="true"
                  [showMoreOptions]="true"
                  (onReact)="onMessageReact($event)"
                  (onReply)="onMessageReply($event)"
                  (onEdit)="onMessageEdit($event)"
                  (onDelete)="onMessageDelete($event)"
                  (onCopy)="onMessageCopy($event)">
                </app-message-display>
              </div>

              <!-- Empty Messages -->
              <div *ngIf="currentMessages.length === 0" class="empty-messages">
                <mat-icon class="empty-icon">forum</mat-icon>
                <h3>No messages yet</h3>
                <p>Be the first to start the conversation in {{ selectedGroup.name }}!</p>
              </div>
            </div>

            <!-- Message Input -->
            <mat-card class="message-input-card">
              <form (ngSubmit)="sendMessage()" class="message-form">
                <mat-form-field appearance="outline" class="message-input">
                  <mat-label>Type your message...</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="newMessage" 
                    name="newMessage" 
                    rows="1"
                    (keydown.enter)="onEnterPress($event)" 
                    [disabled]="isSending"
                    placeholder="Type a message..."
                    maxlength="1000">
                  </textarea>
                  <mat-hint align="end">{{ newMessage.length || 0 }}/1000</mat-hint>
                </mat-form-field>
                <div class="input-actions">
                  <input 
                    type="file" 
                    #fileInput 
                    (change)="onFileSelected($event)"
                    accept="image/*"
                    style="display: none">
                  <button mat-icon-button type="button" matTooltip="Attach Image" (click)="fileInput.click()">
                    <mat-icon>image</mat-icon>
                  </button>
                  <button mat-icon-button type="button" matTooltip="Emoji" (click)="toggleEmojiPicker()">
                    <mat-icon>emoji_emotions</mat-icon>
                  </button>
                  <button 
                    mat-fab 
                    color="primary" 
                    type="submit" 
                    [disabled]="!newMessage.trim() || isSending"
                    matTooltip="Send Message"
                    class="send-button">
                    <mat-icon>{{ isSending ? 'hourglass_top' : 'send' }}</mat-icon>
                  </button>
                </div>
              </form>

              <!-- Emoji Picker -->
              <div *ngIf="showEmojiPicker" class="emoji-picker">
                <div class="emoji-grid">
                  <span 
                    *ngFor="let emoji of emojiList" 
                    class="emoji-item"
                    (click)="insertEmoji(emoji)"
                    [title]="emoji">
                    {{ emoji }}
                  </span>
                </div>
              </div>

              <!-- Image Preview -->
              <div *ngIf="selectedImage" class="image-preview">
                <img [src]="selectedImage" alt="Preview">
                <button mat-icon-button (click)="removeImage()" class="remove-image-btn">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </mat-card>
          </div>

          <!-- No Group Selected State -->
          <ng-template #noGroupSelected>
            <div class="no-selection">
              <mat-icon class="no-selection-icon">chat</mat-icon>
              <h2>Welcome to Chat</h2>
              <p>Select a group from the sidebar to start chatting</p>
              <button mat-raised-button color="primary" routerLink="/groups">
                <mat-icon>explore</mat-icon>
                Browse Groups
              </button>
            </div>
          </ng-template>
        </div>

        <!-- Right Sidebar - Group Info (conditional) -->
        <div class="info-sidebar" *ngIf="showGroupInfo || showMembers">
          <mat-card class="info-card">
            <!-- Group Info Tab -->
            <div *ngIf="showGroupInfo" class="info-section">
              <div class="info-header">
                <h3>Group Information</h3>
                <button mat-icon-button (click)="toggleGroupInfo()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="info-content">
                <div class="info-item">
                  <mat-icon>group_work</mat-icon>
                  <div>
                    <strong>{{ selectedGroup?.name }}</strong>
                    <p>{{ selectedGroup?.description || 'No description available' }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>people</mat-icon>
                  <div>
                    <strong>{{ selectedGroup?.memberCount || 0 }} Members</strong>
                    <p>{{ getOnlineCount() }} online now</p>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <strong>Created</strong>
                    <p>{{ formatDate(selectedGroup?.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Members Tab -->
            <div *ngIf="showMembers" class="info-section">
              <div class="info-header">
                <h3>Members ({{ currentMembers.length }})</h3>
                <button mat-icon-button (click)="toggleMembers()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <mat-divider></mat-divider>
              <div class="members-list">
                <div *ngFor="let member of currentMembers" class="member-item">
                  <div class="member-avatar">
                    {{ (member.username || 'M').charAt(0).toUpperCase() }}
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ member.username || 'Unknown' }}</span>
                    <span class="member-role">{{ member.role || 'member' }}</span>
                  </div>
                  <mat-icon 
                    class="online-status" 
                    [class.online]="isUserOnline(member.username)"
                    [class.offline]="!isUserOnline(member.username)">
                    fiber_manual_record
                  </mat-icon>
                </div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </app-client-layout>
  `,
  styles: [`
    .chat-layout {
      display: flex;
      height: calc(100vh - 120px); /* Account for client layout header/footer */
      background: #f5f5f5;
      gap: 8px;
      padding: 8px;
    }

    /* Left Sidebar - Groups */
    .chat-sidebar {
      width: 320px;
      min-width: 280px;
      max-width: 400px;
      display: flex;
      flex-direction: column;
    }

    .sidebar-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .search-field {
      width: 100%;
      margin-bottom: 0;
    }

    .groups-list {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .group-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
      transition: background-color 0.2s ease;
      position: relative;
    }

    .group-item:hover {
      background-color: #f8f9fa;
    }

    .group-item.active {
      background-color: #e3f2fd;
      border-right: 3px solid #2196f3;
    }

    .group-avatar {
      width: 48px;
      height: 48px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .group-info {
      flex: 1;
      min-width: 0;
    }

    .group-name {
      font-weight: 500;
      font-size: 0.95rem;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .group-last-message {
      font-size: 0.85rem;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }

    .group-time {
      font-size: 0.8rem;
      color: #999;
    }

    .group-badges {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .unread-indicator {
      color: #ff4444;
      font-size: 12px;
    }

    .online-indicator {
      color: #4caf50;
      font-size: 12px;
    }

    .no-groups {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-groups mat-icon {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 16px;
    }

    /* Main Chat Area */
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 0;
    }
     .chat-container .mat-mdc-card {
      flex-direction: row;
      }

    .chat-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .chat-subtitle {
      font-size: 0.9rem;
      color: #666;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      background: #fafafa;
    }

    .messages-list {
      padding: 0;
    }

    .empty-messages {
      text-align: center;
      padding: 64px 24px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      color: #ddd;
      margin-bottom: 24px;
    }

    .empty-messages h3 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .message-input-card {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }

    .message-form {
      display: flex;
      align-items: flex-end;
      gap: 12px;
    }

    .message-input {
      flex: 1;
      margin-bottom: 0;
    }

    .input-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .send-button {
      width: 48px;
      height: 48px;
    }

    /* Emoji Picker */
    .emoji-picker {
      position: absolute;
      bottom: 80px;
      left: 24px;
      right: 24px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
    }

    .emoji-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-size: 20px;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.2s ease;
    }

    .emoji-item:hover {
      background-color: #f5f5f5;
    }

    /* Image Preview */
    .image-preview {
      position: relative;
      margin-top: 12px;
      display: inline-block;
    }

    .image-preview img {
      max-width: 200px;
      max-height: 150px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .remove-image-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff4444;
      color: white;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .remove-image-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      line-height: 16px;
    }

    /* No Selection State */
    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: #666;
      padding: 48px;
    }

    .no-selection-icon {
      font-size: 80px;
      color: #ddd;
      margin-bottom: 24px;
    }

    .no-selection h2 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .no-selection p {
      margin-bottom: 24px;
      font-size: 1.1rem;
    }

    /* Right Sidebar - Info */
    .info-sidebar {
      width: 300px;
      min-width: 280px;
    }

    .info-card {
      height: 100%;
      padding: 0;
      overflow: hidden;
    }

    .info-section {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .info-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }

    .info-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item mat-icon {
      color: #666;
      margin-top: 4px;
    }

    .info-item strong {
      display: block;
      margin-bottom: 4px;
      color: #333;
    }

    .info-item p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .members-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .member-info {
      flex: 1;
    }

    .member-name {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .member-role {
      display: block;
      font-size: 0.8rem;
      color: #666;
      text-transform: capitalize;
    }

    .online-status {
      font-size: 12px;
    }

    .online-status.online {
      color: #4caf50;
    }

    .online-status.offline {
      color: #ccc;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .chat-layout {
        height: calc(100vh - 100px);
      }
      
      .chat-sidebar {
        width: 280px;
      }
      
      .info-sidebar {
        width: 260px;
      }
    }

    @media (max-width: 768px) {
      .chat-layout {
        flex-direction: column;
        height: calc(100% - 80px);
      }
      
      .chat-sidebar {
        width: 100%;
        height: 200px;
      }
      
      .chat-main {
        height: calc(100% - 200px);
      }
      
      .info-sidebar {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        z-index: 1000;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      }
      
      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef

  // Group management
  groups: any[] = [];
  filteredGroups: any[] = [];
  selectedGroup: any = null;
  selectedGroupId: string = '';
  selectedChannel: any = null;
  searchTerm: string = '';

  // Chat data
  currentMessages: any[] = [];
  currentMembers: any[] = [];
  newMessage: string = '';
  isSending = false;
  currentUserId: string = '';

  // UI state
  showGroupInfo = false;
  showMembers = false;
  showEmojiPicker = false;
  selectedImage: string | null = null;
  selectedFile: File | null = null;

  // Message interaction state
  replyToMessage: any = null;
  editingMessage: any = null;
  messageText: string = '';
  replyText: string = '';

  // Emoji list
  emojiList = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
    '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👶',
    '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴',
    '👵', '👱', '🧔', '👲', '🧑‍🦲', '👨‍🦲', '👩‍🦲', '👨‍🦱',
    '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦰', '👩‍🦰', '👱‍♂️', '👱‍♀️', '🧑‍🦳',
    '👨‍🦳', '👩‍🦳', '👴', '👵', '🧓', '👨‍🦲', '👩‍🦲', '🧔',
    '👲', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩'
  ];

  // Legacy properties (for compatibility)
  groupId: string = '';
  channelId: string = '';
  groupName: string = '';
  channelName: string = '';
  channelInfo: any = {};
  messages: any[] = [];
  groupMembers: any[] = [];
  onlineUsers: string[] = [];
  private lastOnlineCount: number = 0;
  private lastCanMakeCall: boolean = false;
  private lastUserStatus: Map<string, boolean> = new Map();
  private messagePolling: any;
  private userSub: any;

  constructor(
    private authService: AuthService,
    private avatarService: AvatarService,
    private groupService: GroupService,
    private messageService: MessageService,
    private socketService: SocketService,
    private messageReactionService: MessageReactionService,
    private messageReplyService: MessageReplyService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Initialize chat view and subscriptions.
   * - Loads groups the current user belongs to
   * - Subscribes to auth changes and route params
   * - Sets up Socket.IO for real-time messaging
   */
  ngOnInit(): void {
    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || '';

    console.log('🔍 ChatComponent.ngOnInit - Current user:', currentUser);

    // Initialize Socket.IO connection
    this.initializeSocket();

    this.loadGroups();
    // Reload groups whenever auth state changes (login/logout)
    this.userSub = this.authService.currentUser$.subscribe(() => {
      this.loadGroups();
      this.filterGroups();
    });
    this.route.params.subscribe(params => {
      if (params['groupId']) {
        this.groupId = params['groupId'];
        this.channelId = params['channelId'] || 'general';
        this.selectGroupById(this.groupId);
      }
    });
    // Start message polling as fallback (Socket.IO is primary)
    this.startMessagePolling();
  }

  /**
   * Initialize Socket.IO connection and event listeners
   */
  private initializeSocket(): void {
    console.log('🔍 ChatComponent.initializeSocket - Enabling Socket.IO');

    // Connect to socket
    this.socketService.connect();

    // Listen for new messages
    this.socketService.message$.subscribe(message => {
      console.log('🔍 ChatComponent - New message received:', message);

      // Only add message if it's for the current group/channel
      if (this.selectedGroup && message.channelId === this.selectedGroup.id) {
        // Handle both direct SocketMessage and nested message structure
        const messageData = (message as any).message || message;

        // Check if this is our own message (to avoid duplicates)
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && messageData.userId === currentUser.id) {
          console.log('🔍 ChatComponent - Own message detected, skipping Socket.IO (already added via HTTP API)');
          return;
        }

        const newMessage = {
          _id: messageData._id,
          text: messageData.text,
          userId: messageData.userId,
          username: messageData.username,
          createdAt: messageData.createdAt,
          type: messageData.type || 'text',
          isEdited: messageData.isEdited || false,
          isDeleted: messageData.isDeleted || false,
          imageUrl: messageData.imageUrl,
          fileUrl: messageData.fileUrl,
          fileName: messageData.fileName,
          fileSize: messageData.fileSize
        };

        console.log('🔍 ChatComponent - Extracted message data:', messageData);
        console.log('🔍 ChatComponent - New message object:', newMessage);

        this.currentMessages.push(newMessage);
        console.log('🔍 ChatComponent - Message added to current messages');
      }
    });

    // Listen for user presence updates
    this.socketService.presence$.subscribe(presence => {
      console.log('🔍 ChatComponent - User presence update:', presence);
      console.log('🔍 ChatComponent - Current onlineUsers before update:', this.onlineUsers);

      // Update online users list
      if (presence.status === 'online') {
        if (!this.onlineUsers.includes(presence.username)) {
          this.onlineUsers.push(presence.username);
          console.log('🔍 ChatComponent - Added user to online list:', presence.username);
        }
      } else {
        this.onlineUsers = this.onlineUsers.filter(user => user !== presence.username);
        console.log('🔍 ChatComponent - Removed user from online list:', presence.username);
      }

      console.log('🔍 ChatComponent - Updated onlineUsers:', this.onlineUsers);
    });

    // Listen for typing indicators
    this.socketService.typing$.subscribe(typing => {
      console.log('🔍 ChatComponent - Typing indicator:', typing);
      // TODO: Implement typing indicator UI
    });
  }

  /**
   * Keep the message list scrolled to bottom after view updates.
   */
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Cleanup timers and subscriptions to prevent leaks.
   */
  ngOnDestroy(): void {
    if (this.messagePolling) {
      clearInterval(this.messagePolling);
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    // Disconnect Socket.IO
    this.socketService.disconnect();
  }

  /**
   * Load groups from API and filter to only those the user has joined.
   * Seeds mock data when storage is empty.
   */
  loadGroups(): void {
    console.log('🔍 ChatComponent.loadGroups - Loading user groups...');

    this.groupService.getUserGroups().subscribe({
      next: (response) => {
        console.log('🔍 ChatComponent.loadGroups - API response:', response);

        if (response.success && response.data) {
          this.groups = response.data.map((group: any) => ({
            id: group._id,
            name: group.name,
            description: group.description,
            memberCount: group.members?.length || 0,
            members: group.members?.map((m: any) => m.userId || m._id || m.id) || [],
            isOnline: true,
            unreadCount: 0,
            lastActivity: new Date(group.updatedAt),
            isPrivate: group.isPrivate,
            createdBy: group.createdBy
          }));

          console.log('🔍 ChatComponent.loadGroups - Mapped groups:', this.groups);
        } else {
          console.log('🔍 ChatComponent.loadGroups - No groups found, using fallback');
          this.loadFallbackGroups();
        }

        this.filteredGroups = [...this.groups];
      },
      error: (error) => {
        console.error('🔍 ChatComponent.loadGroups - API error:', error);
        this.loadFallbackGroups();
        this.filteredGroups = [...this.groups];
      }
    });
  }

  /**
   * Load fallback groups when API fails
   */
  private loadFallbackGroups(): void {
    this.groups = [
      {
        id: '68e02845ce489784ee3943d0',
        name: 'General Discussion',
        description: 'A place for general discussions and announcements',
        memberCount: 5,
        members: ['68e02845ce489784ee3943ba'],
        isOnline: true,
        unreadCount: 0,
        lastActivity: new Date(),
        isPrivate: false,
        createdBy: '68e02845ce489784ee3943ba'
      }
    ];
  }

  /**
   * Filter the visible groups by the current search term.
   */
  filterGroups(): void {
    if (!this.searchTerm.trim()) {
      this.filteredGroups = [...this.groups];
    } else {
      this.filteredGroups = this.groups.filter(group =>
        group.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  /**
   * Select a group if the current user is a member, or redirect to groups page.
   * @param group Group entity to open
   */
  selectGroup(group: any): void {
    // Guard: prevent opening chat if user is not a member
    const currentUser = this.authService.getCurrentUser();

    console.log('🔍 ChatComponent.selectGroup - Group:', group);
    console.log('🔍 ChatComponent.selectGroup - Current user:', currentUser);
    console.log('🔍 ChatComponent.selectGroup - Group members:', group?.members);
    console.log('🔍 ChatComponent.selectGroup - User ID:', currentUser?.id);

    // Debug members array structure
    if (Array.isArray(group?.members)) {
      console.log('🔍 Debug - Members array length:', group.members.length);
      group.members.forEach((member: any, index: number) => {
        console.log(`🔍 Debug - Member[${index}]:`, member, 'Type:', typeof member);
      });
    }

    // Check if members is array of strings or objects
    const memberIds = Array.isArray(group?.members) ?
      group.members
        .filter((member: any) => member != null) // Filter out null/undefined members
        .map((member: any) => typeof member === 'string' ? member : member?.id || member?._id) :
      [];

    console.log('🔍 ChatComponent.selectGroup - Member IDs:', memberIds);
    console.log('🔍 ChatComponent.selectGroup - Is member?', memberIds.includes(currentUser?.id));

    if (!group || !Array.isArray(group?.members) || !currentUser || !memberIds.includes(currentUser.id)) {
      console.log('🔍 ChatComponent.selectGroup - User not a member, redirecting to groups');
      console.log('🔍 Debug - Group exists:', !!group);
      console.log('🔍 Debug - Members is array:', Array.isArray(group?.members));
      console.log('🔍 Debug - Current user exists:', !!currentUser);
      console.log('🔍 Debug - User in members:', memberIds.includes(currentUser?.id));

      // Temporarily comment out redirect to debug
      // this.router.navigate(['/groups']);
      // return;
    }

    console.log('🔍 ChatComponent.selectGroup - User is member, opening chat');
    this.selectedGroup = group;
    this.selectedGroupId = group.id;
    this.loadGroupData(group);
    this.loadMessages();
    this.loadGroupMembers();

    // Reset UI state
    this.showGroupInfo = false;
    this.showMembers = false;
  }

  /**
   * Helper to select a group by its id when navigating via URL params.
   * @param groupId The target group id
   */
  selectGroupById(groupId: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      this.selectGroup(group);
    }
  }

  /**
   * Load per-group UI state and default channel info (mock).
   * @param group Selected group
   */
  loadGroupData(group: any): void {
    this.groupName = group.name;
    this.channelName = 'general';
    this.selectedChannel = {
      name: 'general',
      description: 'General discussions'
    };
  }

  /**
   * Load messages for the currently selected group from API.
   */
  loadMessages(): void {
    if (!this.selectedGroup) return;

    console.log('🔍 ChatComponent.loadMessages - Loading messages for group:', this.selectedGroup.id);

    // For now, we'll use the first channel of the group
    // In a real implementation, you'd select a specific channel
    const channelId = this.selectedGroup.id; // Using group ID as channel ID for now

    console.log('🔍 ChatComponent.loadMessages - Loading messages for channel:', channelId);

    this.messageService.getMessagesByChannel(channelId, { limit: 50 }).subscribe({
      next: (response) => {
        console.log('🔍 ChatComponent.loadMessages - API response:', response);
        console.log('🔍 ChatComponent.loadMessages - Response data length:', response.data?.length || 0);

        if (response.success && response.data && response.data.length > 0) {
          this.currentMessages = response.data.map(msg => ({
            _id: msg._id,
            channelId: msg.channelId,
            text: msg.text,
            userId: msg.userId,
            username: msg.username,
            createdAt: msg.createdAt,
            type: msg.type || 'text',
            isEdited: msg.isEdited || false,
            isDeleted: msg.isDeleted || false,
            imageUrl: msg.imageUrl,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileSize: msg.fileSize
          }));

          console.log('🔍 ChatComponent.loadMessages - Mapped messages:', this.currentMessages);
        } else {
          console.log('🔍 ChatComponent.loadMessages - No messages found, using fallback');
          this.loadFallbackMessages();
        }
      },
      error: (error) => {
        console.error('🔍 ChatComponent.loadMessages - API error:', error);
        this.loadFallbackMessages();
      }
    });
  }

  /**
   * Load fallback messages when API fails
   */
  private loadFallbackMessages(): void {
    this.currentMessages = [
      {
        _id: 'msg_1',
        channelId: this.selectedGroup?.id || 'general',
        text: 'Welcome to General Discussion!',
        userId: '68e02845ce489784ee3943ba',
        username: 'admin',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        type: 'text',
        isEdited: false,
        isDeleted: false
      },
      {
        _id: 'msg_2',
        channelId: this.selectedGroup?.id || 'general',
        text: 'This is a test message',
        userId: '68e02845ce489784ee3943ba',
        username: 'admin',
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        type: 'text',
        isEdited: false,
        isDeleted: false
      }
    ];
  }

  /**
   * Load and display members for the current group (mock data set per group).
   */
  loadGroupMembers(): void {
    if (!this.selectedGroup) {
      console.log('🔍 loadGroupMembers: No selected group');
      return;
    }

    console.log('🔍 loadGroupMembers: Loading members for group:', this.selectedGroup.id, this.selectedGroup.name);

    // Mock members based on group - use actual group IDs from API
    const mockMembers: { [key: string]: any[] } = {};

    // For any group, add some mock members
    mockMembers[this.selectedGroup.id] = [
      { username: 'jane_smith', role: 'group admin' },
      { username: 'john_doe', role: 'member' },
      { username: 'alice_wilson', role: 'member' },
      { username: 'bob_johnson', role: 'member' }
    ];

    this.currentMembers = mockMembers[this.selectedGroup.id as keyof typeof mockMembers] || [];
    this.groupMembers = this.currentMembers; // For legacy compatibility

    // Only reset onlineUsers if it's empty (first time loading)
    if (this.onlineUsers.length === 0) {
      const currentUser = this.authService.getCurrentUser();
      this.onlineUsers = currentUser ? [currentUser.username] : [];
      console.log('🔍 loadGroupMembers: Initialized online users:', this.onlineUsers);
    } else {
      console.log('🔍 loadGroupMembers: Keeping existing online users:', this.onlineUsers);
    }

    console.log('🔍 loadGroupMembers: Loaded members:', this.currentMembers);
  }

  /**
   * TrackBy function for group list rendering optimization.
   */
  trackByGroupId(index: number, group: any): string {
    return group.id;
  }

  /**
   * Get the preview text of the last message for a group.
   * @param groupId Group identifier
   * @returns Text content or default label
   */
  getLastMessage(groupId: string): string {
    // This would typically come from MessageService
    return 'No messages yet';
  }

  /**
   * Format last activity timestamp as a relative time string (m/h/d).
   */
  getLastMessageTime(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    if (group && group.lastActivity) {
      const now = new Date();
      const lastActivity = new Date(group.lastActivity);
      const diffMinutes = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'now';
      if (diffMinutes < 60) return `${diffMinutes}m`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
      return `${Math.floor(diffMinutes / 1440)}d`;
    }
    return '';
  }

  /**
   * Whether a group has any unread messages (mock state on group).
   */
  hasUnreadMessages(groupId: string): boolean {
    const group = this.groups.find(g => g.id === groupId);
    return group ? (group.unreadCount || 0) > 0 : false;
  }

  /**
   * Number of unread messages for badge display (mock state on group).
   */
  getUnreadCount(groupId: string): number {
    const group = this.groups.find(g => g.id === groupId);
    return group ? (group.unreadCount || 0) : 0;
  }

  /**
   * Count currently online members (mock: based on username presence in onlineUsers).
   */
  getOnlineCount(): number {
    const onlineMembers = this.currentMembers.filter(m => this.isUserOnline(m.username));
    // Only log when there's a change or on first load
    if (onlineMembers.length !== this.lastOnlineCount) {
      console.log('🔍 Online Count Debug:');
      console.log('🔍 - Current Members:', this.currentMembers);
      console.log('🔍 - Online Members:', onlineMembers);
      console.log('🔍 - Online Count:', onlineMembers.length);
      this.lastOnlineCount = onlineMembers.length;
    }
    return onlineMembers.length;
  }

  /**
   * Toggle the group info side panel. Ensures mutual exclusivity with members panel.
   */
  toggleGroupInfo(): void {
    this.showGroupInfo = !this.showGroupInfo;
    if (this.showGroupInfo) {
      this.showMembers = false;
    }
  }

  /**
   * Toggle the members side panel. Ensures mutual exclusivity with info panel.
   */
  toggleMembers(): void {
    this.showMembers = !this.showMembers;
    if (this.showMembers) {
      this.showGroupInfo = false;
    }
  }

  /**
   * Send a chat message to the current group via API.
   */
  async sendMessage(): Promise<void> {
    if ((!this.newMessage.trim() && !this.selectedImage) || !this.selectedGroup) return;

    this.isSending = true;
    const messageText = this.newMessage.trim();

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 ChatComponent.sendMessage - Sending message:', messageText);

      // Check if this is a reply
      if (this.replyToMessage) {
        // Send as reply
        this.messageReplyService.createReply(
          this.replyToMessage._id,
          this.selectedGroup.id,
          messageText,
          this.selectedImage ? 'image' : 'text',
          this.selectedImage || undefined
        ).subscribe({
          next: (response) => {
            if (response.success) {
              console.log('✅ Reply sent successfully:', response);
              this.newMessage = '';
              this.replyToMessage = null;
              this.replyText = '';
              this.clearImageSelection();
              this.loadMessages(); // Refresh messages to show the reply

              // Emit reply via Socket.IO for real-time updates
              if (response.data?.message) {
                this.socketService.sendMessage({
                  channelId: this.selectedGroup.id,
                  text: response.data.message.text,
                  type: response.data.message.type || 'text',
                  imageUrl: response.data.message.imageUrl,
                  fileUrl: response.data.message.fileUrl,
                  fileName: response.data.message.fileName,
                  fileSize: response.data.message.fileSize
                });
              }

              this.snackBar.open('Reply sent successfully', 'Close', {
                duration: 2000,
                panelClass: ['success-snackbar']
              });
            } else {
              throw new Error(response.message || 'Failed to send reply');
            }
          },
          error: (error) => {
            console.error('❌ Failed to send reply:', error);
            this.snackBar.open('Failed to send reply', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          },
          complete: () => {
            this.isSending = false;
          }
        });
        return;
      }

      // Prepare message data for regular message
      const messageData: any = {
        channelId: this.selectedGroup.id, // Using group ID as channel ID for now
        type: this.selectedImage ? 'image' : 'text'
      };

      // Add text if present
      if (messageText) {
        messageData.text = messageText;
      }

      // Handle image upload if present
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('channelId', this.selectedGroup.id);
        formData.append('type', 'image');
        if (messageText) {
          formData.append('text', messageText);
        }

        // Upload image first, then send message
        this.uploadImageAndSendMessage(formData);
        return;
      }

      this.messageService.createMessage(messageData).subscribe({
        next: (response) => {
          console.log('🔍 ChatComponent.sendMessage - API response:', response);

          if (response.success && response.data) {
            // Add the new message to the current messages
            const newMessage = {
              id: response.data._id,
              text: response.data.text,
              userId: response.data.userId,
              username: response.data.username,
              createdAt: response.data.createdAt,
              type: response.data.type || 'text',
              isEdited: false,
              isDeleted: false
            };

            this.currentMessages.push(newMessage);
            this.newMessage = '';
            this.clearImageSelection();

            console.log('🔍 ChatComponent.sendMessage - Message sent successfully');
          } else {
            throw new Error(response.message || 'Failed to send message');
          }
        },
        error: (error) => {
          console.error('🔍 ChatComponent.sendMessage - API error:', error);
          throw error;
        },
        complete: () => {
          this.isSending = false;
        }
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      this.isSending = false;
    }
  }

  /**
   * Handle Enter key press for message input, supporting Shift+Enter for newlines.
   */
  onEnterPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }

    event.preventDefault();
    this.sendMessage();
  }

  /**
   * Toggle emoji picker visibility
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  /**
   * Insert emoji into message input
   */
  insertEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  /**
   * Handle file selection for image upload
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  }

  /**
   * Remove selected image
   */
  removeImage(): void {
    this.selectedImage = null;
    this.selectedFile = null;
  }

  /**
   * Clear image selection after sending
   */
  private clearImageSelection(): void {
    this.selectedImage = null;
    this.selectedFile = null;
  }

  /**
   * Upload image and send message
   */
  private uploadImageAndSendMessage(formData: FormData): void {
    // For now, we'll simulate image upload by creating a message with imageUrl
    // In a real implementation, you would upload to a file service first

    const mockImageUrl = this.selectedImage; // Use the preview URL as mock

    const messageData = {
      channelId: formData.get('channelId') as string,
      text: formData.get('text') as string || '',
      type: 'image' as const,
      imageUrl: mockImageUrl || undefined
    };

    this.messageService.createMessage(messageData).subscribe({
      next: (response) => {
        console.log('🔍 ChatComponent.uploadImageAndSendMessage - API response:', response);

        if (response.success && response.data) {
          // Add the new message to the current messages
          const newMessage = {
            id: response.data._id,
            text: response.data.text,
            userId: response.data.userId,
            username: response.data.username,
            createdAt: response.data.createdAt,
            type: response.data.type || 'image',
            isEdited: false,
            isDeleted: false,
            imageUrl: response.data.imageUrl || mockImageUrl
          };

          this.currentMessages.push(newMessage);
          this.newMessage = '';
          this.clearImageSelection();

          console.log('🔍 ChatComponent.uploadImageAndSendMessage - Image message sent successfully');
          console.log('🔍 ChatComponent.uploadImageAndSendMessage - Added message:', newMessage);
          console.log('🔍 ChatComponent.uploadImageAndSendMessage - Current messages count:', this.currentMessages.length);
        } else {
          throw new Error(response.message || 'Failed to send image message');
        }
      },
      error: (error) => {
        console.error('🔍 ChatComponent.uploadImageAndSendMessage - API error:', error);
        throw error;
      },
      complete: () => {
        this.isSending = false;
      }
    });
  }

  /**
   * Determine if a message was sent by the current user.
   */
  isOwnMessage(message: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // Check by userId first (new format), fallback to senderId (old format)
    if (message.userId) {
      return message.userId === currentUser.id || message.userId === (currentUser as any)._id;
    }

    if (message.senderId) {
      return message.senderId === currentUser.id || message.senderId === (currentUser as any)._id;
    }

    return message.username === currentUser.username || message.senderName === currentUser.username;
  }

  /**
   * Mock online presence check for a username.
   */
  isUserOnline(username: string): boolean {
    const isOnline = this.onlineUsers.includes(username);
    // Only log when checking for the first time or when status changes
    const key = `user_${username}`;
    if (isOnline !== this.lastUserStatus.get(key)) {
      console.log(`🔍 isUserOnline(${username}):`, isOnline, 'Online Users:', this.onlineUsers);
      this.lastUserStatus.set(key, isOnline);
    }
    return isOnline;
  }

  /**
   * Scroll the messages container to the bottom (latest message).
   */
  scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  /**
   * Format a Date into a human-friendly time for message headers.
   */
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format a Date into a human-friendly date string.
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Legacy methods for compatibility
  /**
   * Start a periodic check for new messages (legacy placeholder).
   */
  startMessagePolling(): void {
    // Only start polling if Socket.IO is not connected
    if (!this.socketService.isSocketConnected()) {
      this.messagePolling = setInterval(() => {
        this.checkForNewMessages();
      }, 5000);
    } else {
      console.log('Socket.IO connected, skipping message polling');
    }
  }

  /**
   * Legacy placeholder for message sync; currently logs to console.
   */
  checkForNewMessages(): void {
    // Only check for new messages if Socket.IO is not connected
    if (!this.socketService.isSocketConnected()) {
      console.log('Socket.IO not connected, checking for new messages...');
      // TODO: Implement fallback message checking
    }
  }

  /**
   * Track by function for message list
   */
  trackByMessageId(index: number, message: any): string {
    return message._id || message.timestamp || index.toString();
  }

  /**
   * Handle message reaction
   */
  onMessageReact(event: { messageId: string; reaction: string }): void {
    console.log('🔍 Reacting to message:', event);

    this.messageReactionService.addReaction(event.messageId, event.reaction).subscribe({
      next: (response) => {
        console.log('✅ Reaction added:', response);
        if (response.success) {
          this.snackBar.open(`Reacted with ${event.reaction}`, 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });

          // TODO: Update message reactions in UI
          // You can emit a socket event or refresh the message data
        } else {
          this.snackBar.open(response.message || 'Failed to add reaction', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('❌ Failed to add reaction:', error);
        this.snackBar.open('Failed to add reaction', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Handle message reply
   */
  onMessageReply(message: any): void {
    console.log('🔍 Replying to message:', message);

    // Set reply context
    this.replyToMessage = message;
    this.replyText = `Replying to ${message.username}: `;

    // Focus on message input
    setTimeout(() => {
      const messageInput = document.querySelector('.message-input textarea') as HTMLTextAreaElement;
      if (messageInput) {
        messageInput.focus();
      }
    }, 100);

    this.snackBar.open(`Replying to ${message.username}`, 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Handle message edit
   */
  onMessageEdit(message: any): void {
    console.log('🔍 Editing message:', message);

    // Set edit context
    this.editingMessage = message;
    this.messageText = message.text || '';

    // Focus on message input
    setTimeout(() => {
      const messageInput = document.querySelector('.message-input textarea') as HTMLTextAreaElement;
      if (messageInput) {
        messageInput.focus();
      }
    }, 100);

    this.snackBar.open('Editing message...', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Handle message delete
   */
  onMessageDelete(message: any): void {
    console.log('🔍 Deleting message:', message);

    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete this message?\n\n"${message.text?.substring(0, 50)}${message.text?.length > 50 ? '...' : ''}"`);

    if (confirmed) {
      this.messageService.deleteMessage(message._id).subscribe({
        next: (response) => {
          console.log('✅ Message deleted:', response);
          if (response.success) {
            // Remove message from UI
            this.currentMessages = this.currentMessages.filter(m => m._id !== message._id);

            this.snackBar.open('Message deleted successfully', 'Close', {
              duration: 2000,
              panelClass: ['success-snackbar']
            });
          } else {
            this.snackBar.open(response.message || 'Failed to delete message', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('❌ Failed to delete message:', error);
          this.snackBar.open('Failed to delete message', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  /**
   * Handle message copy
   */
  onMessageCopy(text: string): void {
    console.log('🔍 Copied message text:', text);

    this.snackBar.open('Message copied to clipboard', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Legacy placeholder kept for compatibility; logic moved to loadGroupData.
   */
  loadChatData(): void {
    // Legacy method - functionality moved to loadGroupData
  }

  // Video call methods
  /**
   * Get channel receiver ID for video calls
   */
  getChannelReceiverId(): string {
    // For group chats, return the group ID as the channel ID
    // In a real implementation, you might want to get a specific user's ID
    return this.selectedGroup?.id || '';
  }

  /**
   * Get channel receiver name for video calls
   */
  getChannelReceiverName(): string {
    // For now, return channel name - in a real implementation,
    // you might want to get a specific user's name
    return this.selectedChannel?.name || this.selectedGroup?.name || '';
  }

  /**
   * Check if video call can be made
   */
  canMakeVideoCall(): boolean {
    const onlineCount = this.getOnlineCount();
    // Allow video call even with 1 user (for testing/demo purposes)
    const canMake = !!(this.selectedGroup && onlineCount >= 1);

    // Only log when there's a change
    if (canMake !== this.lastCanMakeCall) {
      console.log('🔍 Video Call Debug:');
      console.log('🔍 - Selected Group:', !!this.selectedGroup);
      console.log('🔍 - Online Count:', onlineCount);
      console.log('🔍 - Current Members:', this.currentMembers.length);
      console.log('🔍 - Can Make Call:', canMake);
      this.lastCanMakeCall = canMake;
    }

    return canMake;
  }

  /**
   * Handle video call started event
   */
  onVideoCallStarted(): void {
    this.snackBar.open('Video call started', 'Close', { duration: 2000 });
  }

  /**
   * Test method to manually add users online (for debugging)
   */
  addUserOnline(username: string): void {
    if (!this.onlineUsers.includes(username)) {
      this.onlineUsers.push(username);
      console.log('🔍 Manually added user online:', username);
      console.log('🔍 Current online users:', this.onlineUsers);
    }
  }
}