import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GroupsInterestService, GroupsFilters } from '../../services/client/groups-interest.service';
import { ClientLayoutComponent } from '../layouts/client-layout.component';
import { GroupsSearchComponent } from '../ui/client/groups/groups-search.component';
import { GroupsGridComponent } from '../ui/client/groups/groups-grid.component';
import { GroupsPaginationComponent } from '../ui/client/groups/groups-pagination.component';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';

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
  filters: GroupsFilters = { searchTerm: '', selectedCategory: '', selectedStatus: '' };
  paginatedGroups: Group[] = [];
  currentUser: User | null = null;
  pendingRequests: string[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor(
    private authService: AuthService,
    private groupsInterestService: GroupsInterestService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to paginated groups
    this.groupsInterestService.paginatedGroups$
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => {
        this.paginatedGroups = groups;
      });

    // Subscribe to total pages
    this.groupsInterestService.totalPages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(totalPages => {
        this.totalPages = totalPages;
      });

    // Subscribe to current page
    this.groupsInterestService.currentPage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentPage => {
        this.currentPage = currentPage;
      });

    // Subscribe to pending requests
    this.groupsInterestService.pendingRequests$
      .pipe(takeUntil(this.destroy$))
      .subscribe(requests => {
        this.pendingRequests = requests;
      });

    // Subscribe to current user
    this.groupsInterestService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    this.groupsInterestService.setCurrentUser(user);
  }

  onFiltersChange(filters: GroupsFilters): void {
    this.filters = filters;
    this.groupsInterestService.updateFilters(filters);
  }

  onPageChange(page: number): void {
    this.groupsInterestService.setCurrentPage(page);
  }

  async onRegisterInterest(groupId: string): Promise<void> {
    try {
      const success = await this.groupsInterestService.registerInterest(groupId);
      if (success) {
        this.snackBar.open('Interest registered successfully! Group admin will review your request.', 'Close', {
          duration: 5000
        });
      } else {
        this.snackBar.open('Failed to register interest. Please try again.', 'Close', {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error registering interest:', error);
      this.snackBar.open('An error occurred. Please try again.', 'Close', {
        duration: 3000
      });
    }
  }

  async onRequestInvite(groupId: string): Promise<void> {
    try {
      const success = await this.groupsInterestService.requestInvite(groupId);
      if (success) {
        this.snackBar.open('Invite request sent! Group admin will review your request.', 'Close', {
          duration: 5000
        });
      } else {
        this.snackBar.open('Failed to send invite request. Please try again.', 'Close', {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error requesting invite:', error);
      this.snackBar.open('An error occurred. Please try again.', 'Close', {
        duration: 3000
      });
    }
  }

  onViewGroup(groupId: string): void {
    this.router.navigate(['/group', groupId]);
  }
}