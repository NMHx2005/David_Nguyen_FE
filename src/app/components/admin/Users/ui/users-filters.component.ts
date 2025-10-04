import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserFilters } from '../../../../models/user.model';

@Component({
  selector: 'app-users-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card class="search-section-card">
      <mat-card-content>
        <div class="search-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search users</mat-label>
            <input matInput
                   [(ngModel)]="filters.searchTerm"
                   placeholder="Search by username, email, or role..."
                   (input)="onFiltersChange.emit(filters)">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div class="filter-options">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Role</mat-label>
              <mat-select [(ngModel)]="filters.role" (selectionChange)="onFiltersChange.emit(filters)">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="SUPER_ADMIN">Super Admin</mat-option>
                <mat-option value="GROUP_ADMIN">Group Admin</mat-option>
                <mat-option value="USER">User</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="filters.isActive" (selectionChange)="onFiltersChange.emit(filters)">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .search-section-card {
      margin-bottom: 24px;
    }

    .search-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .search-field {
      width: 100%;
      min-width: 300px;
    }

    .filter-options {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 150px;
    }

    @media (max-width: 768px) {
      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .filter-options {
        flex-direction: column;
      }
    }
  `]
})
export class UsersFiltersComponent {
  @Input() filters: UserFilters = {
    searchTerm: '',
    role: 'all',
    isActive: 'all',
    sortBy: 'username',
    sortOrder: 'asc'
  };

  @Output() onFiltersChange = new EventEmitter<UserFilters>();

  constructor() { }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      role: 'all',
      isActive: 'all',
      sortBy: 'username',
      sortOrder: 'asc'
    };
    this.onFiltersChange.emit(this.filters);
  }
}
