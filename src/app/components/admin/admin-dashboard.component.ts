import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout [pageTitle]="'Admin Dashboard'">
      <div class="admin-dashboard-container">

      <!-- Quick Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-container">
              <mat-icon class="stat-icon">group</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ totalUsers }}</h3>
              <p>Total Users</p>
              <mat-chip color="accent" class="stat-change-chip">
                <mat-icon>trending_up</mat-icon>
                +{{ newUsersThisWeek }} this week
              </mat-chip>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-container">
              <mat-icon class="stat-icon">group_work</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ totalGroups }}</h3>
              <p>Total Groups</p>
              <mat-chip color="accent" class="stat-change-chip">
                <mat-icon>trending_up</mat-icon>
                +{{ newGroupsThisWeek }} this week
              </mat-chip>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-container">
              <mat-icon class="stat-icon">chat</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ totalChannels }}</h3>
              <p>Total Channels</p>
              <mat-chip color="warn" class="stat-change-chip">
                <mat-icon>remove</mat-icon>
                No change
              </mat-chip>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon-container">
              <mat-icon class="stat-icon">message</mat-icon>
            </div>
            <div class="stat-details">
              <h3>{{ totalMessages }}</h3>
              <p>Total Messages</p>
              <mat-chip color="accent" class="stat-change-chip">
                <mat-icon>trending_up</mat-icon>
                +{{ newMessagesToday }} today
              </mat-chip>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Admin Actions -->
      <mat-card class="admin-actions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>dashboard</mat-icon>
            Quick Actions
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions-grid">
            <button mat-raised-button color="primary" class="action-btn" routerLink="/admin/users">
              <mat-icon>people</mat-icon>
              <div class="action-content">
                <span class="action-title">Manage Users</span>
                <span class="action-desc">Add, edit, or remove users</span>
                <mat-chip color="primary">{{ totalUsers }}</mat-chip>
              </div>
            </button>

            <button mat-raised-button color="primary" class="action-btn" routerLink="/admin/groups">
              <mat-icon>group_work</mat-icon>
              <div class="action-content">
                <span class="action-title">Manage Groups</span>
                <span class="action-desc">Create and manage groups</span>
                <mat-chip color="primary">{{ totalGroups }}</mat-chip>
              </div>
            </button>

            <button mat-raised-button color="primary" class="action-btn" routerLink="/admin/channels">
              <mat-icon>forum</mat-icon>
              <div class="action-content">
                <span class="action-title">Manage Channels</span>
                <span class="action-desc">Organize group channels</span>
                <mat-chip color="primary">{{ totalChannels }}</mat-chip>
              </div>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Recent Activity -->
      <mat-card class="recent-activity-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Recent Activity
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="activity-list">
            <div *ngFor="let activity of recentActivity" class="activity-item">
              <div class="activity-icon">
                <mat-icon [color]="getActivityIconColor(activity.type)">
                  {{ getActivityIcon(activity.type) }}
                </mat-icon>
              </div>
              <div class="activity-details">
                <span class="activity-text">{{ activity.description }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
              <mat-chip [color]="getActivityChipColor(activity.type)" class="activity-chip">
                {{ activity.type }}
              </mat-chip>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- System Status -->
      <mat-card class="system-status-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>monitor</mat-icon>
            System Status
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="status-grid">
            <div class="status-item">
              <mat-icon color="primary">storage</mat-icon>
              <span>Database: <strong>Online</strong></span>
            </div>
            <div class="status-item">
              <mat-icon color="primary">wifi</mat-icon>
              <span>Network: <strong>Stable</strong></span>
            </div>
            <div class="status-item">
              <mat-icon color="primary">security</mat-icon>
              <span>Security: <strong>Active</strong></span>
            </div>
            <div class="status-item">
              <mat-icon color="primary">update</mat-icon>
              <span>Updates: <strong>Available</strong></span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .admin-dashboard-container {
      padding: 24px;
      margin: 0 auto;
    }

    .admin-header-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-role-chip {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
    }

    .back-button {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .stat-icon-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon {
      font-size: 32px;
      color: white;
      width: 32px;
      height: 32px;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }

    .stat-details p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .stat-change-chip {
      font-size: 0.8rem;
    }

    .admin-actions-card {
      margin-bottom: 24px;
    }

    .mat-card-header {
      padding-bottom: 16px;
    }

    .mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .action-btn {
      height: auto;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      text-align: left;
      transition: transform 0.3s ease;
    }

    .action-btn:hover {
      transform: translateY(-2px);
    }

    .action-btn mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-top: 4px;
    }

    .action-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-title {
      font-size: 1.1rem;
      font-weight: 500;
    }

    .action-desc {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .recent-activity-card,
    .system-status-card {
      margin-bottom: 24px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .activity-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .activity-text {
      font-weight: 500;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #666;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .status-item mat-icon {
      color: #4caf50;
    }

    @media (max-width: 768px) {
      .admin-dashboard-container {
        padding: 16px;
      }

      .admin-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .status-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  totalGroups = 0;
  totalChannels = 0;
  totalMessages = 0;
  newUsersThisWeek = 0;
  newGroupsThisWeek = 0;
  newMessagesToday = 0;
  recentActivity: any[] = [];
  pendingJoinRequests: any[] = [];
  pendingReports: any[] = [];
  showCreateGroup = false;
  showInviteUsers = false;
  showSystemSettings = false;
  newGroup = {
    name: '',
    description: '',
    channels: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Lifecycle hook: initialize dashboard data on component load.
   */
  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Get the current user's role display name for header rendering.
   * @returns Role name string for display.
   */
  getRoleDisplayName(): string {
    if (this.authService.isSuperAdmin()) return 'Super Administrator';
    if (this.authService.isGroupAdmin()) return 'Group Administrator';
    return 'User';
  }

  /**
   * Load summary statistics and dependent dashboard sections (recent activity, requests, reports).
   */
  loadDashboardData(): void {
    // Mock data for Phase 1
    this.totalUsers = 25;
    this.totalGroups = 8;
    this.totalChannels = 24;
    this.totalMessages = 1247;
    this.newUsersThisWeek = 3;
    this.newGroupsThisWeek = 1;
    this.newMessagesToday = 89;

    this.loadRecentActivity();
    this.loadPendingRequests();
    this.loadPendingReports();
  }

  /**
   * Populate recent activity list with mock entries (Phase 1 mock data).
   */
  loadRecentActivity(): void {
    this.recentActivity = [
      {
        type: 'user',
        description: 'New user "john_doe" registered',
        timestamp: new Date(Date.now() - 300000),
        user: 'System'
      },
      {
        type: 'group',
        description: 'Group "Marketing Team" created',
        timestamp: new Date(Date.now() - 1800000),
        user: 'admin'
      },
      {
        type: 'channel',
        description: 'Channel "campaigns" added to Marketing Team',
        timestamp: new Date(Date.now() - 3600000),
        user: 'admin'
      },
      {
        type: 'membership',
        description: 'User "jane_smith" joined Development Team',
        timestamp: new Date(Date.now() - 7200000),
        user: 'super'
      }
    ];
  }

  /**
   * Map activity type to Material icon name.
   * @param type Activity type identifier.
   * @returns Material icon string.
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case 'user':
        return 'person_add';
      case 'group':
        return 'group_add';
      case 'channel':
        return 'forum';
      case 'membership':
        return 'person';
      default:
        return 'info';
    }
  }

  /**
   * Map activity type to icon color variant.
   * @param type Activity type identifier.
   * @returns Angular Material color name.
   */
  getActivityIconColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'user':
        return 'accent';
      case 'group':
        return 'primary';
      case 'channel':
        return 'primary';
      case 'membership':
        return 'accent';
      default:
        return 'primary';
    }
  }

  /**
   * Map activity type to chip color variant.
   * @param type Activity type identifier.
   * @returns Angular Material color name.
   */
  getActivityChipColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'user':
        return 'accent';
      case 'group':
        return 'primary';
      case 'channel':
        return 'primary';
      case 'membership':
        return 'accent';
      default:
        return 'primary';
    }
  }

  /**
   * Load pending join requests (mock for Phase 1).
   */
  loadPendingRequests(): void {
    this.pendingJoinRequests = [
      { id: '1', username: 'john_doe', groupName: 'Design Team' },
      { id: '2', username: 'jane_smith', groupName: 'Marketing Team' },
      { id: '3', username: 'bob_wilson', groupName: 'Development Team' }
    ];
  }

  /**
   * Load pending reports (mock for Phase 1).
   */
  loadPendingReports(): void {
    this.pendingReports = [
      { id: '1', reportedUser: 'user123', reason: 'Inappropriate content' },
      { id: '2', reportedUser: 'spammer', reason: 'Spam messages' }
    ];
  }

  /**
   * Approve a pending group join request.
   * @param requestId Identifier of the request to approve.
   */
  async approveRequest(requestId: string): Promise<void> {
    try {
      // Mock API call for Phase 1
      await new Promise(resolve => setTimeout(resolve, 500));

      this.pendingJoinRequests = this.pendingJoinRequests.filter(r => r.id !== requestId);
      alert('Request approved successfully!');
    } catch (error) {
      alert('Failed to approve request. Please try again.');
    }
  }

  /**
   * Reject a pending group join request.
   * @param requestId Identifier of the request to reject.
   */
  async rejectRequest(requestId: string): Promise<void> {
    try {
      // Mock API call for Phase 1
      await new Promise(resolve => setTimeout(resolve, 500));

      this.pendingJoinRequests = this.pendingJoinRequests.filter(r => r.id !== requestId);
      alert('Request rejected successfully!');
    } catch (error) {
      alert('Failed to reject request. Please try again.');
    }
  }

  /**
   * Review and resolve a user report.
   * @param reportId Identifier of the report to review.
   */
  async reviewReport(reportId: string): Promise<void> {
    try {
      // Mock API call for Phase 1
      await new Promise(resolve => setTimeout(resolve, 500));

      this.pendingReports = this.pendingReports.filter(r => r.id !== reportId);
      alert('Report reviewed and resolved!');
    } catch (error) {
      alert('Failed to review report. Please try again.');
    }
  }

  /**
   * Create a new group from the quick action form.
   * Validates input and refreshes dashboard data on success.
   */
  async createGroup(): Promise<void> {
    if (!this.newGroup.name.trim()) {
      alert('Please enter a group name.');
      return;
    }

    try {
      // Mock API call for Phase 1
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Group created successfully!');
      this.showCreateGroup = false;
      this.newGroup = { name: '', description: '', channels: '' };

      // Refresh data
      this.loadDashboardData();
    } catch (error) {
      alert('Failed to create group. Please try again.');
    }
  }

  /**
   * Navigate to the full reports management view (stub for Phase 2).
   */
  viewAllReports(): void {
    alert('View all reports functionality - Phase 2 implementation');
  }

  /**
   * Format a Date to a localized time string for activity timestamps.
   * @param date Date object to format.
   * @returns Time string in hh:mm AM/PM.
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
