import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-layout',
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
    <div class="client-layout">
      <!-- Header -->
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
              <button mat-menu-item routerLink="/profile" matTooltip="View profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item routerLink="/settings" matTooltip="Account settings">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" matTooltip="Sign out">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-toolbar>

      <!-- Page Header -->
      <div class="page-header" *ngIf="pageTitle">
        <div class="page-header-content">
          <h1>{{ pageTitle }}</h1>
          <p *ngIf="pageDescription">{{ pageDescription }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <ng-content></ng-content>
      </main>

      <!-- Footer -->
      <footer class="client-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3>ChatSystem</h3>
            <p>Connect, collaborate, and communicate with your team in real-time.</p>
          </div>
          
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a routerLink="/chat" matTooltip="Go to chat">Chat</a></li>
              <li><a routerLink="/channels" matTooltip="View channels">Channels</a></li>
              <li><a routerLink="/groups" matTooltip="Browse groups">Groups</a></li>
              <li><a routerLink="/help" matTooltip="Get help">Help</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a routerLink="/contact" matTooltip="Contact support">Contact Us</a></li>
              <li><a routerLink="/faq" matTooltip="Frequently asked questions">FAQ</a></li>
              <li><a routerLink="/privacy" matTooltip="Privacy policy">Privacy Policy</a></li>
              <li><a routerLink="/terms" matTooltip="Terms of service">Terms of Service</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Connect</h4>
            <div class="social-links">
              <a href="https://facebook.com" class="social-link" matTooltip="Follow us on Facebook">
                <mat-icon>facebook</mat-icon>
              </a>
              <a href="https://twitter.com" class="social-link" matTooltip="Follow us on Twitter">
                <mat-icon>twitter</mat-icon>
              </a>
              <a href="https://linkedin.com" class="social-link" matTooltip="Connect on LinkedIn">
                <mat-icon>linkedin</mat-icon>
              </a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 ChatSystem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .client-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
    }

    .client-header {
      background: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 64px;
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
      text-decoration: none;
      color: #333;
      font-size: 1.4rem;
      font-weight: 500;
    }

    .logo mat-icon {
      margin-right: 8px;
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-nav {
      display: flex;
      gap: 12px;
    }

    .header-nav a {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      text-decoration: none;
      transition: all 0.3s ease;
      padding: 8px 12px;
      border-radius: 8px;
    }

    .header-nav a:hover,
    .header-nav a.active {
      color: #667eea;
      background: #e3f2fd;
    }

    .header-right {
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

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 16px;
    }

    .page-header-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .page-header h1 {
      margin: 0 0 12px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .page-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .main-content {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
      width: 100%;
    }

    .client-footer {
      background: #2c3e50;
      color: white;
      margin-top: auto;
      padding: 32px 16px;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .footer-section h3,
    .footer-section h4 {
      margin: 0 0 12px 0;
      color: #ecf0f1;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .footer-section p {
      margin: 0;
      line-height: 1.5;
      color: #bdc3c7;
      font-size: 0.9rem;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 8px;
    }

    .footer-section ul li a {
      color: #bdc3c7;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section ul li a:hover {
      color: #667eea;
    }

    .social-links {
      display: flex;
      gap: 12px;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: #667eea;
      transform: translateY(-2px);
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 0;
      text-align: center;
      color: #bdc3c7;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .header-nav {
        display: none;
      }

      .page-header h1 {
        font-size: 1.8rem;
      }

      .main-content {
        padding: 16px;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class ClientLayoutComponent {
  /** Page title displayed in the page header section */
  @Input() pageTitle: string = '';
  /** Optional description shown under the page title */
  @Input() pageDescription: string = '';
  /** Number badge for notifications icon in the header */
  @Input() notificationCount: number = 0;

  /**
   * Mock notifications used for demo purposes in the notifications menu.
   */
  notifications: { icon: string; text: string }[] = [
    { icon: 'chat', text: 'New message in #general' },
    { icon: 'group_add', text: 'You were added to Design Team' }
  ];

  /**
   * Construct the layout with access to auth and navigation services.
   */
  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Sign the current user out and navigate away from the current page.
   * Adjust navigation target based on app routing preference.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}