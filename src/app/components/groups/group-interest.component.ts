import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Group, GroupStatus } from '../../models';
import { ClientLayoutComponent } from '../layouts/client-layout.component';

@Component({
  selector: 'app-group-interest',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    ClientLayoutComponent
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
      <mat-card class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search groups</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterGroups()" placeholder="Search by name or description...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="filter-options">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (ngModelChange)="filterGroups()">
              <mat-option value="">All Categories</mat-option>
              <mat-option value="development">Development</mat-option>
              <mat-option value="design">Design</mat-option>
              <mat-option value="marketing">Marketing</mat-option>
              <mat-option value="general">General</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="filterGroups()">
              <mat-option value="">All Status</mat-option>
              <mat-option value="open">Open for Join</mat-option>
              <mat-option value="closed">Closed</mat-option>
              <mat-option value="invite">Invite Only</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Groups Grid -->
      <div class="groups-container">
        <mat-card *ngFor="let group of filteredGroups" class="group-card">
          <mat-card-header>
            <mat-card-title>{{ group.name }}</mat-card-title>
            <mat-chip class="group-status" [ngClass]="group.status">
              {{ getStatusLabel(group.status) }}
            </mat-chip>
          </mat-card-header>

          <mat-card-content>
            <p class="group-description">{{ group.description || 'No description available' }}</p>

            <div class="group-meta">
              <div class="meta-item">
                <mat-icon>groups</mat-icon>
                <span>{{ group.members.length }} members</span>
              </div>
              <div class="meta-item">
                <mat-icon>chat</mat-icon>
                <span>{{ group.channels.length }} channels</span>
              </div>
              <div class="meta-item">
                <mat-icon>calendar_today</mat-icon>
                <span>{{ formatDate(group.createdAt) }}</span>
              </div>
            </div>

            <div class="group-categories">
              <mat-chip class="category-tag">
                {{ group.category | titlecase }}
              </mat-chip>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button 
              *ngIf="!isMember(group) && !hasPendingRequest(group)"
              mat-raised-button
              color="primary"
              (click)="registerInterest(group.id)"
              [disabled]="group.status === GroupStatus.INACTIVE"
              matTooltip="{{ group.status === GroupStatus.INACTIVE ? 'Group is inactive' : 'Register interest to join' }}">
              {{ group.status === GroupStatus.INACTIVE ? 'Inactive' : 'Register Interest' }}
            </button>

            <button 
              *ngIf="isMember(group)"
              mat-button
              color="accent"
              (click)="viewGroup(group.id)"
              matTooltip="View group details">
              <mat-icon>visibility</mat-icon>
              View Group
            </button>

            <button 
              *ngIf="hasPendingRequest(group)"
              mat-button
              color="accent"
              disabled
              matTooltip="Request pending approval">
              Request Pending
            </button>

            <button 
              *ngIf="!isMember(group) && group.status === GroupStatus.PENDING"
              mat-button
              color="accent"
              (click)="requestInvite(group.id)"
              matTooltip="Request an invitation">
              <mat-icon>mail</mat-icon>
              Request Invite
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="filteredGroups.length === 0" class="empty-state">
          <mat-icon class="empty-icon">search</mat-icon>
          <h3>No Groups Found</h3>
          <p>Try adjusting your search criteria or browse all groups.</p>
          <button mat-raised-button color="primary" (click)="clearFilters()" matTooltip="Reset filters">
            <mat-icon>clear</mat-icon>
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="pagination">
        <button 
          mat-button
          color="primary"
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
          matTooltip="Previous page">
          <mat-icon>chevron_left</mat-icon>
          Previous
        </button>

        <div class="page-numbers">
          <mat-chip 
            *ngFor="let page of getPageNumbers()"
            class="page-number"
            [class.active]="page === currentPage"
            (click)="changePage(page)">
            {{ page }}
          </mat-chip>
        </div>

        <button 
          mat-button
          color="primary"
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
          matTooltip="Next page">
          Next
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
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

    .search-section {
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
      background: white;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 16px;
    }

    .filter-options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-options mat-form-field {
      min-width: 200px;
    }

    .groups-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .group-card {
      border-radius: 12px;
      transition: all 0.3s ease;
      background: white;
    }

    .group-card:hover {
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
      transform: translateY(-4px);
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .group-header mat-card-title {
      font-size: 1.3rem;
      color: #333;
    }

    .group-status {
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .group-status.open {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .group-status.closed {
      background: #fce4ec !important;
      color: #c2185b !important;
    }

    .group-status.invite {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
    }

    .group-description {
      color: #666;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .group-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .group-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .category-tag {
      background: #e3f2fd !important;
      color: #1976d2 !important;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .group-actions {
      display: flex;
      gap: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;
      grid-column: 1 / -1;
    }

    .empty-icon {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 16px 0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 24px;
    }

    .page-numbers {
      display: flex;
      gap: 8px;
    }

    .page-number {
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 40px;
      text-align: center;
      background: #f5f5f5;
      color: #333;
    }

    .page-number:hover {
      background: #e3f2fd;
    }

    .page-number.active {
      background: #667eea !important;
      color: white !important;
    }

    @media (max-width: 768px) {
      .group-interest-container {
        padding: 16px;
      }

      .page-header mat-card-title {
        font-size: 1.8rem;
      }

      .groups-container {
        grid-template-columns: 1fr;
      }

      .filter-options {
        flex-direction: column;
      }

      .group-actions {
        flex-direction: column;
      }

      .pagination {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class GroupInterestComponent implements OnInit {
  allGroups: Group[] = [];
  filteredGroups: Group[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  pendingRequests: string[] = [];
  GroupStatus = GroupStatus;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Lifecycle: load groups and pending requests for the current user.
   */
  ngOnInit(): void {
    this.loadGroups();
    this.loadPendingRequests();
  }

  /**
   * Map GroupStatus enum to human-readable label.
   */
  getStatusLabel(status: GroupStatus | string): string {
    const s = (typeof status === 'string') ? status.toString().toUpperCase() : status;
    switch (s) {
      case GroupStatus.ACTIVE:
      case 'ACTIVE':
        return 'Active';
      case GroupStatus.INACTIVE:
      case 'INACTIVE':
        return 'Inactive';
      case GroupStatus.PENDING:
      case 'PENDING':
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  /**
   * Load groups (Phase 1: mock data) and apply initial filters.
   */
  loadGroups(): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      const raw = JSON.parse(storedGroups);
      const normalizeStatus = (s: any): GroupStatus => {
        const up = (typeof s === 'string') ? s.toUpperCase() : s;
        switch (up) {
          case 'ACTIVE': return GroupStatus.ACTIVE;
          case 'INACTIVE': return GroupStatus.INACTIVE;
          case 'PENDING': return GroupStatus.PENDING;
          default: return GroupStatus.ACTIVE;
        }
      };
      this.allGroups = (Array.isArray(raw) ? raw : []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        status: normalizeStatus(g.status),
        category: g.category || 'general',
        members: Array.isArray(g.members) ? g.members : [],
        channels: Array.isArray(g.channels) ? g.channels : [],
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        createdBy: g.createdBy || 'system',
        admins: Array.isArray(g.admins) ? g.admins : [],
        updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
        isActive: g.isActive !== false,
        memberCount: g.memberCount || (Array.isArray(g.members) ? g.members.length : 0)
      }));
    } else {
      // Fallback to demo seed when no groups in storage
      this.allGroups = [];
    }

    this.filterGroups();
  }

  /**
   * Load current user's pending join/request invites from localStorage.
   */
  loadPendingRequests(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const storedRequests = localStorage.getItem(`pendingRequests_${currentUser.id}`);
      this.pendingRequests = storedRequests ? JSON.parse(storedRequests) : [];
    }
  }

  /**
   * Persist current user's pending requests to localStorage.
   */
  savePendingRequests(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      localStorage.setItem(`pendingRequests_${currentUser.id}`, JSON.stringify(this.pendingRequests));
    }
  }

  /**
   * Apply search, category, and status filters; reset pagination; compute pages.
   */
  filterGroups(): void {
    let filtered = this.allGroups;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(group =>
        group.category === this.selectedCategory
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(group =>
        group.status === this.selectedStatus as GroupStatus
      );
    }

    this.filteredGroups = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  /**
   * Compute total pages based on filtered results and items per page.
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredGroups.length / this.itemsPerPage);
    this.totalPages = Math.max(1, this.totalPages);
  }

  /**
   * Get a small range of page numbers around the current page.
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Change current page if within range.
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Reset search and filters, then re-apply.
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.filterGroups();
  }

  /**
   * Check if current user is a member of the given group.
   */
  isMember(group: Group): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? Array.isArray(group.members) && group.members.includes(currentUser.id) : false;
  }

  /**
   * Check if current user has a pending request for the group.
   */
  hasPendingRequest(group: Group): boolean {
    return this.pendingRequests.includes(group.id);
  }

  /**
   * Register interest to join a group, with validation and persistence.
   */
  async registerInterest(groupId: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.snackBar.open('Please log in to register interest', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Check if already a member
      const group = this.allGroups.find(g => g.id === groupId);
      if (group && this.isMember(group)) {
        this.snackBar.open('You are already a member of this group', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      // Check if already has pending request
      if (this.hasPendingRequest(group!)) {
        this.snackBar.open('You already have a pending request for this group', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.pendingRequests.push(groupId);
      this.savePendingRequests();

      // Store interest request for group admin to review
      this.storeInterestRequest(groupId, currentUser.id, 'register_interest');

      this.snackBar.open('Interest registered successfully! Group admin will review your request.', 'Close', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to register interest. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Request an invite to a restricted group, with validation and persistence.
   */
  async requestInvite(groupId: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.snackBar.open('Please log in to request invite', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Check if already a member
      const group = this.allGroups.find(g => g.id === groupId);
      if (group && this.isMember(group)) {
        this.snackBar.open('You are already a member of this group', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      // Check if already has pending request
      if (this.hasPendingRequest(group!)) {
        this.snackBar.open('You already have a pending request for this group', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.pendingRequests.push(groupId);
      this.savePendingRequests();

      // Store invite request for group admin to review
      this.storeInterestRequest(groupId, currentUser.id, 'request_invite');

      this.snackBar.open('Invite request sent! Group admin will review your request.', 'Close', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to send invite request. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Store an interest/invite request in localStorage for admin review.
   */
  storeInterestRequest(groupId: string, userId: string, requestType: 'register_interest' | 'request_invite'): void {
    const requests = JSON.parse(localStorage.getItem('groupInterestRequests') || '[]');
    const currentUser = this.authService.getCurrentUser();
    const group = this.allGroups.find(g => g.id === groupId);

    requests.push({
      id: Date.now().toString(),
      groupId: groupId,
      groupName: group?.name || 'Unknown Group',
      userId: userId,
      username: currentUser?.username || 'Unknown',
      requestType: requestType,
      requestedAt: new Date(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null
    });

    localStorage.setItem('groupInterestRequests', JSON.stringify(requests));
  }

  /**
   * Navigate to the client group detail page.
   */
  viewGroup(groupId: string): void {
    this.router.navigate(['/groups', groupId]);
  }

  /**
   * Format a date to a readable string.
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}