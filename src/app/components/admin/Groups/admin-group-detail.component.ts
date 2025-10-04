import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { GroupService } from '../../../services/group.service';
import { GroupMemberService } from './services/group-member.service';
import { GroupOverviewComponent } from './ui/group-overview.component';
import { GroupMembersComponent } from './ui/group-members.component';
import { Group, Channel, User, GroupStatus, ChannelType, UserRole } from '../../../models';

@Component({
  selector: 'app-admin-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    GroupOverviewComponent,
    GroupMembersComponent
  ],
  template: `
      <!-- Page Header -->
      <mat-card class="page-header-card">
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">{{ group?.name || 'Group Management' }}</h1>
            <p class="page-subtitle">Manage group settings, members, and channels</p>
          </div>
          <div class="header-actions">
              <button mat-stroked-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              Back to Groups
            </button>
              <button mat-raised-button color="accent" (click)="editGroup()">
                <mat-icon>edit</mat-icon>
              Edit Group
            </button>
              <button mat-raised-button color="warn" (click)="deleteGroup()">
                <mat-icon>delete</mat-icon>
              Delete Group
            </button>
          </div>
        </div>
      </div>
      </mat-card>

      <!-- Group Content -->
      <div class="group-detail-content" *ngIf="group">
        <!-- Tabs Navigation -->
        <mat-card class="tabs-card">
          <mat-tab-group [(selectedIndex)]="activeTabIndex" (selectedIndexChange)="onTabChange($event)">
            <mat-tab label="Overview">
              <ng-template matTabContent>
                <app-group-overview 
                  [group]="group" 
                  [stats]="groupStats">
                </app-group-overview>
              </ng-template>
            </mat-tab>
            
            <mat-tab label="Members">
              <ng-template matTabContent>
                <app-group-members
                  [members]="members"
                  [filteredMembers]="filteredMembers"
                  [canRemoveMember]="canRemoveMember"
                  [newMember]="newMember"
                  [searchTerm]="searchTerm"
                  [statusFilter]="statusFilter"
                  (onAddMember)="onAddMember($event)"
                  (onRemoveMember)="onRemoveMember($event)"
                  (onSearchChange)="onSearchChange($event)"
                  (onFilterChange)="onFilterChange($event)"
                  (onClearFilters)="onClearFilters()">
                </app-group-members>
              </ng-template>
            </mat-tab>
            
            <mat-tab label="Channels">
              <ng-template matTabContent>
                <div class="channels-section">
                  <p>Channels management - to be implemented</p>
                </div>
              </ng-template>
            </mat-tab>
            
            <mat-tab label="Settings">
              <ng-template matTabContent>
                <div class="settings-section">
                  <p>Group settings - to be implemented</p>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
  `,
  styles: [`
    .page-header-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-header {
      padding: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-info p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tabs-card {
      margin-bottom: 24px;
    }

    .channels-section,
    .settings-section {
      padding: 40px;
      text-align: center;
      color: #666;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .header-actions {
        justify-content: center;
      }
    }
  `]
})
export class AdminGroupDetailComponent implements OnInit, OnDestroy {
  // Data properties
  group: Group | null = null;
  members: User[] = [];
  channels: Channel[] = [];
  filteredMembers: User[] = [];
  groupStats = {
    totalMembers: 0,
    totalChannels: 0,
    activeMembers: 0,
    inactiveMembers: 0
  };

  // UI properties
  activeTabIndex = 0;
  newMember = '';
  searchTerm = '';
  statusFilter = '';
  canRemoveMember = true;

  private destroy$ = new Subject<void>();
  private groupId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private groupMemberService: GroupMemberService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Get groupId from route parameters
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    console.log('AdminGroupDetailComponent initialized with groupId:', this.groupId);
    console.log('Route params:', this.route.snapshot.params);
    console.log('Route paramMap:', this.route.snapshot.paramMap);
    this.loadGroup();
    this.subscribeToServices();

