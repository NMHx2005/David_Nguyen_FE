import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { GroupService } from '../../../services/group.service';
import { GroupRequestService } from '../../../services/group-request.service';
import { ClientService } from '../../../services/client.service';
import { Group } from '../../../models/group.model';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { GroupsSearchComponent } from './ui/groups-search.component';
import { GroupsGridComponent } from './ui/groups-grid.component';
import { GroupsPaginationComponent } from './ui/groups-pagination.component';

@Component({
  selector: 'app-group-interest',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSnackBarModule,
    ClientLayoutComponent,
    GroupsSearchComponent,
    GroupsGridComponent,
    GroupsPaginationComponent
  ],
  template: `
    <app-client-layout [pageTitle]="'Groups'" [pageDescription]="'Discover and join groups'">
      <div class="group-interest-container">
        <!-- Page Header -->
        <mat-card class="page-header">
          <mat-card-title>Browse Groups</mat-card-title>
          <mat-card-subtitle>Discover and join groups that interest you</mat-card-subtitle>
        </mat-card>

        <!-- Search and Filter Section -->
        <app-groups-search 
          [filters]="filters"
          (filtersChange)="onFiltersChange($event)">
        </app-groups-search>

        <!-- Groups Grid -->
        <app-groups-grid 
          [groups]="paginatedGroups"
          [currentUser]="currentUser"
          [pendingRequests]="pendingRequests"
          (registerInterest)="onRegisterInterest($event)"
          (viewGroup)="onViewGroup($event)"
          (requestInvite)="onRequestInvite($event)">
        </app-groups-grid>

        <!-- Pagination -->
        <app-groups-pagination
          [currentPage]="currentPage"
          [totalPages]="totalPages"
          (pageChange)="onPageChange($event)">
        </app-groups-pagination>
      </div>
    </app-client-layout>
  `,
  styles: [`
    .group-interest-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      background: #f8f9fa;
    }

    .page-header {
      text-align: center;
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .page-header mat-card-title {
      font-size: 2rem;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .page-header mat-card-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .group-interest-container {
        padding: 16px;
      }

      .page-header mat-card-title {
        font-size: 1.8rem;
      }
    }
  `]
})
export class GroupInterestComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  filters: any = { searchTerm: '', selectedCategory: '', selectedStatus: '' };
  paginatedGroups: Group[] = [];
  allGroups: Group[] = [];
  currentUser: User | null = null;
  pendingRequests: string[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;
  itemsPerPage = 12;

  constructor(
    private authService: AuthService,
    private groupService: GroupService,
    private groupRequestService: GroupRequestService,
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadGroups();

    // Refresh data every 30 seconds to catch updates from admin approvals
    setInterval(() => {
      this.loadGroups();
    }, 30000);
  }

  // Add method to refresh data when component becomes active
  onActivate(): void {
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
  }

  /**
   * Map API Group to models Group
   */
  private mapApiGroupToModel(apiGroup: any): Group {
    // Filter out members with empty userId or username
    const validMembers = apiGroup.members?.filter((m: any) =>
      m.userId && m.userId.trim() !== '' && m.username && m.username.trim() !== ''
    ) || [];

    return {
      id: apiGroup._id || apiGroup.id,
      name: apiGroup.name,
      description: apiGroup.description,
      category: apiGroup.category || 'general',
      status: apiGroup.status || 'active', // Use actual status from API
      createdBy: apiGroup.createdBy,
      admins: apiGroup.admins || [],
      members: validMembers.map((m: any) => m.userId),
      channels: [], // Default empty channels
      createdAt: new Date(apiGroup.createdAt),
      updatedAt: new Date(apiGroup.updatedAt),
      isActive: apiGroup.isActive !== false,
      memberCount: validMembers.length, // Use filtered count
      maxMembers: apiGroup.maxMembers || 100,
      tags: apiGroup.tags || [], // Include tags from API
      isPrivate: apiGroup.isPrivate || false // Include privacy setting
    };
  }

  private loadGroups(): void {
    this.isLoading = true;

    // Load all groups, user's joined groups, and pending requests
    forkJoin({
      allGroups: this.groupService.getAllGroups(),
      userGroups: this.clientService.getUserGroups(),
      pendingRequests: this.groupRequestService.getGroupRequests({
        page: 1,
        limit: 1000,
        status: 'pending'
      })
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading groups:', error);
          this.showSnackBar('Failed to load groups', 'error');
          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (responses: any) => {
          console.log('🔍 API Responses:', responses);

          if (responses.allGroups.success && responses.allGroups.data?.groups) {
            console.log('✅ All Groups loaded:', responses.allGroups.data.groups.length);
            // Map API Groups to models
            this.allGroups = responses.allGroups.data.groups.map((apiGroup: any) => this.mapApiGroupToModel(apiGroup));

            // Mark which groups user has joined
            if (responses.userGroups.success && responses.userGroups.data) {
              console.log('✅ User Groups loaded:', responses.userGroups.data.length);
              const joinedGroupIds = responses.userGroups.data.map((group: any) => group._id || group.id);
              this.allGroups.forEach(group => {
                group.isJoined = joinedGroupIds.includes(group.id);
              });
            } else {
              console.log('⚠️ User Groups empty or failed:', responses.userGroups);
              // Fallback: check if current user is in group members from original API data
              this.allGroups.forEach(group => {
                // Find the group in original API response
                const originalGroup = responses.allGroups.data.groups.find((g: any) => g._id === group.id);
                if (originalGroup && originalGroup.members) {
                  const isMember = originalGroup.members.some((member: any) =>
                    member.userId === this.currentUser?.id
                  );
                  group.isJoined = isMember || false;
                } else {
                  group.isJoined = false;
                }
              });
            }

            // Load pending requests for current user
            if (responses.pendingRequests.success && responses.pendingRequests.data?.requests) {
              console.log('✅ Pending Requests loaded:', responses.pendingRequests.data.requests.length);
              // Filter requests for current user and get group IDs
              const userPendingRequests = responses.pendingRequests.data.requests
                .filter((request: any) => request.userId === this.currentUser?.id)
                .map((request: any) => request.groupId);
              this.pendingRequests = userPendingRequests;
            } else {
              console.log('⚠️ Pending Requests empty or failed:', responses.pendingRequests);
              this.pendingRequests = [];
            }

            this.applyFiltersAndPagination();
          } else {
            console.log('❌ All Groups failed:', responses.allGroups);
          }
        },
        error: (error: any) => {
          console.log('💥 Error loading groups:', error);
          // Error already handled in catchError
        }
      });
  }

  private applyFiltersAndPagination(): void {
    let filteredGroups = [...this.allGroups];

    // Filter out inactive groups, but keep groups that user has already joined
    filteredGroups = filteredGroups.filter(group => {
      // Always show groups that user has joined (even if inactive)
      if (group.isJoined) {
        return true;
      }
      // For non-joined groups, only show active ones
      return group.status === 'active';
    });

    // Apply search filter
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filteredGroups = filteredGroups.filter(group =>
        group.name.toLowerCase().includes(searchTerm) ||
        group.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (this.filters.selectedCategory) {
      filteredGroups = filteredGroups.filter(group =>
        group.name.toLowerCase().includes(this.filters.selectedCategory.toLowerCase())
      );
    }

    // Apply status filter
    if (this.filters.selectedStatus) {
      filteredGroups = filteredGroups.filter(group =>
        this.filters.selectedStatus === 'active' ? group.isActive : !group.isActive
      );
    }

    // Calculate pagination
    this.totalPages = Math.ceil(filteredGroups.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedGroups = filteredGroups.slice(startIndex, endIndex);
  }

  onFiltersChange(filters: any): void {
    this.filters = filters;
    this.currentPage = 1; // Reset to first page when filters change
    this.applyFiltersAndPagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFiltersAndPagination();
  }

  onRegisterInterest(groupId: string): void {
    if (!this.currentUser?.id) {
      this.showSnackBar('Please login to register interest', 'error');
      return;
    }

    // Find the group to get its name
    const group = this.allGroups.find(g => g.id === groupId);
    if (!group) {
      this.showSnackBar('Group not found', 'error');
      return;
    }

    // Create group request instead of joining directly
    this.groupRequestService.createGroupRequest({
      groupId: groupId,
      requestType: 'register_interest',
      message: `I would like to join ${group.name} group.`
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error creating group request:', error);
          this.handleJoinError(error);
          throw error;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSnackBar('Request sent successfully! Admin will review your request.', 'success');
            // Add to pending requests to show "Request Pending" state
            this.pendingRequests.push(groupId);
            this.applyFiltersAndPagination(); // Update UI
          } else {
            this.showSnackBar(response.message || 'Failed to send request', 'error');
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });
  }

  onRequestInvite(groupId: string): void {
    if (!this.currentUser?.id) {
      this.showSnackBar('Please login to request invite', 'error');
      return;
    }

    // Find the group to get its name
    const group = this.allGroups.find(g => g.id === groupId);
    if (!group) {
      this.showSnackBar('Group not found', 'error');
      return;
    }

    // Create group request for private groups
    this.groupRequestService.createGroupRequest({
      groupId: groupId,
      requestType: 'request_invite',
      message: `I would like to request an invitation to join ${group.name} group.`
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error creating group request:', error);
          this.handleJoinError(error);
          throw error;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSnackBar('Invite request sent successfully! Admin will review your request.', 'success');
            // Add to pending requests to show "Request Pending" state
            this.pendingRequests.push(groupId);
            this.applyFiltersAndPagination(); // Update UI
          } else {
            this.showSnackBar(response.message || 'Failed to send invite request', 'error');
          }
        },
        error: (error: any) => {
          // Error already handled in catchError
        }
      });
  }

  onViewGroup(groupId: string): void {
    this.router.navigate(['/group', groupId]);
  }

  private handleJoinError(error: any): void {
    let errorMessage = 'Failed to join group. Please try again.';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid group data. Please try again.';
    } else if (error.status === 409) {
      errorMessage = 'You are already a member of this group.';
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