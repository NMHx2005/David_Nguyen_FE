import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';
import { User, UserRole } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { Channel, ChannelType } from '../../models/channel.model';

@Component({
  selector: 'app-create-channel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Create New Channel</h2>
    <mat-dialog-content>
      <form [formGroup]="channelForm" (ngSubmit)="createChannel()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Channel Name</mat-label>
          <input matInput formControlName="name" required minlength="3" maxlength="30">
          <mat-error *ngIf="channelForm.get('name')?.hasError('required')">
            Channel name is required
          </mat-error>
          <mat-error *ngIf="channelForm.get('name')?.hasError('minlength')">
            Channel name must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Group</mat-label>
          <mat-select formControlName="groupId" required>
            <mat-option value="">Select Group</mat-option>
            <mat-option *ngFor="let group of data.groups" [value]="group.id">
              {{ group.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="channelForm.get('groupId')?.hasError('required')">
            Group is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Channel Type</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="">Select Type</mat-option>
            <mat-option value="TEXT">Text Channel</mat-option>
            <mat-option value="VOICE">Voice Channel</mat-option>
            <mat-option value="VIDEO">Video Channel</mat-option>
          </mat-select>
          <mat-error *ngIf="channelForm.get('type')?.hasError('required')">
            Channel type is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" maxlength="200"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Max Members</mat-label>
          <input matInput type="number" formControlName="maxMembers" min="1" max="1000">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="createChannel()" [disabled]="!channelForm.valid">
        Create Channel
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class CreateChannelDialogComponent {
  channelForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      groups: Group[],
      onCreate: (channel: Partial<Channel>) => void
    }
  ) {
    this.channelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      groupId: ['', Validators.required],
      type: ['TEXT', Validators.required],
      description: ['', Validators.maxLength(200)],
      maxMembers: [100, [Validators.min(1), Validators.max(1000)]]
    });
  }

  /**
   * Validate form and invoke parent callback to create a channel.
   */
  createChannel(): void {
    if (this.channelForm.valid) {
      this.data.onCreate(this.channelForm.value);
      this.dialogRef.close();
    }
  }
}

