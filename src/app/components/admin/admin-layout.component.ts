import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-simple-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container style="height: 100vh;">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" opened style="width: 250px; background: #2c2c2c;">
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 20px 0; color: #ecf0f1; font-weight: 600;">Admin Panel</h2>
          <mat-nav-list>
            <a mat-list-item routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Manage Users</span>
            </a>
            <a mat-list-item routerLink="/admin/groups" routerLinkActive="active">
              <mat-icon matListItemIcon>group_work</mat-icon>
              <span matListItemTitle>Manage Groups</span>
            </a>
            <a mat-list-item routerLink="/admin/channels" routerLinkActive="active">
              <mat-icon matListItemIcon>chat</mat-icon>
              <span matListItemTitle>Manage Channels</span>
            </a>
            <a mat-list-item routerLink="/admin/group-requests" routerLinkActive="active">
              <mat-icon matListItemIcon>assignment</mat-icon>
              <span matListItemTitle>Group Requests</span>
            </a>
            <a mat-list-item (click)="logout()" style="cursor: pointer;">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>Logout</span>
            </a>
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <!-- Header -->
        <mat-toolbar color="primary" style="position: sticky; top: 0; z-index: 1000;">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span style="margin-left: 16px;">Admin Panel - {{ authService.getCurrentUser()?.username }}</span>
          <span style="flex: 1 1 auto;"></span>
          <button mat-icon-button (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Page Content -->
        <div style="padding: 20px;">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    mat-nav-list a {
      color: #bdc3c7;
    }
    
    mat-nav-list a:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    mat-nav-list mat-icon {
      color: #bdc3c7;
    }
    
    mat-nav-list span {
      color: #bdc3c7;
    }
  `]
})
export class SimpleAdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    console.log('SimpleAdminLayoutComponent initialized');
    console.log('Current user:', this.authService.getCurrentUser());
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Logout successful');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Navigate to login even if logout request fails
      this.router.navigate(['/login']);
    }
  }
}