    // Subscribe to route parameter changes to reload data when navigating back
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const newGroupId = params.get('id') || '';
      if (newGroupId && newGroupId !== this.groupId) {
        this.groupId = newGroupId;
        this.loadGroup();
      } else if (newGroupId === this.groupId) {
        // Same group ID, but reload data in case it was updated
        this.loadGroupData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load group data
   */
  private loadGroup(): void {
    if (this.groupId) {
      console.log('Loading group with ID:', this.groupId);
      this.loadGroupData();
    } else {
      console.error('No group ID provided');
    }
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // Load initial data
    this.loadGroupData();
  }

  private loadGroupData(): void {
    if (this.groupId) {
      this.groupService.getGroupById(this.groupId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              // Ensure arrays are properly initialized and handle API data structure
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
              this.updateGroupStats();
              this.loadMembers();
            }
          },
          error: (error) => {
            console.error('Error loading group:', error);
          }
        });
    }
  }

  /**
   * Update group statistics
   */
  private updateGroupStats(): void {
    if (this.group) {
      this.groupStats = this.getGroupStats(this.group);
    }
  }

  /**
   * Load members data
   */
  private loadMembers(): void {
    if (this.group && this.group.members) {
      // Handle both string array and object array formats from API
      this.members = this.group.members.map((member: any, index: number) => {
        // If member is already an object with user details
        if (typeof member === 'object' && member !== null) {
          // Use userId if available, otherwise create a placeholder
          const memberId = member.userId && member.userId.trim() !== ''
            ? member.userId
            : `placeholder_${index}`;

          return {
            _id: memberId,
            id: memberId,
            username: member.username && member.username.trim() !== ''
              ? member.username
              : `User ${memberId.substring(0, 8)}`,
            email: member.email && member.email.trim() !== ''
              ? member.email
              : `user${memberId.substring(0, 8)}@example.com`,
            roles: member.roles || [UserRole.USER],
            groups: member.groups || [this.groupId],
            isActive: member.isActive !== undefined ? member.isActive : true,
            createdAt: member.createdAt ? new Date(member.createdAt) : new Date(),
            updatedAt: member.updatedAt ? new Date(member.updatedAt) : new Date(),
            joinedAt: member.joinedAt ? new Date(member.joinedAt) : new Date(),
            // Add a flag to indicate if this member can be removed
            canRemove: member.userId && member.userId.trim() !== ''
          };
        } else {
          // If member is just a string ID
          const memberId = member.toString();
          return {
            _id: memberId,
            id: memberId,
            username: `User ${memberId.substring(0, 8)}`,
            email: `user${memberId.substring(0, 8)}@example.com`,
            roles: [UserRole.USER],
            groups: [this.groupId],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            canRemove: true
          };
        }
      });
      this.filteredMembers = [...this.members];
    } else {
      this.members = [];
      this.filteredMembers = [];
    }
  }

  private getGroupStats(group: Group): any {
    return {
      totalMembers: group.members?.length || 0,
      totalChannels: group.channels?.length || 0,
      admins: group.admins?.length || 0,
      createdAt: group.createdAt,
      status: group.status
    };
  }

  private searchUsers(searchTerm: string): User[] {
    return (this.members || []).filter(member =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Handle tab change
   */
  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  /**
   * Handle add member
   */
  async onAddMember(username: string): Promise<void> {
    if (!username.trim()) {
      this.snackBar.open('Please enter a username', 'Close', { duration: 3000 });
      return;
    }

    // For demo purposes, create a mock user with valid ObjectId
    // In real implementation, this should search for existing user
    const mockUserId = this.generateMockObjectId();

    this.groupMemberService.addMember(this.groupId, {
      userId: mockUserId,
      username: username.trim()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Member added successfully', 'Close', { duration: 3000 });
          this.newMember = '';
          // Reload group data
          this.loadGroupData();
        } else {
          this.snackBar.open(response.message || 'Failed to add member', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.snackBar.open('Failed to add member. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Generate a mock ObjectId for demo purposes
   * In real implementation, this should come from user search
   */
  private generateMockObjectId(): string {
    // Generate a 24-character hex string that looks like MongoDB ObjectId
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Handle remove member
   */
  async onRemoveMember(userId: string): Promise<void> {
    if (confirm('Are you sure you want to remove this member from the group?')) {
      this.groupMemberService.removeMember(this.groupId, userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Member removed successfully', 'Close', { duration: 3000 });
            // Reload group data
            this.loadGroup();
          } else {
            this.snackBar.open(response.message || 'Failed to remove member', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error removing member:', error);
          this.snackBar.open('Failed to remove member. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  /**
   * Handle search change
   */
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterMembers();
  }

  /**
   * Handle filter change
   */
  onFilterChange(statusFilter: string): void {
    this.statusFilter = statusFilter;
    this.filterMembers();
  }

  /**
   * Clear filters
   */
  onClearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.filteredMembers = this.members || [];
  }

  /**
   * Filter members based on search and status
   */
  private filterMembers(): void {
    let filtered = this.members || [];

    // Filter by search term
    if (this.searchTerm.trim()) {
      filtered = this.searchUsers(this.searchTerm);
    }

    // Filter by status
    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(member => member.isActive === isActive);
    }

    this.filteredMembers = filtered;
  }

  /**
   * Go back to groups list
   */
  goBack(): void {
    this.router.navigate(['/admin/groups']);
  }

  /**
   * Edit group
   */
  editGroup(): void {
    if (this.groupId) {
      this.router.navigate(['/admin/groups', this.groupId, 'edit']);
    } else {
      this.snackBar.open('Group ID not found', 'Close', { duration: 3000 });
    }
  }

  /**
   * Delete group
   */
  async deleteGroup(): Promise<void> {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      const result = await this.groupService.deleteGroup(this.groupId).toPromise();

      if (result?.success) {
        this.snackBar.open(result.message || 'Group deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/groups']);
      } else {
        this.snackBar.open(result?.message || 'Failed to delete group', 'Close', { duration: 3000 });
      }
    }
  }
}