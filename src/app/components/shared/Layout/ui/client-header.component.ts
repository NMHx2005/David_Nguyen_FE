import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

export interface Notification {
    icon: string;
    text: string;
}

@Component({
    selector: 'app-client-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDividerModule
    ],
    template: `
    <mat-toolbar class="client-header">
      <div class="header-content">
        <div class="header-left">
          <a routerLink="/" class="logo" matTooltip="Go to homepage">
            <mat-icon>chat</mat-icon>
            <span>ChatSystem</span>
          </a>
        </div>
        
        <nav class="header-nav">
          <a mat-button routerLink="/chat" routerLinkActive="active" matTooltip="Go to chat">
            <mat-icon>chat_bubble</mat-icon>
            Chat
          </a>
          <a mat-button routerLink="/channels" routerLinkActive="active" matTooltip="View channels">
            <mat-icon>forum</mat-icon>
            Channels
          </a>
          <a mat-button routerLink="/groups" routerLinkActive="active" matTooltip="Browse groups">
            <mat-icon>groups</mat-icon>
            Groups
          </a>
        </nav>
        
        <div class="header-right">
          <button mat-icon-button [matMenuTriggerFor]="notificationsMenu" class="notification-btn" matTooltip="Notifications">
            <mat-icon [matBadge]="notificationCount" matBadgeColor="warn">notifications</mat-icon>
          </button>
          <mat-menu #notificationsMenu="matMenu">
            <button mat-menu-item *ngIf="notificationCount === 0">
              <mat-icon>notifications_none</mat-icon>
              <span>No new notifications</span>
            </button>
            <button mat-menu-item *ngFor="let notification of notifications">
              <mat-icon>{{ notification.icon }}</mat-icon>
              <span>{{ notification.text }}</span>
            </button>
          </mat-menu>
          
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn" matTooltip="User options">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile" matTooltip="View profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item routerLink="/settings" matTooltip="Account settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="onLogout()" matTooltip="Sign out">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
    styles: [`
    .client-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .header-left .logo {
      display: flex;
      align-items: center;
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .header-left .logo mat-icon {
      margin-right: 8px;
      font-size: 28px;
    }

    .header-nav {
      display: flex;
      gap: 8px;
    }

    .header-nav a {
      color: white;
      text-decoration: none;
    }

    .header-nav a.active {
      background: rgba(255, 255, 255, 0.2);
    }

    .header-nav a:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .header-nav mat-icon {
      margin-right: 8px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-btn, .user-btn {
      color: white;
    }

    .notification-btn:hover, .user-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mat-menu-item mat-icon {
      margin-right: 12px;
      color: #666;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 8px;
      }

      .header-nav {
        display: none;
      }

      .header-left .logo span {
        display: none;
      }
    }
  `]
})
export class ClientHeaderComponent {
    @Input() notificationCount: number = 0;
    @Input() notifications: Notification[] = [];

    @Output() logout = new EventEmitter<void>();

    onLogout(): void {
        this.logout.emit();
    }
}
