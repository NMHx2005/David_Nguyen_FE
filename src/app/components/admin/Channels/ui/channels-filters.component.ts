import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Group } from '../../../../models/group.model';
import { ChannelFilters, ChannelType } from '../../../../models/channel.model';

@Component({
  selector: 'app-channels-filters',
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
            <mat-label>Search channels</mat-label>
            <input matInput
                   [(ngModel)]="filters.searchTerm"
                   placeholder="Search by name or description..."
                   (input)="onFiltersChange.emit(filters)">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div class="filter-options">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Group</mat-label>
              <mat-select [(ngModel)]="filters.groupId" (selectionChange)="onFiltersChange.emit(filters)">
                <mat-option value="">All Groups</mat-option>
                <mat-option *ngFor="let group of groups" [value]="group.id">
                  {{ group.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="filters.channelType" (selectionChange)="onFiltersChange.emit(filters)">
                <mat-option value="all">All Types</mat-option>
                <mat-option [value]="ChannelType.TEXT">Text</mat-option>
                <mat-option [value]="ChannelType.VOICE">Voice</mat-option>
                <mat-option [value]="ChannelType.VIDEO">Video</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Per Page</mat-label>
              <mat-select [(ngModel)]="filters.limit" (selectionChange)="onFiltersChange.emit(filters)">
                <mat-option [value]="5">5</mat-option>
                <mat-option [value]="10">10</mat-option>
                <mat-option [value]="25">25</mat-option>
                <mat-option [value]="50">50</mat-option>
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
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 300px;
      flex: 1;
    }

    .filter-options {
      display: flex;
      gap: 16px;
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
    }
  `]
})
export class ChannelsFiltersComponent {
  @Input() filters: ChannelFilters = {
    searchTerm: '',
    groupId: '',
    channelType: 'all',
    isActive: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  };
  @Input() groups: Group[] = [];

  @Output() onFiltersChange = new EventEmitter<ChannelFilters>();

  // Expose ChannelType enum to template
  ChannelType = ChannelType;

  constructor() { }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      groupId: '',
      channelType: 'all',
      isActive: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 10
    };
    this.onFiltersChange.emit(this.filters);
  }
}
