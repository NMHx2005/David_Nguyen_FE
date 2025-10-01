import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface GroupsFilters {
    searchTerm: string;
    selectedCategory: string;
    selectedStatus: string;
}

@Component({
    selector: 'app-groups-search',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule
    ],
    template: `
    <mat-card class="search-section">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search groups</mat-label>
        <input matInput 
               [(ngModel)]="filters.searchTerm" 
               (ngModelChange)="onFiltersChange()" 
               placeholder="Search by name or description...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="filter-options">
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="filters.selectedCategory" (ngModelChange)="onFiltersChange()">
            <mat-option value="">All Categories</mat-option>
            <mat-option value="development">Development</mat-option>
            <mat-option value="design">Design</mat-option>
            <mat-option value="marketing">Marketing</mat-option>
            <mat-option value="general">General</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="filters.selectedStatus" (ngModelChange)="onFiltersChange()">
            <mat-option value="">All Status</mat-option>
            <mat-option value="open">Open for Join</mat-option>
            <mat-option value="closed">Closed</mat-option>
            <mat-option value="invite">Invite Only</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-card>
  `,
    styles: [`
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

    @media (max-width: 768px) {
      .filter-options {
        flex-direction: column;
      }
    }
  `]
})
export class GroupsSearchComponent {
    @Input() filters: GroupsFilters = { searchTerm: '', selectedCategory: '', selectedStatus: '' };

    @Output() filtersChange = new EventEmitter<GroupsFilters>();

    onFiltersChange(): void {
        this.filtersChange.emit({ ...this.filters });
    }
}
