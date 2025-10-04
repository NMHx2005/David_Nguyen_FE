import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { GroupService } from '../../../services/group.service';
import { GroupFormComponent } from './ui/group-form.component';
import { Group, GroupStatus } from '../../../models/group.model';

@Component({
  selector: 'app-edit-group',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    GroupFormComponent
  ],
  template: `
      <div class="edit-group-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Edit Group</h1>
              <p>Update group information and settings</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button [routerLink]="['/admin/groups', groupId]">
                <mat-icon>arrow_back</mat-icon>
                Back to Group
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Edit Form -->
        <mat-card class="edit-form-card" *ngIf="group">
          <mat-card-content>
            <app-group-form
              [group]="group"
              (formSubmit)="updateGroup($event)"
              (onCancel)="goBack()">
            </app-group-form>
          </mat-card-content>
        </mat-card>

        <!-- Loading State -->
        <div *ngIf="!group" class="loading-state">
          <mat-icon class="loading-icon">refresh</mat-icon>
          <p>Loading group details...</p>
        </div>
      </div>
  `,
  styles: [`
    .edit-group-container {
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

    .edit-form-card {
      margin-bottom: 24px;
    }


    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading-icon {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 16px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .edit-group-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

    }
  `]
})
export class EditGroupComponent implements OnInit, OnDestroy {
  group: Group | null = null;
  groupId: string = '';
  currentUser: User | null = null;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private groupService: GroupService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Edit Group - Current user:', this.currentUser);
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      console.log('Edit Group - Group ID from route:', this.groupId);
      if (this.groupId) {
        this.loadGroup();
      }
    });
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
    // Load group data
    this.loadGroup();
  }

  /**
   * Load group data
   */
  private loadGroup(): void {
    if (!this.groupId) {
      console.error('No group ID provided');
      this.snackBar.open('Invalid group ID', 'Close', { duration: 3000 });
      this.router.navigate(['/admin/groups']);
      return;
    }

    console.log('Loading group with ID:', this.groupId);
    this.isLoading = true;
    this.groupService.getGroupById(this.groupId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Group API response:', response);
          this.isLoading = false;
          if (response.success) {
            // Map API data to Group model
            this.group = {
              id: response.data._id || response.data.id,
              name: response.data.name,
              description: response.data.description,
              category: response.data.category || 'general',
              status: response.data.status || GroupStatus.ACTIVE,
              createdBy: response.data.createdBy,
              admins: response.data.admins || [],
              members: response.data.members || [],
              channels: response.data.channels || [],
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
              isActive: response.data.isActive !== undefined ? response.data.isActive : true,
              memberCount: response.data.memberCount,
              maxMembers: response.data.maxMembers,
              isPrivate: response.data.isPrivate,
              tags: response.data.tags || []
            };
            console.log('Mapped group data:', this.group);
          } else {
            this.snackBar.open(response.message || 'Group not found', 'Close', { duration: 3000 });
            // Only redirect if it's not a permission error
            if (response.message !== 'Insufficient permissions') {
              this.router.navigate(['/admin/groups']);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading group:', error);
          this.snackBar.open('Failed to load group', 'Close', { duration: 3000 });
          // Only redirect if it's not a permission error
          if (error.error?.message !== 'Insufficient permissions') {
            this.router.navigate(['/admin/groups']);
          }
        }
      });
  }

  /**
   * Update group
   */
  async updateGroup(formData: Partial<Group>): Promise<void> {
    if (!this.group || !this.currentUser) {
      this.snackBar.open('Invalid group or user data', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.groupService.updateGroup(this.groupId, formData).toPromise();

      if (result?.success) {
        this.snackBar.open(result.message || 'Group updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/admin/groups', this.groupId]);
      } else {
        this.snackBar.open(result?.message || 'Failed to update group', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        // Don't redirect for permission errors
        if (result?.message !== 'Insufficient permissions') {
          this.router.navigate(['/admin/groups', this.groupId]);
        }
      }
    } catch (error) {
      console.error('Error updating group:', error);
      this.snackBar.open('Failed to update group', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      // Don't redirect for permission errors
      if ((error as any)?.error?.message !== 'Insufficient permissions') {
        this.router.navigate(['/admin/groups', this.groupId]);
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Go back to group detail
   */
  goBack(): void {
    this.router.navigate(['/admin/groups', this.groupId]);
  }
}
