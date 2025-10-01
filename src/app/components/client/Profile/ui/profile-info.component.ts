import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="section">
      <div class="section-header">
        <mat-icon>person</mat-icon>
        <h2>Personal Information</h2>
      </div>
      <mat-divider></mat-divider>
      
      <div class="info-grid">
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-item">
              <mat-icon>account_circle</mat-icon>
              <div>
                <label>Username</label>
                <div class="info-value">{{ currentUser?.username || 'N/A' }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-item">
              <mat-icon>email</mat-icon>
              <div>
                <label>Email</label>
                <div class="info-value">{{ currentUser?.email || 'N/A' }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-item">
              <mat-icon>security</mat-icon>
              <div>
                <label>Role</label>
                <mat-chip-set>
                  <mat-chip [color]="roleColor" selected>
                    {{ roleDisplayName }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-item">
              <mat-icon>calendar_today</mat-icon>
              <div>
                <label>Member Since</label>
                <div class="info-value">{{ formatDate(currentUser?.createdAt) }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-header mat-icon {
      color: #667eea;
      font-size: 24px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .info-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .info-card:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
    }

    .info-item mat-icon {
      color: #666;
      font-size: 20px;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 4px;
      display: block;
    }

    .info-value {
      color: #333;
      font-size: 1rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileInfoComponent {
  @Input() currentUser: User | null = null;
  @Input() roleDisplayName: string = 'User';
  @Input() roleColor: string = 'primary';

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