@Component({
  selector: 'app-ban-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Ban User from Channel</h2>
    <mat-dialog-content>
      <form [formGroup]="banForm" (ngSubmit)="banUser()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select User to Ban</mat-label>
          <mat-select formControlName="userId" required>
            <mat-option value="">Select User</mat-option>
            <mat-option *ngFor="let user of data.availableUsers" [value]="user.id">
              {{ user.username }} ({{ user.email }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="banForm.get('userId')?.hasError('required')">
            Please select a user to ban
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason for Ban</mat-label>
          <textarea matInput formControlName="reason" rows="3" maxlength="200" 
                    placeholder="Enter reason for banning this user..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="warn" (click)="banUser()" [disabled]="!banForm.valid">
        Ban User
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class BanUserDialogComponent {
  banForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BanUserDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      channel: Channel,
      availableUsers: User[],
      onBan: (userId: string, reason: string) => void
    }
  ) {
    this.banForm = this.fb.group({
      userId: ['', Validators.required],
      reason: ['', Validators.maxLength(200)]
    });
  }

  /**
   * Validate form and invoke parent callback to ban a user from channel.
   */
  banUser(): void {
    if (this.banForm.valid) {
      this.data.onBan(this.banForm.value.userId, this.banForm.value.reason);
      this.dialogRef.close();
    }
  }
}

@Component({
  selector: 'app-manage-channels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout [pageTitle]="'Manage Channels'">
      <div class="manage-channels-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Manage Channels</h1>
              <p>Create, edit, and manage channels across all groups</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/admin">
                <mat-icon>arrow_back</mat-icon>
                Back to Admin
              </button>
              <button mat-raised-button color="primary" (click)="openCreateChannelDialog()" 
                      [disabled]="!canCreateChannel()">
                <mat-icon>add</mat-icon>
                Create Channel
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Statistics Grid -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">chat</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getTotalChannelsCount() }}</h3>
                <p>Total Channels</p>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">textsms</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getTextChannelsCount() }}</h3>
                <p>Text Channels</p>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">record_voice_over</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getVoiceChannelsCount() }}</h3>
                <p>Voice Channels</p>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon-container">
                <mat-icon class="stat-icon">videocam</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ getVideoChannelsCount() }}</h3>
                <p>Video Channels</p>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Search and Filter Section -->
        <mat-card class="search-section-card">
          <mat-card-content>
            <div class="search-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search channels</mat-label>
                <input matInput
                       [(ngModel)]="searchTerm"
                       placeholder="Search by name or description..."
                       (input)="filterChannels()">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <div class="filter-options">
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Group</mat-label>
                  <mat-select [(ngModel)]="groupFilter" (selectionChange)="filterChannels()">
                    <mat-option value="">All Groups</mat-option>
                    <mat-option *ngFor="let group of groups" [value]="group.id">
                      {{ group.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Type</mat-label>
                  <mat-select [(ngModel)]="typeFilter" (selectionChange)="filterChannels()">
                    <mat-option value="">All Types</mat-option>
                    <mat-option value="TEXT">Text</mat-option>
                    <mat-option value="VOICE">Voice</mat-option>
                    <mat-option value="VIDEO">Video</mat-option>
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

        <!-- Channels Table -->
        <mat-card class="channels-table-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>chat</mat-icon>
              Channels List
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="filteredChannels" class="channels-table">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Channel Name</th>
                  <td mat-cell *matCellDef="let channel">
                    <div class="channel-info">
                      <strong>{{ channel.name }}</strong>
                      <small>{{ channel.description }}</small>
                    </div>
                  </td>
                </ng-container>

                <!-- Group Column -->
                <ng-container matColumnDef="group">
                  <th mat-header-cell *matHeaderCellDef>Group</th>
                  <td mat-cell *matCellDef="let channel">
                    {{ getGroupName(channel.groupId) }}
                  </td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let channel">
                    <mat-chip class="type-{{ channel.type.toLowerCase() }}">
                      {{ getTypeDisplayName(channel.type) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Members Column -->
                <ng-container matColumnDef="members">
                  <th mat-header-cell *matHeaderCellDef>Members</th>
                  <td mat-cell *matCellDef="let channel">
                    {{ channel.memberCount || channel.members.length }} / {{ channel.maxMembers }}
                  </td>
                </ng-container>

                <!-- Created By Column -->
                <ng-container matColumnDef="createdBy">
                  <th mat-header-cell *matHeaderCellDef>Created By</th>
                  <td mat-cell *matCellDef="let channel">
                    {{ getCreatorName(channel.createdBy) }}
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let channel">
                    {{ channel.createdAt | date:'shortDate' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let channel">
                    <div class="action-buttons">
                      <button mat-icon-button matTooltip="View Channel" (click)="viewChannel(channel)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      
                      <button mat-icon-button matTooltip="Edit Channel" 
                              (click)="editChannel(channel)"
                              [disabled]="!canEditChannel(channel)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      
                      <button mat-icon-button matTooltip="Ban User" 
                              (click)="openBanUserDialog(channel)"
                              [disabled]="!canBanUserFromChannel(channel)">
                        <mat-icon>block</mat-icon>
                      </button>
                      <button mat-icon-button matTooltip="Delete Channel" 
                              (click)="deleteChannel(channel)"
                              [disabled]="!canDeleteChannel(channel)"
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
            <div *ngIf="filteredChannels.length === 0" class="empty-state">
              <mat-icon class="empty-icon">chat_bubble_outline</mat-icon>
              <h3>No Channels Found</h3>
              <p>Try adjusting your search criteria or create a new channel.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .manage-channels-container {
      margin: 0 auto;
      padding: 24px;
    }

    .page-header-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

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

    .channels-table-card {
      margin-bottom: 24px;
    }

    .mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .channels-table {
      width: 100%;
    }

    .channels-table th.mat-header-cell {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    tr.mat-row:hover {
      background-color: #f5f5f5;
    }

    .channel-info {
      display: flex;
      flex-direction: column;
    }

    .channel-info small {
      color: #7f8c8d;
      font-size: 11px;
      margin-top: 2px;
    }

    .type-text {
      background: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .type-voice {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .type-video {
      background: #fce4ec !important;
      color: #c2185b !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .stat-icon-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon {
      font-size: 32px;
      color: white;
      width: 32px;
      height: 32px;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .stat-details p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
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
      .manage-channels-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ManageChannelsComponent implements OnInit {
  channels: Channel[] = [];
  filteredChannels: Channel[] = [];
  groups: Group[] = [];
  searchTerm = '';
  groupFilter = '';
  typeFilter = '';
  displayedColumns = ['name', 'group', 'type', 'members', 'createdBy', 'created', 'actions'];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Lifecycle: load current user, groups, channels, and apply initial filter.
   */
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadGroups();
    this.loadChannels();
    this.filterChannels();
  }

  /**
   * Load groups from localStorage for filtering and lookups.
   */
  loadGroups(): void {
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) {
      this.groups = JSON.parse(storedGroups);
    }
  }

  /**
   * Load channels from localStorage or initialize defaults when missing.
   */
  loadChannels(): void {
    const storedChannels = localStorage.getItem('channels');
    if (storedChannels) {
      this.channels = JSON.parse(storedChannels);
    } else {
      // Initialize with default channels if none exist
      this.initializeDefaultChannels();
    }
  }

  /**
   * Seed localStorage with a default set of channels for Phase 1.
   */
  initializeDefaultChannels(): void {
    this.channels = [
      {
        id: '1',
        name: 'general',
        description: 'General discussion channel',
        groupId: '1', // Development Team
        type: ChannelType.TEXT,
        createdBy: '1', // super admin
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        members: ['1', '2', '3'],
        bannedUsers: [],
        isActive: true,
        memberCount: 3,
        maxMembers: 50
      },
      {
        id: '2',
        name: 'frontend',
        description: 'Frontend development discussions',
        groupId: '1', // Development Team
        type: ChannelType.TEXT,
        createdBy: '1', // super admin
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
        members: ['1', '2'],
        bannedUsers: [],
        isActive: true,
        memberCount: 2,
        maxMembers: 30
      },
      {
        id: '3',
        name: 'ui-ux',
        description: 'UI/UX design discussions',
        groupId: '2', // Design Team
        type: ChannelType.TEXT,
        createdBy: '2', // group admin
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date(),
        members: ['2', '3'],
        bannedUsers: [],
        isActive: true,
        memberCount: 2,
        maxMembers: 25
      }
    ];
    localStorage.setItem('channels', JSON.stringify(this.channels));
  }

  /**
   * Apply search and filter criteria to channels list.
   */
  filterChannels(): void {
    this.filteredChannels = this.channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (channel.description && channel.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesGroup = !this.groupFilter || channel.groupId === this.groupFilter;
      const matchesType = !this.typeFilter || channel.type === this.typeFilter;
      return matchesSearch && matchesGroup && matchesType;
    });
  }

  /**
   * Map channel type enum to display name.
   */
  getTypeDisplayName(type: ChannelType): string {
    switch (type) {
      case ChannelType.TEXT: return 'Text';
      case ChannelType.VOICE: return 'Voice';
      case ChannelType.VIDEO: return 'Video';
      default: return 'Unknown';
    }
  }

  /**
   * Resolve group name by id.
   */
  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  }

  /**
   * Resolve creator username by id from stored users.
   */
  getCreatorName(creatorId: string): string {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const creator = users.find((u: User) => u.id === creatorId);
    return creator ? creator.username : 'Unknown';
  }

  // Business Logic: Permission checks
  /**
   * Check permission to create a channel for current user.
   */
  canCreateChannel(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(UserRole.SUPER_ADMIN) ||
      this.currentUser.roles.includes(UserRole.GROUP_ADMIN);
  }

  /**
   * Check permission to edit a channel.
   */
  canEditChannel(channel: Channel): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      // Check if user is admin of the group that contains this channel
      const group = this.groups.find(g => g.id === channel.groupId);
      return group ? group.createdBy === this.currentUser.id : false;
    }
    return false;
  }

  /**
   * Check permission to delete a channel.
   */
  canDeleteChannel(channel: Channel): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      // Check if user is admin of the group that contains this channel
      const group = this.groups.find(g => g.id === channel.groupId);
      return group ? group.createdBy === this.currentUser.id : false;
    }
    return false;
  }

  /**
   * Check permission to ban a user from a channel.
   */
  canBanUserFromChannel(channel: Channel): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
    if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
      // Check if user is admin of the group that contains this channel
      const group = this.groups.find(g => g.id === channel.groupId);
      return group ? group.createdBy === this.currentUser.id : false;
    }
    return false;
  }

  // CRUD Operations
  /**
   * Navigate to channel detail view (Phase 2 placeholder).
   */
  viewChannel(channel: Channel): void {
    this.router.navigate(['/admin/channels', channel.id]);
  }

  /**
   * Navigate to channel edit page.
   */
  editChannel(channel: Channel): void {
    this.router.navigate(['/admin/channels', channel.id, 'edit']);
  }

  /**
   * Delete a channel after validations, update storage, and notify user.
   */
  async deleteChannel(channel: Channel): Promise<void> {
    if (!confirm(`Are you sure you want to delete channel "${channel.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Check if channel has members
      if (channel.members.length > 0) {
        this.snackBar.open('Cannot delete channel with active members. Remove all members first.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Remove channel from group's channels array
      this.removeChannelFromGroup(channel.id, channel.groupId);

      // Delete the channel
      this.channels = this.channels.filter(c => c.id !== channel.id);
      this.updateChannels();
      this.filterChannels();

      this.snackBar.open(`Channel "${channel.name}" deleted successfully`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to delete channel. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Open dialog to create a new channel and handle its result.
   */
  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(CreateChannelDialogComponent, {
      width: '500px',
      data: {
        groups: this.groups,
        onCreate: (channelData: Partial<Channel>) => {
          const newChannel: Channel = {
            id: Date.now().toString(),
            name: channelData.name!,
            description: channelData.description || '',
            groupId: channelData.groupId!,
            type: channelData.type as ChannelType,
            createdBy: this.currentUser!.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            members: [this.currentUser!.id], // Creator becomes first member
            bannedUsers: [],
            isActive: true,
            memberCount: 1,
            maxMembers: channelData.maxMembers || 100
          };

          this.channels.push(newChannel);
          this.addChannelToGroup(newChannel.id, newChannel.groupId);
          this.updateChannels();
          this.filterChannels();

          this.snackBar.open(`Channel "${newChannel.name}" created successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      }
    });
  }

  /**
   * Open dialog to select and ban a user from the given channel.
   */
  openBanUserDialog(channel: Channel): void {
    // Get users who are members of this channel but not already banned
    const availableUsers = this.getChannelMembers(channel).filter(user =>
      !channel.bannedUsers.includes(user.id) && user.id !== this.currentUser!.id
    );

    if (availableUsers.length === 0) {
      this.snackBar.open('No users available to ban from this channel', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(BanUserDialogComponent, {
      width: '500px',
      data: {
        channel: channel,
        availableUsers: availableUsers,
        onBan: (userId: string, reason: string) => {
          this.banUserFromChannel(channel, userId, reason);
        }
      }
    });
  }

  /**
   * Execute banning logic: update channel membership and store report.
   */
  banUserFromChannel(channel: Channel, userId: string, reason: string): void {
    try {
      // Add user to banned list
      const channelIndex = this.channels.findIndex(c => c.id === channel.id);
      if (channelIndex > -1) {
        this.channels[channelIndex].bannedUsers.push(userId);
        this.channels[channelIndex].updatedAt = new Date();

        // Remove user from members list
        this.channels[channelIndex].members = this.channels[channelIndex].members.filter(id => id !== userId);
        this.channels[channelIndex].memberCount = this.channels[channelIndex].members.length;

        this.updateChannels();
        this.filterChannels();

        // Report to Super Admin (store in localStorage for now)
        this.reportToSuperAdmin(channel, userId, reason);

        this.snackBar.open(`User banned from channel "${channel.name}" successfully`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      this.snackBar.open('Failed to ban user. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Store a report for Super Admin review (Phase 1: localStorage only).
   */
  reportToSuperAdmin(channel: Channel, userId: string, reason: string): void {
    // Store report in localStorage for Super Admin to review
    const reports = JSON.parse(localStorage.getItem('adminReports') || '[]');
    const user = this.getUserById(userId);

    reports.push({
      id: Date.now().toString(),
      type: 'USER_BANNED_FROM_CHANNEL',
      channelId: channel.id,
      channelName: channel.name,
      userId: userId,
      username: user?.username || 'Unknown',
      reason: reason,
      reportedBy: this.currentUser!.id,
      reportedByUsername: this.currentUser!.username,
      reportedAt: new Date(),
      status: 'pending'
    });

    localStorage.setItem('adminReports', JSON.stringify(reports));
  }

  /**
   * Get channel members as User objects from storage.
   */
  getChannelMembers(channel: Channel): User[] {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter((user: User) => channel.members.includes(user.id));
  }

  /**
   * Lookup a user by id from storage.
   */
  getUserById(userId: string): User | null {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((user: User) => user.id === userId) || null;
  }

  // Helper methods
  /**
   * Remove a channel id from a group's channels list and persist.
   */
  removeChannelFromGroup(channelId: string, groupId: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      group.channels = group.channels.filter(c => c !== channelId);
      localStorage.setItem('groups', JSON.stringify(this.groups));
    }
  }

  /**
   * Add a channel id to a group's channels list if not present and persist.
   */
  addChannelToGroup(channelId: string, groupId: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      if (!group.channels.includes(channelId)) {
        group.channels.push(channelId);
        localStorage.setItem('groups', JSON.stringify(this.groups));
      }
    }
  }

  /**
   * Persist current channels array to localStorage.
   */
  updateChannels(): void {
    localStorage.setItem('channels', JSON.stringify(this.channels));
  }

  /**
   * Reset all filters and re-apply.
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.groupFilter = '';
    this.typeFilter = '';
    this.filterChannels();
  }

  // Statistics methods
  /**
   * Total channels count for stats.
   */
  getTotalChannelsCount(): number {
    return this.channels.length;
  }

  /**
   * Text channels count for stats.
   */
  getTextChannelsCount(): number {
    return this.channels.filter(channel => channel.type === ChannelType.TEXT).length;
  }

  /**
   * Voice channels count for stats.
   */
  getVoiceChannelsCount(): number {
    return this.channels.filter(channel => channel.type === ChannelType.VOICE).length;
  }

  /**
   * Video channels count for stats.
   */
  getVideoChannelsCount(): number {
    return this.channels.filter(channel => channel.type === ChannelType.VIDEO).length;
  }
}