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

import { GroupDetailService } from './services/group-detail.service';
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
    private groupDetailService: GroupDetailService,
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
      this.groupDetailService.loadGroup(this.groupId);
    } else {
      console.error('No group ID provided');
    }
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // Subscribe to group data
    this.groupDetailService.group$
      .pipe(takeUntil(this.destroy$))
      .subscribe(group => {
        console.log('Group data received:', group);
        this.group = group;
        if (group) {
          this.updateGroupStats();
        }
      });

    // Subscribe to members data
    this.groupDetailService.members$
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.members = members;
        this.filteredMembers = members;
        this.updateGroupStats();
      });

    // Subscribe to channels data
    this.groupDetailService.channels$
      .pipe(takeUntil(this.destroy$))
      .subscribe(channels => {
        this.channels = channels;
        this.updateGroupStats();
      });
  }

  /**
   * Update group statistics
   */
  private updateGroupStats(): void {
    if (this.group) {
      this.groupStats = this.groupDetailService.getGroupStats(this.group);
    }
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

    const result = await this.groupDetailService.addMemberToGroup(this.groupId, username.trim());

    if (result.success) {
      this.snackBar.open(result.message, 'Close', { duration: 3000 });
      this.newMember = '';
    } else {
      this.snackBar.open(result.message, 'Close', { duration: 3000 });
    }
  }

  /**
   * Handle remove member
   */
  async onRemoveMember(userId: string): Promise<void> {
    if (confirm('Are you sure you want to remove this member from the group?')) {
      const result = await this.groupDetailService.removeMemberFromGroup(this.groupId, userId);

      if (result.success) {
        this.snackBar.open(result.message, 'Close', { duration: 3000 });
      } else {
        this.snackBar.open(result.message, 'Close', { duration: 3000 });
      }
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
    this.filteredMembers = this.members;
  }

  /**
   * Filter members based on search and status
   */
  private filterMembers(): void {
    let filtered = this.members;

    // Filter by search term
    if (this.searchTerm.trim()) {
      filtered = this.groupDetailService.searchUsers(this.searchTerm);
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
    this.snackBar.open('Edit group functionality - to be implemented', 'Close', { duration: 3000 });
  }

  /**
   * Delete group
   */
  async deleteGroup(): Promise<void> {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      const result = await this.groupDetailService.deleteGroup(this.groupId);

      if (result.success) {
        this.snackBar.open(result.message, 'Close', { duration: 3000 });
        this.router.navigate(['/admin/groups']);
      } else {
        this.snackBar.open(result.message, 'Close', { duration: 3000 });
      }
    }
  }
}