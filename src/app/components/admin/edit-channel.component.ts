import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/admin/channel.service';
import { ChannelFormComponent } from '../ui/admin/channel-form.component';
import { User, UserRole } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { Channel, ChannelType } from '../../models/channel.model';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ChannelFormComponent
  ],
  template: `
      <div class="edit-channel-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Edit Channel</h1>
              <p>Update channel information and settings</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button [routerLink]="['/admin/channels']">
                <mat-icon>arrow_back</mat-icon>
                Back to Channels
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Channel Form -->
            <app-channel-form
              [channel]="channel"
              [groups]="groups"
              (onSubmit)="updateChannel($event)"
              (onCancel)="goBack()">
            </app-channel-form>

        <!-- Loading State -->
        <div *ngIf="!channel && !isLoading" class="loading-state">
          <mat-icon class="loading-icon">refresh</mat-icon>
          <p>Loading channel details...</p>
        </div>
      </div>
  `,
  styles: [`
    .edit-channel-container {
      margin: 0 auto;
      padding: 24px;
      max-width: 800px;
    }

    .page-header-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .loading-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .loading-state p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .edit-channel-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
      }
    }
  `]
})
export class EditChannelComponent implements OnInit, OnDestroy {
  channel: Channel | null = null;
  groups: Group[] = [];
  currentUser: User | null = null;
  isLoading = false;
  private channelId = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private channelService: ChannelService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.channelId = this.route.snapshot.paramMap.get('channelId') || '';
    console.log('Edit Channel - Channel ID:', this.channelId);
    this.loadChannel();
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // Subscribe to channel data
    this.channelService.channel$
      .pipe(takeUntil(this.destroy$))
      .subscribe(channel => {
        this.channel = channel;
      });

    // Subscribe to groups data
    this.channelService.groups$
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => {
        this.groups = groups;
      });
  }

  /**
   * Load channel data
   */
  private loadChannel(): void {
    if (!this.channelId) {
      this.snackBar.open('Invalid channel ID', 'Close', { duration: 3000 });
      this.router.navigate(['/admin/channels']);
      return;
    }

    this.isLoading = true;
    this.channelService.loadChannel(this.channelId)
      .then(result => {
        if (!result.success) {
          this.snackBar.open(result.message || 'Channel not found', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/channels']);
        }
      })
      .catch(error => {
        console.error('Error loading channel:', error);
        this.snackBar.open('Failed to load channel', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/channels']);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  /**
   * Update channel
   */
  async updateChannel(formData: any): Promise<void> {
    console.log('Update Channel - Form Data:', formData);
    console.log('Update Channel - Channel ID:', this.channelId);
    console.log('Update Channel - Current User:', this.currentUser);
    console.log('Update Channel - Channel:', this.channel);

    if (!this.channel || !this.currentUser) {
      this.snackBar.open('Invalid channel or user data', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.channelService.updateChannel(this.channelId, formData, this.currentUser);
      console.log('Update Channel - Result:', result);

      if (result.success) {
        this.snackBar.open(result.message, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/admin/channels']);
      } else {
        this.snackBar.open(result.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    } catch (error) {
      console.error('Error updating channel:', error);
      this.snackBar.open('Failed to update channel', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Go back to channels list
   */
  goBack(): void {
    this.router.navigate(['/admin/channels']);
  }
}