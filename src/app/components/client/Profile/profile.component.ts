import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ProfileService, EditData } from './services/profile.service';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { ProfileHeaderComponent } from './ui/profile-header.component';
import { ProfileInfoComponent } from './ui/profile-info.component';
import { ProfileEditComponent } from './ui/profile-edit.component';
import { ProfileGroupsComponent } from './ui/profile-groups.component';
import { User } from '../../../models/user.model';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    ClientLayoutComponent,
    ProfileHeaderComponent,
    ProfileInfoComponent,
    ProfileEditComponent,
    ProfileGroupsComponent
  ],
  template: `
    <app-client-layout [pageTitle]="'Profile'" [pageDescription]="'Manage your account and preferences'">
      <div class="profile-container">
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
          [isSubmitting]="isSubmitting"
          (submit)="onSubmit($event)"
          (reset)="onReset()">
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
    </app-client-layout>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  myGroups: Group[] = [];
  editData: EditData = {
    newUsername: '',
    newEmail: '',
    currentPassword: ''
  };
  isSubmitting: boolean = false;
  roleDisplayName: string = 'User';
  roleColor: string = 'primary';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.setupSubscriptions();
    this.updateRoleInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to user groups
    this.profileService.userGroups$
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => {
        this.myGroups = groups;
      });

    // Subscribe to submitting state
    this.profileService.isSubmitting$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSubmitting => {
        this.isSubmitting = isSubmitting;
      });
  }

  private updateRoleInfo(): void {
    this.roleDisplayName = this.profileService.getRoleDisplayName(this.currentUser);
    this.roleColor = this.profileService.getRoleColor(this.currentUser);
  }

  async onSubmit(editData: EditData): Promise<void> {
    try {
      await this.profileService.updateProfile(editData, this.currentUser);
      this.showSnackBar('Profile updated successfully!', 'success');
      this.onReset();

      // Refresh current user data
      this.currentUser = this.authService.getCurrentUser();
      this.updateRoleInfo();
    } catch (error) {
      this.showSnackBar('Failed to update profile. Please try again.', 'error');
    }
  }

  onReset(): void {
    this.editData = {
      newUsername: '',
      newEmail: '',
      currentPassword: ''
    };
  }

  onViewGroup(groupId: string): void {
    this.router.navigate(['/group', groupId]);
  }

  onLeaveGroup(group: Group): void {
    const snackBarRef = this.snackBar.open(
      `Leave "${group.name}"?`,
      'LEAVE',
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(async () => {
      try {
        await this.profileService.leaveGroup(group.id, this.currentUser);
        this.showSnackBar(`Left "${group.name}" successfully!`, 'success');
      } catch (error) {
        this.showSnackBar('Failed to leave group. Please try again.', 'error');
      }
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

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }
}