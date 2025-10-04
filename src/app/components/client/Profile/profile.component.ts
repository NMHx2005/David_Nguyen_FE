import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { User, UserRole } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { UploadService } from '../../../services/upload.service';
import { GroupService } from '../../../services/group.service';
import { ClientService, ClientProfile } from '../../../services/client.service';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { ProfileHeaderComponent } from './ui/profile-header.component';
import { ProfileInfoComponent } from './ui/profile-info.component';
import { ProfileEditComponent } from './ui/profile-edit.component';
import { ProfileGroupsComponent } from './ui/profile-groups.component';

export interface EditData {
  newUsername: string;
  newEmail: string;
  currentPassword: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ClientLayoutComponent,
    ProfileHeaderComponent,
    ProfileInfoComponent,
    ProfileEditComponent,
    ProfileGroupsComponent
  ],
  template: `
    <app-client-layout [pageTitle]="'Profile'" [pageDescription]="'Manage your account and preferences'">
      <div class="profile-container">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading profile data...</p>
        </div>

        <!-- Profile Content -->
        <div *ngIf="!isLoading">
          <!-- Profile Header -->
          <app-profile-header
            [currentUser]="currentUser"
            [roleDisplayName]="roleDisplayName"
            (editProfile)="scrollToEditSection()">
          </app-profile-header>

          <!-- Personal Information -->
          <app-profile-info
            [currentUser]="currentUser"
            [roleDisplayName]="roleDisplayName"
            [roleColor]="roleColor">
          </app-profile-info>

          <!-- Edit Profile -->
          <app-profile-edit
            [editData]="editData"
            [currentUser]="currentUser"
            [isSubmitting]="isSubmitting"
            (submit)="onSubmit($event)"
            (reset)="onReset()"
            (avatarUpload)="onAvatarUpload($event)">
          </app-profile-edit>

          <!-- My Groups -->
          <app-profile-groups
            [myGroups]="myGroups"
            [currentUser]="currentUser"
            (viewGroup)="onViewGroup($event)"
            (leaveGroup)="onLeaveGroup($event)"
            (browseGroups)="onBrowseGroups()">
          </app-profile-groups>
        </div>
      </div>
    </app-client-layout>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      color: #666;
      font-size: 16px;
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  clientProfile: ClientProfile | null = null;
  myGroups: any[] = [];
  editData: EditData = {
    newUsername: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  roleDisplayName: string = 'User';
  roleColor: string = 'primary';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private uploadService: UploadService,
    private groupService: GroupService,
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  private convertAuthUserToModelUser(authUser: any): User | null {
    if (!authUser) return null;

    return {
      id: authUser._id || authUser.id,
      username: authUser.username,
      email: authUser.email,
      roles: authUser.roles || [],
      groups: authUser.groups || [],
      isActive: authUser.isActive,
      createdAt: new Date(authUser.createdAt),
      updatedAt: new Date(authUser.updatedAt),
      avatarUrl: authUser.avatar,
      password: undefined
    };
  }

  ngOnInit(): void {
    const authUser = this.authService.getCurrentUser();
    this.currentUser = this.convertAuthUserToModelUser(authUser);
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadClientProfile();
    this.loadUserProfile();
    this.loadUserGroups();
    this.updateRoleInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadClientProfile(): void {
    this.clientService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.clientProfile = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading client profile:', error);
        }
      });
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUserProfile()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading user profile:', error);
          this.showSnackBar('Failed to load profile data', 'error');
          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.currentUser = this.convertAuthUserToModelUser(response.data);
            this.updateRoleInfo();
            this.populateEditForm();
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });
  }

  private loadUserGroups(): void {
    if (!this.currentUser?.id) return;

    this.userService.getUserGroups(this.currentUser.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading user groups:', error);
          this.showSnackBar('Failed to load groups', 'error');
          throw error;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.myGroups = response.data;
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });
  }

  private updateRoleInfo(): void {
    if (!this.currentUser) return;

    if (this.currentUser.roles?.includes(UserRole.SUPER_ADMIN)) {
      this.roleDisplayName = 'Super Administrator';
      this.roleColor = 'warn';
    } else if (this.currentUser.roles?.includes(UserRole.GROUP_ADMIN)) {
      this.roleDisplayName = 'Group Administrator';
      this.roleColor = 'accent';
    } else {
      this.roleDisplayName = 'User';
      this.roleColor = 'primary';
    }
  }

  private populateEditForm(): void {
    if (this.currentUser) {
      this.editData = {
        newUsername: this.currentUser.username || '',
        newEmail: this.currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  }

  onSubmit(editData: EditData): void {
    if (!this.currentUser?.id) {
      this.showSnackBar('No user found', 'error');
      return;
    }

    this.isSubmitting = true;

    // Prepare update data
    const updateData: any = {};
    if (editData.newUsername) updateData.username = editData.newUsername;
    if (editData.newEmail) updateData.email = editData.newEmail;

    // Update profile
    this.userService.updateCurrentUserProfile(updateData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Profile update error:', error);
          this.handleUpdateError(error);
          throw error;
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSnackBar('Profile updated successfully!', 'success');
            this.onReset();

            // Update current user data
            if (response.data) {
              this.currentUser = this.convertAuthUserToModelUser(response.data);
              this.updateRoleInfo();
            }
          } else {
            this.showSnackBar(response.message || 'Failed to update profile', 'error');
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });

    // Handle password change if provided
    if (editData.newPassword && editData.confirmPassword) {
      if (editData.newPassword !== editData.confirmPassword) {
        this.showSnackBar('New passwords do not match', 'error');
        return;
      }

      this.changePassword(editData.currentPassword, editData.newPassword);
    }
  }

  onReset(): void {
    this.editData = {
      newUsername: '',
      newEmail: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  private changePassword(currentPassword: string, newPassword: string): void {
    // TODO: Implement changePassword method in AuthService
    console.log('Change password requested:', { currentPassword, newPassword });
    this.showSnackBar('Password change feature not yet implemented', 'error');
  }

  onAvatarUpload(file: File): void {
    if (!this.currentUser?.id) {
      this.showSnackBar('No user found', 'error');
      return;
    }

    this.uploadService.uploadAvatar(file)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Avatar upload error:', error);
          this.handleUploadError(error);
          throw error;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update user avatar
            const updateData = { avatar: response.data.avatarUrl };
            this.userService.updateCurrentUserProfile(updateData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (updateResponse: any) => {
                  if (updateResponse.success && updateResponse.data) {
                    this.currentUser = this.convertAuthUserToModelUser(updateResponse.data);
                    this.showSnackBar('Avatar updated successfully!', 'success');
                  }
                },
                error: (error: any) => {
                  this.showSnackBar('Failed to update avatar', 'error');
                }
              });
          }
        },
        error: (error) => {
          // Error already handled in catchError
        }
      });
  }

  onViewGroup(groupId: string): void {
    this.router.navigate(['/group', groupId]);
  }

  onLeaveGroup(group: any): void {
    const snackBarRef = this.snackBar.open(
      `Leave "${group.name}"?`,
      'LEAVE',
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(() => {
      if (!this.currentUser?.id) {
        this.showSnackBar('No user found', 'error');
        return;
      }

      this.groupService.removeMember(group._id, this.currentUser.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            console.error('Leave group error:', error);
            this.showSnackBar('Failed to leave group. Please try again.', 'error');
            throw error;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showSnackBar(`Left "${group.name}" successfully!`, 'success');
              // Reload groups
              this.loadUserGroups();
            } else {
              this.showSnackBar(response.message || 'Failed to leave group', 'error');
            }
          },
          error: (error) => {
            // Error already handled in catchError
          }
        });
    });
  }

  onBrowseGroups(): void {
    this.router.navigate(['/groups']);
  }

  scrollToEditSection(): void {
    // Scroll to edit section - this would be implemented with ViewChild in a real app
    const editSection = document.querySelector('app-profile-edit');
    if (editSection) {
      editSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private handleUpdateError(error: any): void {
    let errorMessage = 'Failed to update profile. Please try again.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid profile data. Please check your input.';
    } else if (error.status === 409) {
      errorMessage = 'Username or email already exists. Please try a different one.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    }

    this.showSnackBar(errorMessage, 'error');
  }

  private handlePasswordChangeError(error: any): void {
    let errorMessage = 'Failed to change password. Please try again.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid password data. Please check your input.';
    } else if (error.status === 401) {
      errorMessage = 'Current password is incorrect.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    }

    this.showSnackBar(errorMessage, 'error');
  }

  private handleUploadError(error: any): void {
    let errorMessage = 'Failed to upload avatar. Please try again.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid file format. Please upload a valid image file.';
    } else if (error.status === 413) {
      errorMessage = 'File too large. Please upload a smaller image.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    }

    this.showSnackBar(errorMessage, 'error');
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }
}