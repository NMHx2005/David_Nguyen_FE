import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, interval, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ClientService, ClientProfile, ClientStats, Notification, UserActivity } from '../../../services/client.service';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    ClientLayoutComponent,
  ],
  template: `
    <app-client-layout 
      pageTitle="Dashboard" 
      pageDescription="Your personal overview and activity">
      
      <div class="client-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header">
          <div class="welcome-section">
            <h1>Welcome back, {{ clientProfile?.username || 'User' }}!</h1>
            <p>Here's what's happening in your workspace</p>
          </div>
          <div class="header-actions">
            <button mat-icon-button (click)="refreshData()" matTooltip="Refresh Data">
              <mat-icon>refresh</mat-icon>
            </button>
            <button mat-icon-button [matMenuTriggerFor]="statusMenu" matTooltip="Update Status">
              <mat-icon>circle</mat-icon>
            </button>
            <mat-menu #statusMenu="matMenu">
              <button mat-menu-item (click)="updateStatus('online')">
                <mat-icon style="color: #4CAF50;">circle</mat-icon>
                Online
              </button>
              <button mat-menu-item (click)="updateStatus('away')">
                <mat-icon style="color: #FF9800;">circle</mat-icon>
                Away
              </button>
              <button mat-menu-item (click)="updateStatus('busy')">
                <mat-icon style="color: #f44336;">circle</mat-icon>
                Busy
              </button>
              <button mat-menu-item (click)="updateStatus('offline')">
                <mat-icon style="color: #9E9E9E;">circle</mat-icon>
                Offline
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading dashboard data...</p>
        </div>

        <!-- Dashboard Content -->
        <div *ngIf="!isLoading" class="dashboard-content">
          <!-- Statistics Cards -->
          <div class="stats-grid">
            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon messages">message</mat-icon>
                <div class="stat-details">
                  <h3>{{ clientStats?.totalMessages || 0 }}</h3>
                  <p>Total Messages</p>
                  <span class="stat-change positive">+{{ clientStats?.messagesToday || 0 }} today</span>
                </div>
              </div>
            </mat-card>

            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon groups">group_work</mat-icon>
                <div class="stat-details">
                  <h3>{{ clientStats?.groupsJoined || 0 }}</h3>
                  <p>Groups Joined</p>
                  <span class="stat-change">Active groups</span>
                </div>
              </div>
            </mat-card>

            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon channels">chat</mat-icon>
                <div class="stat-details">
                  <h3>{{ clientStats?.channelsJoined || 0 }}</h3>
                  <p>Channels Joined</p>
                  <span class="stat-change">Active channels</span>
                </div>
              </div>
            </mat-card>

            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon notifications" [matBadge]="unreadNotifications" matBadgeColor="warn">
                  notifications
                </mat-icon>
                <div class="stat-details">
                  <h3>{{ notifications.length }}</h3>
                  <p>Notifications</p>
                  <span class="stat-change" [class.unread]="unreadNotifications > 0">
                    {{ unreadNotifications }} unread
                  </span>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Tabs for Detailed Views -->
          <mat-tab-group class="dashboard-tabs">
            <!-- Overview Tab -->
            <mat-tab label="Overview">
              <div class="tab-content">
                <div class="overview-grid">
                  <mat-card class="overview-card">
                    <mat-card-header>
                      <mat-card-title>Recent Activity</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div *ngIf="userActivities.length === 0" class="no-data">
                        <mat-icon>info</mat-icon>
                        <p>No recent activity found</p>
                      </div>
                      <mat-list *ngIf="userActivities.length > 0">
                        <mat-list-item *ngFor="let activity of userActivities" class="activity-item">
                          <mat-icon matListItemIcon>{{ getActivityIcon(activity.action) }}</mat-icon>
                          <div matListItemTitle>{{ activity.action }}</div>
                          <div matListItemLine class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                        </mat-list-item>
                      </mat-list>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="overview-card">
                    <mat-card-header>
                      <mat-card-title>Quick Actions</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="quick-actions">
                        <button mat-raised-button color="primary" routerLink="/client/groups">
                          <mat-icon>group_work</mat-icon>
                          Browse Groups
                        </button>
                        <button mat-raised-button color="accent" routerLink="/client/channels">
                          <mat-icon>chat</mat-icon>
                          View Channels
                        </button>
                        <button mat-raised-button routerLink="/client/profile">
                          <mat-icon>person</mat-icon>
                          Edit Profile
                        </button>
                        <button mat-stroked-button (click)="exportData()">
                          <mat-icon>download</mat-icon>
                          Export Data
                        </button>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>

            <!-- Notifications Tab -->
            <mat-tab label="Notifications" [matBadge]="unreadNotifications" matBadgeColor="warn">
              <div class="tab-content">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Notifications</mat-card-title>
                    <div class="notification-actions">
                      <button mat-stroked-button (click)="markAllAsRead()" [disabled]="unreadNotifications === 0">
                        <mat-icon>done_all</mat-icon>
                        Mark All Read
                      </button>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div *ngIf="notifications.length === 0" class="no-data">
                      <mat-icon>notifications_off</mat-icon>
                      <p>No notifications found</p>
                    </div>
                    <mat-list *ngIf="notifications.length > 0">
                      <mat-list-item *ngFor="let notification of notifications" 
                                    [class.unread]="!notification.isRead"
                                    class="notification-item">
                        <mat-icon matListItemIcon [class]="'notification-icon ' + notification.type">
                          {{ getNotificationIcon(notification.type) }}
                        </mat-icon>
                        <div matListItemTitle>{{ notification.title }}</div>
                        <div matListItemLine>{{ notification.message }}</div>
                        <div matListItemLine class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                        <div class="notification-actions">
                          <button mat-icon-button 
                                  (click)="markAsRead(notification._id)"
                                  *ngIf="!notification.isRead"
                                  matTooltip="Mark as read">
                            <mat-icon>done</mat-icon>
                          </button>
                          <button mat-icon-button 
                                  (click)="deleteNotification(notification._id)"
                                  matTooltip="Delete notification">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Profile Tab -->
            <mat-tab label="Profile">
              <div class="tab-content">
                <div class="profile-grid">
                  <mat-card class="profile-card">
                    <mat-card-header>
                      <mat-card-title>Profile Information</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="profile-info">
                        <div class="profile-avatar">
                          <mat-icon>account_circle</mat-icon>
                        </div>
                        <div class="profile-details">
                          <h3>{{ clientProfile?.username }}</h3>
                          <p>{{ clientProfile?.email }}</p>
                          <div class="profile-roles">
                            <mat-chip *ngFor="let role of clientProfile?.roles" 
                                     [class]="'role-chip ' + role.toLowerCase()">
                              {{ role }}
                            </mat-chip>
                          </div>
                          <p class="profile-status">
                            <strong>Status:</strong> {{ currentStatus }}
                          </p>
                          <p class="profile-joined">
                            <strong>Joined:</strong> {{ formatDate(clientProfile?.createdAt) }}
                          </p>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="profile-card">
                    <mat-card-header>
                      <mat-card-title>Account Statistics</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="stats-details">
                        <div class="stat-item">
                          <span class="stat-label">Total Messages</span>
                          <span class="stat-value">{{ clientStats?.totalMessages || 0 }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Messages This Week</span>
                          <span class="stat-value">{{ clientStats?.messagesThisWeek || 0 }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Groups Joined</span>
                          <span class="stat-value">{{ clientStats?.groupsJoined || 0 }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Channels Joined</span>
                          <span class="stat-value">{{ clientStats?.channelsJoined || 0 }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Last Active</span>
                          <span class="stat-value">{{ formatTime(clientStats?.lastActive) }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </app-client-layout>
  `,
  styles: [`
    .client-dashboard {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .welcome-section h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .welcome-section p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      color: #666;
      font-size: 16px;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      padding: 24px;
      gap: 20px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.messages {
      background: linear-gradient(135deg, #9C27B0, #E91E63);
      color: white;
    }

    .stat-icon.groups {
      background: linear-gradient(135deg, #4CAF50, #8BC34A);
      color: white;
    }

    .stat-icon.channels {
      background: linear-gradient(135deg, #FF9800, #FFC107);
      color: white;
    }

    .stat-icon.notifications {
      background: linear-gradient(135deg, #2196F3, #21CBF3);
      color: white;
    }

    .stat-details {
      flex: 1;
    }

    .stat-details h3 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
      color: #333;
    }

    .stat-details p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .stat-change {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      background: #f0f0f0;
      color: #666;
    }

    .stat-change.positive {
      background: #e8f5e8;
      color: #4CAF50;
    }

    .stat-change.unread {
      background: #ffebee;
      color: #f44336;
    }

    .dashboard-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .overview-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .quick-actions button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      min-height: 100px;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .activity-item, .notification-item {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 0;
    }

    .activity-item:last-child, .notification-item:last-child {
      border-bottom: none;
    }

    .activity-time, .notification-time {
      font-size: 12px;
      color: #999;
    }

    .notification-item.unread {
      background: #f8f9fa;
      border-left: 4px solid #2196F3;
    }

    .notification-icon {
      font-size: 24px;
    }

    .notification-icon.message {
      color: #2196F3;
    }

    .notification-icon.mention {
      color: #FF9800;
    }

    .notification-icon.invite {
      color: #4CAF50;
    }

    .notification-icon.system {
      color: #9C27B0;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .profile-avatar {
      font-size: 64px;
      color: #666;
    }

    .profile-details h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .profile-details p {
      margin: 8px 0;
      color: #666;
    }

    .profile-roles {
      margin: 12px 0;
    }

    .role-chip {
      margin-right: 8px;
      margin-bottom: 4px;
    }

    .role-chip.super_admin {
      background: #f44336;
      color: white;
    }

    .role-chip.group_admin {
      background: #FF9800;
      color: white;
    }

    .role-chip.user {
      background: #4CAF50;
      color: white;
    }

    .stats-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-weight: 500;
      color: #333;
    }

    .stat-value {
      font-weight: 600;
      color: #2196F3;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .client-dashboard {
        padding: 10px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .overview-grid, .profile-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services
  authService = inject(AuthService);
  clientService = inject(ClientService);
  snackBar = inject(MatSnackBar);

  // Component state
  isLoading = true;
  clientProfile: ClientProfile | null = null;
  clientStats: ClientStats | null = null;
  notifications: Notification[] = [];
  userActivities: UserActivity[] = [];
  unreadNotifications = 0;
  currentStatus = 'online';

  // Real-time update interval
  private updateInterval = interval(30000); // Update every 30 seconds

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data
   */
  private loadDashboardData(): void {
    this.isLoading = true;

    // Load client profile
    this.clientService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.clientProfile = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading client profile:', error);
        }
      });

    // Load client stats
    this.clientService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.clientStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading client stats:', error);
        }
      });

    // Load notifications
    this.loadNotifications();

    // Load user activities
    this.loadUserActivities();

    // Load user status
    this.loadUserStatus();

    // Set loading to false after a short delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Load notifications
   */
  private loadNotifications(): void {
    this.clientService.getNotifications({ limit: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notifications = response.data;
            this.unreadNotifications = this.notifications.filter(n => !n.isRead).length;
          }
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
  }

  /**
   * Load user activities
   */
  private loadUserActivities(): void {
    this.clientService.getActivity({ limit: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.userActivities = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading user activities:', error);
        }
      });
  }

  /**
   * Load user status
   */
  private loadUserStatus(): void {
    this.clientService.getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentStatus = response.data.status;
          }
        },
        error: (error) => {
          console.error('Error loading user status:', error);
        }
      });
  }

  /**
   * Setup real-time updates
   */
  private setupRealTimeUpdates(): void {
    this.updateInterval
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshData();
      });
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.loadDashboardData();
    this.snackBar.open('Dashboard data refreshed', 'Close', { duration: 2000 });
  }

  /**
   * Update user status
   */
  updateStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.clientService.updateStatus(status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentStatus = status;
            this.snackBar.open(`Status updated to ${status}`, 'Close', { duration: 2000 });
          }
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    this.clientService.markNotificationRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const notification = this.notifications.find(n => n._id === notificationId);
            if (notification) {
              notification.isRead = true;
              this.unreadNotifications--;
            }
          }
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.clientService.markAllNotificationsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notifications.forEach(n => n.isRead = true);
            this.unreadNotifications = 0;
            this.snackBar.open(`${response.data.marked} notifications marked as read`, 'Close', { duration: 2000 });
          }
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    this.clientService.deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notifications = this.notifications.filter(n => n._id !== notificationId);
            this.unreadNotifications = this.notifications.filter(n => !n.isRead).length;
            this.snackBar.open('Notification deleted', 'Close', { duration: 2000 });
          }
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
  }

  /**
   * Export user data
   */
  exportData(): void {
    this.clientService.exportData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.snackBar.open('Data exported successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error exporting data:', error);
          this.snackBar.open('Failed to export data', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Get activity icon based on action
   */
  getActivityIcon(action: string): string {
    if (action.toLowerCase().includes('login')) return 'login';
    if (action.toLowerCase().includes('logout')) return 'logout';
    if (action.toLowerCase().includes('create')) return 'add';
    if (action.toLowerCase().includes('update')) return 'edit';
    if (action.toLowerCase().includes('delete')) return 'delete';
    if (action.toLowerCase().includes('message')) return 'message';
    if (action.toLowerCase().includes('join')) return 'group_add';
    if (action.toLowerCase().includes('leave')) return 'group_remove';
    return 'info';
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'message': return 'message';
      case 'mention': return 'alternate_email';
      case 'invite': return 'group_add';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }

  /**
   * Format date for display
   */
  formatDate(timestamp: string | undefined): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  }
}
