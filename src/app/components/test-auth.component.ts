import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-test-auth',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding: 20px; border: 2px solid #ccc; margin: 20px;">
      <h2>Authentication Test</h2>
      <p><strong>Is Authenticated:</strong> {{ authService.isAuthenticated() }}</p>
      <p><strong>Current User:</strong> {{ authService.getCurrentUser()?.username || 'None' }}</p>
      <p><strong>User Roles:</strong> {{ authService.getCurrentUser()?.roles?.join(', ') || 'None' }}</p>
      <p><strong>Is Super Admin:</strong> {{ authService.isSuperAdmin() }}</p>
      <p><strong>Is Group Admin:</strong> {{ authService.isGroupAdmin() }}</p>
      <p><strong>Can Access Admin Features:</strong> {{ authService.canAccessAdminFeatures() }}</p>
      
      <div style="margin-top: 20px;">
        <button (click)="testLogin('super', '123')" style="margin-right: 10px;">Login as Super Admin</button>
        <button (click)="testLogin('admin', '123')" style="margin-right: 10px;">Login as Group Admin</button>
        <button (click)="testLogin('user', '123')" style="margin-right: 10px;">Login as User</button>
        <button (click)="logout()">Logout</button>
      </div>
    </div>
  `,
    styles: [``]
})
export class TestAuthComponent implements OnInit {
    constructor(public authService: AuthService) { }

    ngOnInit(): void {
        console.log('TestAuthComponent initialized');
    }

    async testLogin(username: string, password: string): Promise<void> {
        console.log(`Testing login with ${username}/${password}`);
        const success = await this.authService.login(username, password);
        console.log('Login result:', success);
    }

    logout(): void {
        this.authService.logout();
    }
}
