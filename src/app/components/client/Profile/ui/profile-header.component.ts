import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="profile-card">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="header-content">
          <!-- Avatar Image or Default Icon -->
          <div class="profile-avatar">
            <img *ngIf="currentUser?.avatarUrl" 
                 [src]="currentUser?.avatarUrl" 
                 [alt]="currentUser?.username"
                 class="avatar-image"
                 (error)="onAvatarError()">
            <mat-icon *ngIf="!currentUser?.avatarUrl || avatarError" class="default-avatar-icon">account_circle</mat-icon>
          </div>
          <h1>{{ currentUser?.username || 'User' }}</h1>
          <p>{{ getRoleDisplayName() }}</p>
        </div>
        <div class="header-actions">
          <button 
            mat-icon-button 
            color="primary" 
            matTooltip="Edit Profile"
            (click)="onEditProfile()">
            <mat-icon>edit</mat-icon>
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .profile-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profile-avatar {
      width: 64px;
      height: 64px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .default-avatar-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: white;
    }

    .header-content h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .header-content p {
      margin: 4px 0 0 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .header-actions button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .header-actions button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .profile-avatar {
        width: 48px;
        height: 48px;
      }

      .default-avatar-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .header-content h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ProfileHeaderComponent {
  @Input() currentUser: User | null = null;
  @Input() roleDisplayName: string = 'User';

  @Output() editProfile = new EventEmitter<void>();

  avatarError: boolean = false;

  getRoleDisplayName(): string {
    return this.roleDisplayName;
  }

  onEditProfile(): void {
    this.editProfile.emit();
  }

  onAvatarError(): void {
    this.avatarError = true;
  }
}
