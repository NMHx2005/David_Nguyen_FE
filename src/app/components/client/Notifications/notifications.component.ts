import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, interval } from 'rxjs';
import { ClientService, Notification } from '../../../services/client.service';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatListModule,
        MatChipsModule,
        MatTooltipModule,
        MatMenuModule,
        MatDividerModule,
        MatBadgeModule,
        ClientLayoutComponent,
    ],
    template: `
    <app-client-layout 
      pageTitle="Notifications" 
      pageDescription="Manage your notifications and stay updated">
      
      <div class="notifications-container">
        <!-- Header Section -->
        <div class="notifications-header">
          <div class="header-content">
            <h1>Notifications</h1>
            <p>Stay updated with your latest activities and messages</p>
          </div>
          <div class="header-actions">
            <button mat-icon-button (click)="refreshNotifications()" matTooltip="Refresh Notifications">
              <mat-icon>refresh</mat-icon>
            </button>
            <button mat-stroked-button 
                    (click)="markAllAsRead()" 
                    [disabled]="unreadCount === 0"
                    matTooltip="Mark All as Read">
              <mat-icon>done_all</mat-icon>
              Mark All Read
            </button>
            <button mat-icon-button [matMenuTriggerFor]="filterMenu" matTooltip="Filter Notifications">
              <mat-icon>filter_list</mat-icon>
            </button>
            <mat-menu #filterMenu="matMenu">
              <button mat-menu-item (click)="filterNotifications('all')">
                <mat-icon>list</mat-icon>
                All Notifications
              </button>
              <button mat-menu-item (click)="filterNotifications('unread')">
                <mat-icon>mark_email_unread</mat-icon>
                Unread Only
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="filterNotifications('message')">
                <mat-icon>message</mat-icon>
                Messages
              </button>
              <button mat-menu-item (click)="filterNotifications('mention')">
                <mat-icon>alternate_email</mat-icon>
                Mentions
              </button>
              <button mat-menu-item (click)="filterNotifications('invite')">
                <mat-icon>group_add</mat-icon>
                Invites
              </button>
              <button mat-menu-item (click)="filterNotifications('system')">
                <mat-icon>settings</mat-icon>
                System
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading notifications...</p>
        </div>

        <!-- Notifications Content -->
        <div *ngIf="!isLoading" class="notifications-content">
          <!-- Statistics -->
          <div class="notification-stats">
            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon total">notifications</mat-icon>
                <div class="stat-details">
                  <h3>{{ filteredNotifications.length }}</h3>
                  <p>Total Notifications</p>
                </div>
              </div>
            </mat-card>

            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon unread">mark_email_unread</mat-icon>
                <div class="stat-details">
                  <h3>{{ unreadCount }}</h3>
                  <p>Unread</p>
                </div>
              </div>
            </mat-card>

            <mat-card class="stat-card">
              <div class="stat-content">
                <mat-icon class="stat-icon today">today</mat-icon>
                <div class="stat-details">
                  <h3>{{ todayCount }}</h3>
                  <p>Today</p>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Notifications List -->
          <mat-card class="notifications-list-card">
            <mat-card-header>
              <mat-card-title>
                {{ getFilterTitle() }}
                <mat-chip *ngIf="currentFilter !== 'all'" class="filter-chip">
                  {{ currentFilter }}
                </mat-chip>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
                <mat-icon>notifications_off</mat-icon>
                <h3>No notifications found</h3>
                <p>{{ getNoNotificationsMessage() }}</p>
              </div>

              <mat-list *ngIf="filteredNotifications.length > 0" class="notifications-list">
                <mat-list-item *ngFor="let notification of filteredNotifications; trackBy: trackByNotificationId"
                              [class.unread]="!notification.isRead"
                              [class.notification-item]="true">
                  
                  <!-- Notification Icon -->
                  <mat-icon matListItemIcon 
                           [class]="'notification-icon ' + notification.type"
                           [matBadge]="!notification.isRead ? '!' : null"
                           matBadgeColor="warn"
                           matBadgeSize="small">
                    {{ getNotificationIcon(notification.type) }}
                  </mat-icon>

                  <!-- Notification Content -->
                  <div matListItemTitle class="notification-title">
                    {{ notification.title }}
                  </div>
                  
                  <div matListItemLine class="notification-message">
                    {{ notification.message }}
                  </div>
                  
                  <div matListItemLine class="notification-meta">
                    <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                    <mat-chip class="notification-type-chip" [class]="notification.type">
                      {{ notification.type }}
                    </mat-chip>
                  </div>

                  <!-- Notification Actions -->
                  <div class="notification-actions">
                    <button mat-icon-button 
                            *ngIf="!notification.isRead"
                            (click)="markAsRead(notification._id)"
                            matTooltip="Mark as read">
                      <mat-icon>done</mat-icon>
                    </button>
                    
                    <button mat-icon-button 
                            [matMenuTriggerFor]="notificationMenu"
                            matTooltip="More actions">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    
                    <mat-menu #notificationMenu="matMenu">
                      <button mat-menu-item 
                              *ngIf="!notification.isRead"
                              (click)="markAsRead(notification._id)">
                        <mat-icon>done</mat-icon>
                        Mark as Read
                      </button>
                      <button mat-menu-item 
                              *ngIf="notification.isRead"
                              (click)="markAsUnread(notification._id)">
                        <mat-icon>mark_email_unread</mat-icon>
                        Mark as Unread
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item 
                              (click)="deleteNotification(notification._id)"
                              class="delete-action">
                        <mat-icon>delete</mat-icon>
                        Delete
                      </button>
                    </mat-menu>
                  </div>
                </mat-list-item>
              </mat-list>

              <!-- Load More Button -->
              <div *ngIf="hasMoreNotifications" class="load-more-container">
                <button mat-stroked-button (click)="loadMoreNotifications()" [disabled]="isLoadingMore">
                  <mat-icon *ngIf="!isLoadingMore">expand_more</mat-icon>
                  <mat-spinner *ngIf="isLoadingMore" diameter="20"></mat-spinner>
                  {{ isLoadingMore ? 'Loading...' : 'Load More' }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </app-client-layout>
  `,
    styles: [`
    .notifications-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .header-content p {
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

    .notifications-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .notification-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .stat-content {
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 16px;
    }

    .stat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.total {
      background: linear-gradient(135deg, #2196F3, #21CBF3);
      color: white;
    }

    .stat-icon.unread {
      background: linear-gradient(135deg, #f44336, #ff7043);
      color: white;
    }

    .stat-icon.today {
      background: linear-gradient(135deg, #4CAF50, #8BC34A);
      color: white;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 300;
      color: #333;
    }

    .stat-details p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .notifications-list-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .filter-chip {
      margin-left: 12px;
      font-size: 12px;
    }

    .no-notifications {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-notifications mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-notifications h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-notifications p {
      margin: 0;
      color: #666;
    }

    .notifications-list {
      padding: 0;
    }

    .notification-item {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 0;
      transition: background-color 0.2s ease;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #f8f9fa;
      border-left: 4px solid #2196F3;
      padding-left: 12px;
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

    .notification-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .notification-message {
      color: #666;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }

    .notification-time {
      font-size: 12px;
      color: #999;
    }

    .notification-type-chip {
      font-size: 10px;
      height: 20px;
    }

    .notification-type-chip.message {
      background: #e3f2fd;
      color: #1976d2;
    }

    .notification-type-chip.mention {
      background: #fff3e0;
      color: #f57c00;
    }

    .notification-type-chip.invite {
      background: #e8f5e8;
      color: #388e3c;
    }

    .notification-type-chip.system {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .delete-action {
      color: #f44336;
    }

    .load-more-container {
      text-align: center;
      padding: 20px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .notifications-container {
        padding: 10px;
      }

      .notifications-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .notification-stats {
        grid-template-columns: 1fr;
      }

      .notification-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Services
    clientService = inject(ClientService);
    snackBar = inject(MatSnackBar);

    // Component state
    isLoading = false;
    isLoadingMore = false;
    notifications: Notification[] = [];
    filteredNotifications: Notification[] = [];
    unreadCount = 0;
    todayCount = 0;
    currentFilter = 'all';
    hasMoreNotifications = false;
    currentPage = 0;
    pageSize = 20;

    // Real-time update interval
    private updateInterval = interval(30000); // Update every 30 seconds

    ngOnInit(): void {
        this.loadNotifications();
        this.setupRealTimeUpdates();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Load notifications
     */
    private loadNotifications(): void {
        this.isLoading = true;

        this.clientService.getNotifications({
            limit: this.pageSize,
            offset: this.currentPage * this.pageSize
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        if (this.currentPage === 0) {
                            this.notifications = response.data;
                        } else {
                            this.notifications = [...this.notifications, ...response.data];
                        }

                        this.updateNotificationStats();
                        this.applyFilter();
                        this.hasMoreNotifications = response.data.length === this.pageSize;
                        this.isLoading = false;
                    } else {
                        this.snackBar.open('Failed to load notifications', 'Close', { duration: 3000 });
                        this.isLoading = false;
                    }
                },
                error: (error) => {
                    console.error('Error loading notifications:', error);
                    this.snackBar.open('Failed to load notifications', 'Close', { duration: 3000 });
                    this.isLoading = false;
                }
            });
    }

    /**
     * Load more notifications
     */
    loadMoreNotifications(): void {
        this.isLoadingMore = true;
        this.currentPage++;
        this.loadNotifications();
    }

    /**
     * Refresh notifications
     */
    refreshNotifications(): void {
        this.currentPage = 0;
        this.loadNotifications();
        this.snackBar.open('Notifications refreshed', 'Close', { duration: 2000 });
    }

    /**
     * Setup real-time updates
     */
    private setupRealTimeUpdates(): void {
        this.updateInterval
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.refreshNotifications();
            });
    }

    /**
     * Update notification statistics
     */
    private updateNotificationStats(): void {
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.todayCount = this.notifications.filter(n => {
            const notificationDate = new Date(n.createdAt);
            notificationDate.setHours(0, 0, 0, 0);
            return notificationDate.getTime() === today.getTime();
        }).length;
    }

    /**
     * Apply current filter
     */
    private applyFilter(): void {
        switch (this.currentFilter) {
            case 'unread':
                this.filteredNotifications = this.notifications.filter(n => !n.isRead);
                break;
            case 'message':
            case 'mention':
            case 'invite':
            case 'system':
                this.filteredNotifications = this.notifications.filter(n => n.type === this.currentFilter);
                break;
            default:
                this.filteredNotifications = [...this.notifications];
        }
    }

    /**
     * Filter notifications
     */
    filterNotifications(filter: string): void {
        this.currentFilter = filter;
        this.applyFilter();
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
                            this.updateNotificationStats();
                            this.applyFilter();
                        }
                    }
                },
                error: (error) => {
                    console.error('Error marking notification as read:', error);
                }
            });
    }

    /**
     * Mark notification as unread
     */
    markAsUnread(notificationId: string): void {
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
            notification.isRead = false;
            this.updateNotificationStats();
            this.applyFilter();
        }
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
                        this.updateNotificationStats();
                        this.applyFilter();
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
                        this.updateNotificationStats();
                        this.applyFilter();
                        this.snackBar.open('Notification deleted', 'Close', { duration: 2000 });
                    }
                },
                error: (error) => {
                    console.error('Error deleting notification:', error);
                }
            });
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
     * Get filter title
     */
    getFilterTitle(): string {
        switch (this.currentFilter) {
            case 'unread': return 'Unread Notifications';
            case 'message': return 'Message Notifications';
            case 'mention': return 'Mention Notifications';
            case 'invite': return 'Invite Notifications';
            case 'system': return 'System Notifications';
            default: return 'All Notifications';
        }
    }

    /**
     * Get no notifications message
     */
    getNoNotificationsMessage(): string {
        switch (this.currentFilter) {
            case 'unread': return 'You have no unread notifications';
            case 'message': return 'No message notifications found';
            case 'mention': return 'No mention notifications found';
            case 'invite': return 'No invite notifications found';
            case 'system': return 'No system notifications found';
            default: return 'You have no notifications yet';
        }
    }

    /**
     * Format timestamp for display
     */
    formatTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    }

    /**
     * Track by function for notifications list
     */
    trackByNotificationId(index: number, notification: Notification): string {
        return notification._id;
    }
}
