import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Group, GroupStatus } from '../../../../models/group.model';

@Component({
  selector: 'app-groups-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="groups" class="groups-table">
        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Group Name</th>
          <td mat-cell *matCellDef="let group">
            <div class="group-info">
              <strong>{{ group.name }}</strong>
              <small>{{ group.description }}</small>
            </div>
          </td>
        </ng-container>

        <!-- Category Column -->
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let group">
            <mat-chip class="category-chip">
              {{ getCategoryDisplayName(group.category) }}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let group">
            <mat-chip class="status-{{ group.status.toLowerCase() }}">
              {{ getStatusDisplayName(group.status) }}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Members Column -->
        <ng-container matColumnDef="members">
          <th mat-header-cell *matHeaderCellDef>Members</th>
          <td mat-cell *matCellDef="let group">
            {{ group.members?.length || 0 }} / {{ group.maxMembers }}
          </td>
        </ng-container>

        <!-- Channels Column -->
        <ng-container matColumnDef="channels">
          <th mat-header-cell *matHeaderCellDef>Channels</th>
          <td mat-cell *matCellDef="let group">
            {{ group.channels?.length || 0 }}
          </td>
        </ng-container>

        <!-- Created Date Column -->
        <ng-container matColumnDef="created">
          <th mat-header-cell *matHeaderCellDef>Created</th>
          <td mat-cell *matCellDef="let group">
            {{ group.createdAt | date:'shortDate' }}
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let group">
            <div class="action-buttons">
              <button mat-icon-button matTooltip="View Group" (click)="viewGroup.emit(group)">
                <mat-icon>visibility</mat-icon>
              </button>
              
              <button mat-icon-button matTooltip="Edit Group" 
                      (click)="editGroup.emit(group)"
                      [disabled]="!canEditGroup(group)">
                <mat-icon>edit</mat-icon>
              </button>
              
              <button mat-icon-button matTooltip="Delete Group" 
                      (click)="deleteGroup.emit(group)"
                      [disabled]="!canDeleteGroup(group)"
                      class="delete-action">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>

    <!-- Empty State -->
    <div *ngIf="groups.length === 0" class="empty-state">
      <mat-icon class="empty-icon">group_work</mat-icon>
      <h3>No Groups Found</h3>
      <p>Try adjusting your search criteria or create a new group.</p>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
    }

    .groups-table {
      width: 100%;
    }

    .groups-table th.mat-header-cell {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tr.mat-row:hover {
      background-color: #f5f5f5;
    }

    .group-info {
      display: flex;
      flex-direction: column;
    }

    .group-info small {
      color: #7f8c8d;
      font-size: 11px;
      margin-top: 2px;
    }

    .category-chip {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .status-active {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-inactive {
      background: #ffebee !important;
      color: #c62828 !important;
    }

    .status-pending {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .delete-action {
      color: #e74c3c !important;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .empty-state p {
      margin: 0;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class GroupsTableComponent {
  @Input() groups: Group[] = [];
  @Input() canEditGroup: (group: Group) => boolean = () => false;
  @Input() canDeleteGroup: (group: Group) => boolean = () => false;

  @Output() viewGroup = new EventEmitter<Group>();
  @Output() editGroup = new EventEmitter<Group>();
  @Output() deleteGroup = new EventEmitter<Group>();

  displayedColumns: string[] = ['name', 'category', 'status', 'members', 'channels', 'created', 'actions'];

  getCategoryDisplayName(category: string): string {
    const categories: { [key: string]: string } = {
      'technology': 'Technology',
      'business': 'Business',
      'education': 'Education',
      'entertainment': 'Entertainment',
      'design': 'Design',
      'other': 'Other'
    };
    return categories[category] || category;
  }

  getStatusDisplayName(status: GroupStatus): string {
    const statuses: { [key: string]: string } = {
      [GroupStatus.ACTIVE]: 'Active',
      [GroupStatus.INACTIVE]: 'Inactive',
      [GroupStatus.PENDING]: 'Pending'
    };
    return statuses[status] || status;
  }
}
