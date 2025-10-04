import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { ClientChannelFilters } from '../../../../models/channel.model';

@Component({
  selector: 'app-channels-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  template: `
    <div class="search-section">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search channels</mat-label>
        <input matInput 
               [(ngModel)]="filters.searchTerm" 
               (ngModelChange)="onFiltersChange()" 
               placeholder="Type to search...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      
      <div class="filter-chips">
        <mat-chip-listbox [(ngModel)]="filters.channelType" (ngModelChange)="onFiltersChange()">
          <mat-chip-option value="">All Types</mat-chip-option>
          <mat-chip-option value="text">Text</mat-chip-option>
          <mat-chip-option value="voice">Voice</mat-chip-option>
          <mat-chip-option value="video">Video</mat-chip-option>
        </mat-chip-listbox>
      </div>
    </div>
  `,
  styles: [`
    .search-section {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 300px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
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
export class ChannelsSearchComponent {
  @Input() filters: ClientChannelFilters = {
    searchTerm: '',
    groupId: '',
    channelType: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  };

  @Output() filtersChange = new EventEmitter<ClientChannelFilters>();

  onFiltersChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }
}
