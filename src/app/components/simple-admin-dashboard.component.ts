import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-simple-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
  ],
  template: `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel, {{ authService.getCurrentUser()?.username }}!</p>
      
      <!-- Simple Stats -->
      <div style="margin: 20px 0;">
        <mat-card style="padding: 20px;">
          <h2>System Statistics</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
            <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px;">
              <h3 style="margin: 0; color: #2196F3;">5</h3>
              <p style="margin: 5px 0 0 0; color: #666;">Total Users</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px;">
              <h3 style="margin: 0; color: #4CAF50;">3</h3>
              <p style="margin: 5px 0 0 0; color: #666;">Total Groups</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px;">
              <h3 style="margin: 0; color: #FF9800;">5</h3>
              <p style="margin: 5px 0 0 0; color: #666;">Total Channels</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px;">
              <h3 style="margin: 0; color: #9C27B0;">9</h3>
              <p style="margin: 5px 0 0 0; color: #666;">Total Messages</p>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div style="margin: 20px 0;">
        <mat-card style="padding: 20px;">
          <h2>Quick Actions</h2>
          <div style="margin-top: 20px;">
            <button mat-raised-button color="primary" routerLink="/admin/users" style="margin-right: 10px; margin-bottom: 10px;">
              Manage Users
            </button>
            <button mat-raised-button color="accent" routerLink="/admin/groups" style="margin-right: 10px; margin-bottom: 10px;">
              Manage Groups
            </button>
            <button mat-raised-button color="warn" routerLink="/admin/channels" style="margin-right: 10px; margin-bottom: 10px;">
              Manage Channels
            </button>
            <button mat-stroked-button (click)="logout()" style="margin-right: 10px; margin-bottom: 10px;">
              Logout
            </button>
          </div>
        </mat-card>
      </div>

      <!-- User Info -->
      <div style="margin: 20px 0;">
        <mat-card style="padding: 20px;">
          <h2>User Information</h2>
          <p><strong>Username:</strong> {{ authService.getCurrentUser()?.username }}</p>
          <p><strong>Email:</strong> {{ authService.getCurrentUser()?.email }}</p>
          <p><strong>Roles:</strong> {{ authService.getCurrentUser()?.roles?.join(', ') }}</p>
          <p><strong>Is Super Admin:</strong> {{ authService.isSuperAdmin() }}</p>
          <p><strong>Is Group Admin:</strong> {{ authService.isGroupAdmin() }}</p>
        </mat-card>
      </div>
    </div>
  `,
  styles: [``]
})
export class SimpleAdminDashboardComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    console.log('SimpleAdminDashboardComponent initialized');
    console.log('Current user:', this.authService.getCurrentUser());
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
