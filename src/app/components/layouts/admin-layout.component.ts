import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="admin-sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" opened class="admin-sidenav" [ngClass]="{'sidenav-collapsed': !sidenav.opened}">
        <div class="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/admin" routerLinkActive="active-link" matTooltip="View admin panel">
            <mat-icon>admin_panel_settings</mat-icon>
            <span *ngIf="sidenav.opened">Admin Panel</span>
          </a>
          
          <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link" matTooltip="Manage users">
            <mat-icon>people</mat-icon>
            <span *ngIf="sidenav.opened">Manage Users</span>
          </a>
          
          <a mat-list-item routerLink="/admin/groups" routerLinkActive="active-link" matTooltip="Manage groups">
            <mat-icon>group_work</mat-icon>
            <span *ngIf="sidenav.opened">Manage Groups</span>
          </a>
          
          <a mat-list-item routerLink="/admin/channels" routerLinkActive="active-link" matTooltip="Manage channels">
            <mat-icon>chat</mat-icon>
            <span *ngIf="sidenav.opened">Manage Channels</span>
          </a>
          
          <a mat-list-item routerLink="/admin/group-requests" routerLinkActive="active-link" matTooltip="Review group join requests">
            <mat-icon>group_add</mat-icon>
            <span *ngIf="sidenav.opened">Group Requests</span>
            <span *ngIf="getPendingRequestsCount() > 0" class="notification-badge">{{ getPendingRequestsCount() }}</span>
          </a>
          
          <mat-divider></mat-divider>
          
          <a mat-list-item routerLink="/admin/settings" routerLinkActive="active-link" matTooltip="System settings">
            <mat-icon>settings</mat-icon>
            <span *ngIf="sidenav.opened">Settings</span>
          </a>
          
          <a mat-list-item routerLink="/admin/reports" routerLinkActive="active-link" matTooltip="View reports">
            <mat-icon>assessment</mat-icon>
            <span *ngIf="sidenav.opened">Reports</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content class="admin-sidenav-content">
        <!-- Header -->
        <mat-toolbar class="admin-header">
          <button mat-icon-button (click)="sidenav.toggle()" matTooltip="Toggle sidebar">
            <mat-icon>{{ sidenav.opened ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
          
          <span class="header-title">{{ pageTitle }}</span>
          
          <span class="spacer"></span>
          
          <div class="header-actions">
            <button mat-icon-button [matMenuTriggerFor]="notificationsMenu" class="notification-btn" matTooltip="Notifications">
              <mat-icon [matBadge]="notificationCount" matBadgeColor="warn">notifications</mat-icon>
            </button>
            <mat-menu #notificationsMenu="matMenu">
              <button mat-menu-item *ngIf="notificationCount === 0">
                <mat-icon>notifications_none</mat-icon>
                <span>No new notifications</span>
              </button>
              <!-- Placeholder for dynamic notifications -->
              <button mat-menu-item *ngFor="let notification of notifications">
                <mat-icon>{{ notification.icon }}</mat-icon>
                <span>{{ notification.text }}</span>
              </button>
            </mat-menu>
            
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn" matTooltip="User options">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="page-content">
          <ng-content></ng-content>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-sidenav-container {
      height: 100vh;
    }

    .admin-sidenav {
      width: 240px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: width 0.3s ease;
    }

    .admin-sidenav.sidenav-collapsed {
      width: 64px;
    }

    .sidebar-header {
      padding: 16px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 500;
      display: flex;
      justify-content: center;
    }

    .mat-nav-list a {
      color: white;
      transition: all 0.3s ease;
      padding: 12px 16px;
    }

    .mat-nav-list a:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }

    .mat-nav-list a.active-link {
      background-color: rgba(255, 255, 255, 0.2);
      border-left: 4px solid white;
    }

    .mat-nav-list mat-icon {
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .notification-badge {
      background-color: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      font-weight: 600;
    }

    .admin-header {
      background: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 64px;
    }

    .header-title {
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
      margin-left: 12px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-btn, .user-btn {
      color: #666;
    }

    .notification-btn:hover, .user-btn:hover {
      color: #667eea;
    }

    .page-content {
      padding: 24px;
      background: #f8f9fa;
      min-height: calc(100vh - 64px);
    }

    .mat-divider {
      border-color: rgba(255, 255, 255, 0.2);
      margin: 12px 0;
    }

    @media (max-width: 768px) {
      .admin-sidenav {
        width: 64px;
      }

      .sidebar-header h2 {
        font-size: 1.2rem;
      }

      .mat-nav-list span {
        display: none;
      }

      .mat-nav-list mat-icon {
        margin-right: 0;
      }

      .page-content {
        padding: 16px;
      }
    }
  `]
})
export class AdminLayoutComponent {
  @Input() pageTitle: string = 'Admin Panel';
  @Input() notificationCount: number = 0;

  // Mock notifications for demonstration
  notifications: { icon: string; text: string }[] = [
    { icon: 'person_add', text: 'New user registered' },
    { icon: 'group_add', text: 'New group created' }
  ];

  constructor(private authService: AuthService, private router: Router) { }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPendingRequestsCount(): number {
    const storedRequests = localStorage.getItem('groupInterestRequests');
    if (storedRequests) {
      const requests = JSON.parse(storedRequests);
      return requests.filter((req: any) => req.status === 'pending').length;
    }
    return 0;
  }
}