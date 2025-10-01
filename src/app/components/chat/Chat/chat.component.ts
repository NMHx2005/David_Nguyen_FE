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
import { AuthService } from '../../auth/auth.service';

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
                <button mat-icon-button matTooltip="Group Info" (click)="toggleGroupInfo()">
                  <mat-icon>info</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Members" (click)="toggleMembers()">
                  <mat-icon matBadge="{{ selectedGroup.memberCount }}" matBadgeColor="accent">people</mat-icon>
                </button>
                <button mat-icon-button matTooltip="More Options">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </div>
            </mat-card>

            <!-- Messages Area -->
            <div class="messages-container" #messagesContainer>
              <div *ngFor="let message of currentMessages" 
                   class="message-item" 
                   [class.own-message]="isOwnMessage(message)">
                <div class="message-avatar">
                  {{ ((message.senderName || message.username) || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-username">{{ message.senderName || message.username || 'Unknown' }}</span>
                    <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <div class="message-text">{{ message.text }}</div>
                </div>
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
                  <button mat-icon-button type="button" matTooltip="Attach File">
                    <mat-icon>attach_file</mat-icon>
                  </button>
                  <button mat-icon-button type="button" matTooltip="Emoji">
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

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .message-item.own-message {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .message-content {
      max-width: 70%;
      background: white;
      padding: 12px 16px;
      border-radius: 18px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .own-message .message-content {
      background: #2196f3;
      color: white;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .message-username {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .message-text {
      line-height: 1.4;
      word-wrap: break-word;
      font-size: 0.9rem;
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
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

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

  // UI state
  showGroupInfo = false;
  showMembers = false;

  // Legacy properties (for compatibility)
  groupId: string = '';
  channelId: string = '';
  groupName: string = '';
  channelName: string = '';
  channelInfo: any = {};
  messages: any[] = [];
  groupMembers: any[] = [];
  onlineUsers: string[] = [];
  private messagePolling: any;
  private userSub: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /**
   * Initialize chat view and subscriptions.
   * - Loads groups the current user belongs to
   * - Subscribes to auth changes and route params
   * - Starts polling legacy message updates
   */
  ngOnInit(): void {
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
    this.startMessagePolling();
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
  }

  /**
   * Load groups from localStorage and filter to only those the user has joined.
   * Seeds mock data when storage is empty.
   */
  loadGroups(): void {
    // Load groups from localStorage (mock data)
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      const allGroups = JSON.parse(storedGroups);
      const currentUser = this.authService.getCurrentUser();
      // Only show groups where current user is a member
      this.groups = Array.isArray(allGroups)
        ? allGroups.filter((g: any) => Array.isArray(g?.members) && currentUser && g.members.includes(currentUser.id))
        : [];
    } else {
      // Default mock groups
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || '1';

      this.groups = [
        {
          id: '1',
          name: 'Development Team',
          description: 'Main development team for the project',
          memberCount: 8,
          members: ['1', '2', '3', userId], // Include current user
          isOnline: true,
          createdAt: new Date('2025-01-01'),
          lastActivity: new Date(),
          unreadCount: 3
        },
        {
          id: '2',
          name: 'Design Team',
          description: 'UI/UX Design team',
          memberCount: 5,
          members: ['1', '2', userId], // Include current user
          isOnline: true,
          createdAt: new Date('2025-01-02'),
          lastActivity: new Date(Date.now() - 3600000),
          unreadCount: 0
        },
        {
          id: '3',
          name: 'Project Management',
          description: 'Project planning and coordination',
          memberCount: 3,
          members: ['1', userId], // Include current user
          isOnline: false,
          createdAt: new Date('2025-01-03'),
          lastActivity: new Date(Date.now() - 86400000),
          unreadCount: 1
        }
      ];
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
    this.filteredGroups = [...this.groups];
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
    if (!group || !Array.isArray(group?.members) || !currentUser || !group.members.includes(currentUser.id)) {
      this.router.navigate(['/groups']);
      return;
    }

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
   * Load messages for the currently selected group from localStorage or seed defaults.
   */
  loadMessages(): void {
    if (!this.selectedGroup) return;

    // Load messages for selected group (mock data)
    const messagesKey = `messages_${this.selectedGroup.id}`;
    const storedMessages = localStorage.getItem(messagesKey);

    if (storedMessages) {
      this.currentMessages = JSON.parse(storedMessages);
    } else {
      // Default mock messages for different groups (standardized format)
      const mockMessages = {
        '1': [
          {
            id: 'msg_1_1',
            text: 'Welcome everyone to the Development Team! 👋',
            senderId: '1',
            senderName: 'super',
            timestamp: Date.now() - 3600000,
            type: 'TEXT',
            isEdited: false,
            isDeleted: false
          },
          {
            id: 'msg_1_2',
            text: 'Thanks! Looking forward to working with you all.',
            senderId: '2',
            senderName: 'admin',
            timestamp: Date.now() - 3000000,
            type: 'TEXT',
            isEdited: false,
            isDeleted: false
          },
          {
            id: 'msg_1_3',
            text: 'Hello! What should we work on first?',
            senderId: '3',
            senderName: 'user',
            timestamp: Date.now() - 2400000,
            type: 'TEXT',
            isEdited: false,
            isDeleted: false
          }
        ],
        '2': [
          {
            id: 'msg_2_1',
            text: 'Let\'s review the new mockups',
            senderId: '4',
            senderName: 'designer1',
            timestamp: Date.now() - 1800000,
            type: 'TEXT',
            isEdited: false,
            isDeleted: false
          }
        ],
        '3': [
          {
            id: 'msg_3_1',
            text: 'Sprint planning meeting tomorrow at 10 AM',
            senderId: '5',
            senderName: 'pm1',
            timestamp: Date.now() - 86400000,
            type: 'TEXT',
            isEdited: false,
            isDeleted: false
          }
        ]
      };

      this.currentMessages = mockMessages[this.selectedGroup.id as keyof typeof mockMessages] || [];
      localStorage.setItem(messagesKey, JSON.stringify(this.currentMessages));
    }
  }

  /**
   * Load and display members for the current group (mock data set per group).
   */
  loadGroupMembers(): void {
    if (!this.selectedGroup) return;

    // Mock members based on group
    const mockMembers = {
      '1': [
        { username: 'super', role: 'super admin' },
        { username: 'admin', role: 'group admin' },
        { username: 'user', role: 'member' },
        { username: 'dev1', role: 'member' },
        { username: 'dev2', role: 'member' }
      ],
      '2': [
        { username: 'designer1', role: 'group admin' },
        { username: 'designer2', role: 'member' },
        { username: 'ux1', role: 'member' }
      ],
      '3': [
        { username: 'pm1', role: 'group admin' },
        { username: 'pm2', role: 'member' }
      ]
    };

    this.currentMembers = mockMembers[this.selectedGroup.id as keyof typeof mockMembers] || [];
    this.groupMembers = this.currentMembers; // For legacy compatibility
    this.onlineUsers = this.currentMembers.map(m => m.username); // Mock all as online
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
    const messagesKey = `messages_${groupId}`;
    const storedMessages = localStorage.getItem(messagesKey);
    if (storedMessages) {
      const messages = JSON.parse(storedMessages);
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.text) {
          return lastMessage.text.length > 30 ?
            lastMessage.text.substring(0, 30) + '...' :
            lastMessage.text;
        }
      }
    }
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
    return this.currentMembers.filter(m => this.isUserOnline(m.username)).length;
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
   * Send a chat message to the current group (mock async), persist to storage.
   */
  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.selectedGroup) return;

    this.isSending = true;
    const messageText = this.newMessage.trim();

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentUser = this.authService.getCurrentUser();
      const newMessage = {
        id: `msg_${Date.now()}`,
        text: messageText,
        senderId: currentUser?.id || '1',
        senderName: currentUser?.username || 'Unknown',
        timestamp: Date.now(),
        type: 'TEXT',
        isEdited: false,
        isDeleted: false
      };

      this.currentMessages.push(newMessage);

      // Save to localStorage
      const messagesKey = `messages_${this.selectedGroup.id}`;
      localStorage.setItem(messagesKey, JSON.stringify(this.currentMessages));

      // Update group last activity
      this.selectedGroup.lastActivity = new Date();
      const groupIndex = this.groups.findIndex(g => g.id === this.selectedGroup.id);
      if (groupIndex !== -1) {
        this.groups[groupIndex] = this.selectedGroup;
        localStorage.setItem('groups', JSON.stringify(this.groups));
      }

      this.newMessage = '';
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
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
   * Determine if a message was sent by the current user.
   */
  isOwnMessage(message: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    // Check by senderId first (new format), fallback to username (old format)
    if (message.senderId) {
      return message.senderId === currentUser.id;
    }

    return message.username === currentUser.username || message.senderName === currentUser.username;
  }

  /**
   * Mock online presence check for a username.
   */
  isUserOnline(username: string): boolean {
    return this.onlineUsers.includes(username);
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
    this.messagePolling = setInterval(() => {
      this.checkForNewMessages();
    }, 5000);
  }

  /**
   * Legacy placeholder for message sync; currently logs to console.
   */
  checkForNewMessages(): void {
    console.log('Checking for new messages...');
  }

  /**
   * Legacy placeholder kept for compatibility; logic moved to loadGroupData.
   */
  loadChatData(): void {
    // Legacy method - functionality moved to loadGroupData
  }
}