import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { User, UserRole, Group } from '../../../../models';

/**
 * Pure UI Component - Group Members
 * Manages group members with no business logic
 */
@Component({
  selector: 'app-group-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="members-section">
      <!-- Search and Filter -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-controls">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search members</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (input)="onSearchChange.emit($event.target.value)"
                     placeholder="Search by username or email...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onFilterChange.emit($event.value)">
                <mat-option value="">All Members</mat-option>
                <mat-option value="active">Active Only</mat-option>
                <mat-option value="inactive">Inactive Only</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="onClearFilters.emit()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Add Member Form -->
      <mat-card class="add-member-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_add</mat-icon>
            Add New Member
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="add-member-form">
            <mat-form-field appearance="outline" class="username-field">
              <mat-label>Username or Email</mat-label>
              <input matInput 
                     [(ngModel)]="newMember" 
                     placeholder="Enter username or email...">
            </mat-form-field>
            <button mat-raised-button 
                    color="primary" 
                    (click)="onAddMember.emit(newMember)"
                    [disabled]="!newMember.trim()">
              <mat-icon>add</mat-icon>
              Add Member
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Members List -->
      <mat-card class="members-list-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Members ({{ filteredMembers.length || 0 }})
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="members-list" *ngIf="(filteredMembers.length || 0) > 0; else noMembers">
            <mat-list>
              <mat-list-item *ngFor="let member of filteredMembers" class="member-item">
                <mat-icon matListItemAvatar>person</mat-icon>
                <div matListItemTitle class="member-name">{{ member.username }}</div>
                <div matListItemLine class="member-email">{{ member.email }}</div>
                <div matListItemLine class="member-roles">
                  <mat-chip-set>
                    <mat-chip *ngFor="let role of member.roles" 
                              [ngClass]="getRoleClass(role)">
                      {{ getRoleDisplayName(role) }}
                    </mat-chip>
                    <mat-chip [ngClass]="member.isActive ? 'status-active' : 'status-inactive'">
                      {{ member.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
                <button mat-icon-button 
                        color="warn" 
                        (click)="onRemoveMember.emit(member.id)"
                        [disabled]="!canRemoveMember || !member.canRemove"
                        matTooltip="Remove member">
                  <mat-icon>person_remove</mat-icon>
                </button>
              </mat-list-item>
            </mat-list>
          </div>

          <ng-template #noMembers>
            <div class="no-members">
              <mat-icon>people_outline</mat-icon>
              <p>No members found</p>
              <p class="no-members-subtitle">Try adjusting your search or add new members</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .members-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .search-card, .add-member-card, .members-list-card {
      margin-bottom: 0;
    }

    .search-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .filter-field {
      min-width: 150px;
    }

    .add-member-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .username-field {
      flex: 1;
      min-width: 300px;
    }

    .members-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .member-item {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 0;
    }

    .member-item:last-child {
      border-bottom: none;
    }

    .member-name {
      font-weight: 500;
      color: #333;
    }

    .member-email {
      color: #666;
      font-size: 0.9rem;
    }

    .member-roles {
      margin-top: 8px;
    }

    .member-roles mat-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .role-super-admin {
      background: #ffebee !important;
      color: #c62828 !important;
    }

    .role-group-admin {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .role-user {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-active {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-inactive {
      background: #ffebee !important;
      color: #c62828 !important;
    }

    .no-members {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-members mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-members p {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
    }

    .no-members-subtitle {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .search-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field, .username-field {
        min-width: auto;
      }

      .add-member-form {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class GroupMembersComponent {
  @Input() members: User[] = [];
  @Input() filteredMembers: User[] = [];
  @Input() canRemoveMember: boolean = true;
  @Input() newMember: string = '';
  @Input() searchTerm: string = '';
  @Input() statusFilter: string = '';

  @Output() onAddMember = new EventEmitter<string>();
  @Output() onRemoveMember = new EventEmitter<string>();
  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onFilterChange = new EventEmitter<string>();
  @Output() onClearFilters = new EventEmitter<void>();

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'role-super-admin';
      case UserRole.GROUP_ADMIN:
        return 'role-group-admin';
      case UserRole.USER:
        return 'role-user';
      default:
        return 'role-user';
    }
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.GROUP_ADMIN:
        return 'Group Admin';
      case UserRole.USER:
        return 'User';
      default:
        return 'User';
    }
  }
}