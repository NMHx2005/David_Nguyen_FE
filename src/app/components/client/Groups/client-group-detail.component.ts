import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { Group, Channel, User, GroupStatus, ChannelType, UserRole } from '../../../models';

@Component({
  selector: 'app-client-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientLayoutComponent],
  template: `
    <app-client-layout>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">{{ group?.name || 'Group Details' }}</h1>
            <p class="page-subtitle">View group information and join channels</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="goBack()">
              <i class="material-icons">arrow_back</i>
              Back to Dashboard
            </button>
            <button class="btn btn-primary" (click)="joinGroup()" *ngIf="!isMember">
              <i class="material-icons">group_add</i>
              Join Group
            </button>
            <button class="btn btn-warning" (click)="leaveGroup()" *ngIf="isMember">
              <i class="material-icons">exit_to_app</i>
              Leave Group
            </button>
          </div>
        </div>
      </div>

      <!-- Group Content -->
      <div class="group-detail-content" *ngIf="group">
        <!-- Group Info Card -->
        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="material-icons">info</i>
              Group Information
            </h2>
            <div class="status-badge" [ngClass]="getStatusClass(group.status || GroupStatus.ACTIVE)">
              {{ group.status || 'active' }}
            </div>
          </div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <label>Name:</label>
                <span>{{ group.name }}</span>
              </div>
              <div class="info-item">
                <label>Category:</label>
                <span class="category-tag">{{ group.category }}</span>
              </div>
              <div class="info-item">
                <label>Members:</label>
                <span>{{ group.memberCount }} members</span>
              </div>
              <div class="info-item">
                <label>Channels:</label>
                <span>{{ channels.length }} channels</span>
              </div>
              <div class="info-item">
                <label>Created:</label>
                <span>{{ formatDate(group.createdAt) }}</span>
              </div>
            </div>
            <div class="description">
              <label>Description:</label>
              <p>{{ group.description }}</p>
            </div>
          </div>
        </div>

        <!-- Channels Section -->
        <div class="channels-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="material-icons">chat_bubble</i>
              Available Channels
            </h2>
          </div>

          <div class="channels-grid">
            <div class="channel-card" *ngFor="let channel of channels">
              <div class="channel-header">
                <div class="channel-info">
                  <h3 class="channel-name">{{ channel.name }}</h3>
                  <p class="channel-description">{{ channel.description || 'No description' }}</p>
                </div>
                <div class="channel-type" [ngClass]="getChannelTypeClass(channel.type)">
                  <i class="material-icons">{{ getChannelIcon(channel.type) }}</i>
                  {{ channel.type }}
                </div>
              </div>
              <div class="channel-stats">
                <span class="member-count">
                  <i class="material-icons">people</i>
                  {{ channel.memberCount || 0 }} members
                </span>
                <span class="last-activity">
                  <i class="material-icons">schedule</i>
                  {{ formatDate(channel.createdAt) }}
                </span>
              </div>
              <div class="channel-actions">
                <button class="btn btn-primary" (click)="joinChannel(channel)">
                  <i class="material-icons">chat</i>
                  Join Channel
                </button>
                <button class="btn btn-secondary" (click)="viewChannel(channel)">
                  <i class="material-icons">visibility</i>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="!group">
        <div class="loading-spinner">
          <i class="material-icons">refresh</i>
        </div>
        <p>Loading group details...</p>
      </div>
    </app-client-layout>
  `,
  styles: [`
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header-info {
      flex: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .btn-secondary:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-warning:hover {
      background: #e67e22;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
    }

    .group-detail-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .card-header {
      background: #f8f9fa;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .card-content {
      padding: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .category-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
      display: inline-block;
      width: fit-content;
    }

    .description {
      margin-top: 1rem;
    }

    .description label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.9rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .description p {
      color: #495057;
      line-height: 1.6;
      margin: 0;
    }

    .channels-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .section-header {
      margin-bottom: 2rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .channel-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .channel-card:hover {
      background: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .channel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .channel-info {
      flex: 1;
    }

    .channel-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
    }

    .channel-description {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .channel-type {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .channel-type.text {
      background: #e3f2fd;
      color: #1976d2;
    }

    .channel-type.voice {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .channel-type.video {
      background: #e8f5e8;
      color: #388e3c;
    }

    .channel-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .channel-stats span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .channel-actions {
      display: flex;
      gap: 0.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .loading-spinner {
      margin-bottom: 1rem;
    }

    .loading-spinner i {
      font-size: 2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .channels-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientGroupDetailComponent implements OnInit {
  group: Group | null = null;
  channels: Channel[] = [];
  groupId: string = '';
  isMember: boolean = false;

  GroupStatus = GroupStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /**
   * Lifecycle: subscribe to route params and load group details.
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      if (this.groupId) {
        this.loadGroupDetails();
      }
    });
  }

  /**
   * Load group and channels (Phase 1 mock data) and compute membership.
   */
  loadGroupDetails(): void {
    // Mock data - replace with actual API call
    this.group = {
      id: this.groupId,
      name: 'Web Development Team',
      description: 'A group for web developers to collaborate and share knowledge about modern web technologies.',
      category: 'Technology',
      isActive: true,
      status: GroupStatus.ACTIVE,
      memberCount: 15,
      channels: [],
      members: ['user1', 'user2', 'user3'],
      admins: ['admin1'],
      createdBy: 'admin1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    };

    this.channels = [
      {
        id: 'channel1',
        name: 'general',
        description: 'General discussions and announcements',
        groupId: this.groupId,
        type: ChannelType.TEXT,
        memberCount: 15,
        members: ['user1', 'user2', 'user3'],
        admins: ['admin1'],
        bannedUsers: [],
        createdBy: 'admin1',
        isActive: true,
        isPrivate: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        settings: {
          slowMode: 0,
          requireApproval: false,
          allowReactions: true,
          allowPolls: true
        }
      },
      {
        id: 'channel2',
        name: 'frontend',
        description: 'Frontend development discussions',
        groupId: this.groupId,
        type: ChannelType.TEXT,
        memberCount: 8,
        members: ['user1', 'user2'],
        admins: ['admin1'],
        bannedUsers: [],
        createdBy: 'admin1',
        isActive: true,
        isPrivate: false,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-19'),
        settings: {
          slowMode: 0,
          requireApproval: false,
          allowReactions: true,
          allowPolls: true
        }
      }
    ];

    // Check if current user is a member
    this.isMember = this.checkIfMember('current_user_id'); // Replace with actual user ID
  }

  /**
   * Check if user is a member of the group
   */
  private checkIfMember(userId: string): boolean {
    if (!this.group || !this.group.members) {
      return false;
    }

    return this.group.members.some((member: any) => {
      // Handle both string and object formats
      if (typeof member === 'string') {
        return member === userId;
      } else if (typeof member === 'object' && member !== null) {
        return member.userId === userId || member._id === userId || member.id === userId;
      }
      return false;
    });
  }

  /**
   * Navigate back to dashboard.
   */
  goBack(): void {
    this.router.navigate(['/groups']);
  }

  /**
   * Request to join the group (placeholder).
   */
  joinGroup(): void {
    if (confirm('Are you sure you want to join this group?')) {
      alert('Join group functionality - to be implemented');
    }
  }

  /**
   * Leave the group (placeholder).
   */
  leaveGroup(): void {
    if (confirm('Are you sure you want to leave this group?')) {
      alert('Leave group functionality - to be implemented');
    }
  }

  /**
   * Navigate to chat view for a channel.
   */
  joinChannel(channel: Channel): void {
    this.router.navigate(['/group', this.groupId, 'channel', channel.id]);
  }

  /**
   * View channel details (placeholder dialog).
   */
  viewChannel(channel: Channel): void {
    alert(`View channel: ${channel.name}`);
  }

  /**
   * Convert group status to CSS class.
   */
  getStatusClass(status: GroupStatus): string {
    return status.toLowerCase();
  }

  /**
   * Convert channel type to CSS class.
   */
  getChannelTypeClass(type: ChannelType): string {
    return type.toLowerCase();
  }

  /**
   * Resolve Material icon by channel type.
   */
  getChannelIcon(type: ChannelType): string {
    switch (type) {
      case ChannelType.TEXT: return 'chat';
      case ChannelType.VOICE: return 'mic';
      case ChannelType.VIDEO: return 'videocam';
      default: return 'chat';
    }
  }

  /**
   * Format Date to localized short string.
   */
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
