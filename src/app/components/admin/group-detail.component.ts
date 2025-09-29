import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';
import { FormsModule } from '@angular/forms';
import { Group, GroupStatus } from '../../models/group.model';
import { Channel, ChannelType } from '../../models/channel.model';

@Component({
  selector: 'app-admin-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    AdminLayoutComponent
  ],
  template: `
    <app-admin-layout [pageTitle]="group?.name || 'Group Detail'">
      <div class="group-detail-container" *ngIf="group; else notFound">
        <mat-card class="header-card">
          <div class="header">
            <div class="header-left">
              <mat-icon class="group-avatar">group_work</mat-icon>
              <div class="title">
                <h1>{{ group.name }}</h1>
                <p>{{ group.description || 'No description' }}</p>
              </div>
            </div>
            <div class="header-actions">
              <mat-chip [ngClass]="'status-' + group.status">{{ getStatusLabel(group.status) }}</mat-chip>
              <button mat-stroked-button color="primary" [routerLink]="['/admin/groups', group.id, 'channels']">
                <mat-icon>forum</mat-icon>
                Manage Channels
              </button>
              <button mat-stroked-button color="primary" [routerLink]="['/admin/groups']">
                <mat-icon>arrow_back</mat-icon>
                Back to Groups
              </button>
            </div>
          </div>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>category</mat-icon>
                <div>
                  <label>Category</label>
                  <div class="value">{{ group.category | titlecase }}</div>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <label>Created</label>
                  <div class="value">{{ group.createdAt | date:'mediumDate' }}</div>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>supervisor_account</mat-icon>
                <div>
                  <label>Members</label>
                  <div class="value">{{ group.memberCount || group.members.length || 0 }}</div>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>chat</mat-icon>
                <div>
                  <label>Channels</label>
                  <div class="value">{{ channels.length }}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-tab-group>
          <mat-tab label="Overview">
            <div class="section">
              <h3>Recent Channels</h3>
              <div class="channels-list">
                <mat-card *ngFor="let ch of channels | slice:0:6" class="channel-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar>{{ getChannelIcon(ch.type) }}</mat-icon>
                    <mat-card-title># {{ ch.name }}</mat-card-title>
                    <mat-card-subtitle>{{ ch.description || 'No description' }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-chip-set>
                      <mat-chip>{{ ch.type | titlecase }}</mat-chip>
                      <mat-chip>Members: {{ ch.memberCount || ch.members.length || 0 }}</mat-chip>
                    </mat-chip-set>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button color="primary" [routerLink]="['/group', group.id, 'channel', ch.id]">
                      <mat-icon>chat</mat-icon>
                      Open Chat
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Members">
            <div class="section">
              <h3>Members ({{ group.members.length }})</h3>
              <mat-list>
                <mat-list-item *ngFor="let m of group.members">
                  <mat-icon matListItemAvatar>person</mat-icon>
                  <div matListItemTitle>{{ m }}</div>
                  <button mat-icon-button color="warn" (click)="removeMember(m)" matTooltip="Remove member">
                    <mat-icon>person_remove</mat-icon>
                  </button>
                </mat-list-item>
              </mat-list>
              <mat-divider></mat-divider>
              <div class="inline-form">
                <mat-form-field appearance="outline" class="grow">
                  <mat-label>Add member by username</mat-label>
                  <input matInput [(ngModel)]="newMember" placeholder="username">
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="addMember()">
                  <mat-icon>person_add</mat-icon>
                  Add Member
                </button>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Channels">
            <div class="section">
              <h3>Channels ({{ channels.length }})</h3>
              <mat-list>
                <mat-list-item *ngFor="let ch of channels">
                  <mat-icon matListItemAvatar>{{ getChannelIcon(ch.type) }}</mat-icon>
                  <div matListItemTitle># {{ ch.name }}</div>
                  <div matListItemLine>{{ ch.description || 'No description' }}</div>
                  <button mat-button color="primary" [routerLink]="['/admin/groups', group.id, 'channels']">Manage</button>
                </mat-list-item>
              </mat-list>
              <mat-divider></mat-divider>
              <form [formGroup]="channelForm" (ngSubmit)="createChannel()" class="channel-form">
                <mat-form-field appearance="outline" class="grow">
                  <mat-label>Channel name</mat-label>
                  <input matInput formControlName="name" required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="type" required>
                    <mat-option [value]="ChannelType.TEXT">Text</mat-option>
                    <mat-option [value]="ChannelType.VOICE">Voice</mat-option>
                    <mat-option [value]="ChannelType.VIDEO">Video</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="grow">
                  <mat-label>Description</mat-label>
                  <input matInput formControlName="description">
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit" [disabled]="channelForm.invalid">
                  <mat-icon>add</mat-icon>
                  Create Channel
                </button>
              </form>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <ng-template #notFound>
        <mat-card><mat-card-content>Group not found.</mat-card-content></mat-card>
      </ng-template>
    </app-admin-layout>
  `,
  styles: [`
    .group-detail-container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .header-card { margin-bottom: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .group-avatar { font-size: 40px; width: 40px; height: 40px; color: #667eea; }
    .title h1 { margin: 0; font-weight: 500; }
    .title p { margin: 4px 0 0 0; color: #666; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .status-active { background: #e8f5e8 !important; color: #2e7d32 !important; }
    .status-inactive { background: #ffebee !important; color: #c62828 !important; }
    .status-pending { background: #fff3e0 !important; color: #f57c00 !important; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .info-item { display: flex; align-items: center; gap: 12px; }
    .info-item mat-icon { color: #667eea; }
    .info-item label { display: block; font-size: .8rem; color: #888; }
    .info-item .value { font-weight: 500; color: #333; }
    .section { padding: 16px 0; }
    .channels-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .inline-form { display: flex; gap: 12px; align-items: center; margin-top: 12px; }
    .channel-form { display: grid; grid-template-columns: 1fr 200px 1fr auto; gap: 12px; align-items: center; margin-top: 12px; }
    .grow { flex: 1 1 auto; }
  `]
})
export class AdminGroupDetailComponent implements OnInit {
  group: Group | null = null;
  channels: Channel[] = [];
  newMember: string = '';
  channelForm!: FormGroup;
  ChannelType = ChannelType;

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder) { }

  /**
   * Lifecycle: load group and its channels from localStorage; init channel form.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('groupId');
    const groups: Group[] = JSON.parse(localStorage.getItem('groups') || '[]');
    this.group = groups.find(g => g.id === id) || null;
    const allChannels: Channel[] = JSON.parse(localStorage.getItem('channels') || '[]');
    this.channels = allChannels.filter(c => c.groupId === id);

    this.channelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: [ChannelType.TEXT, Validators.required],
      description: ['']
    });
  }

  /**
   * Map GroupStatus enum to readable label.
   */
  getStatusLabel(status: GroupStatus): string {
    switch (status) {
      case GroupStatus.ACTIVE: return 'Active';
      case GroupStatus.INACTIVE: return 'Inactive';
      case GroupStatus.PENDING: return 'Pending';
      default: return 'Unknown';
    }
  }

  /**
   * Resolve Material icon by ChannelType.
   */
  getChannelIcon(type: ChannelType): string {
    switch (type) {
      case ChannelType.TEXT: return 'chat';
      case ChannelType.VOICE: return 'mic';
      case ChannelType.VIDEO: return 'videocam';
      default: return 'forum';
    }
  }

  /**
   * Add a member by username to the group and persist changes.
   */
  addMember(): void {
    const username = (this.newMember || '').trim();
    if (!username || !this.group) return;
    if (!this.group.members.includes(username)) {
      this.group.members.push(username);
      this.group.memberCount = (this.group.memberCount || 0) + 1;
      this.persist();
    }
    this.newMember = '';
  }

  /**
   * Remove a member from the group and persist changes.
   */
  removeMember(username: string): void {
    if (!this.group) return;
    this.group.members = this.group.members.filter(m => m !== username);
    this.group.memberCount = Math.max(0, (this.group.memberCount || 0) - 1);
    this.persist();
  }

  /**
   * Create a new channel from the form inputs; update storage and UI.
   */
  createChannel(): void {
    if (!this.group || this.channelForm.invalid) return;
    const values = this.channelForm.value;
    const newCh: Channel = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description || '',
      groupId: this.group.id,
      type: values.type,
      createdBy: 'admin',
      members: [],
      bannedUsers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      memberCount: 0,
      maxMembers: 100
    };
    this.channels.unshift(newCh);
    const all = JSON.parse(localStorage.getItem('channels') || '[]');
    all.push(newCh);
    localStorage.setItem('channels', JSON.stringify(all));
    this.channelForm.reset({ name: '', type: ChannelType.TEXT, description: '' });
  }

  /**
   * Persist the current group to localStorage.
   */
  private persist(): void {
    if (!this.group) return;
    const groups: Group[] = JSON.parse(localStorage.getItem('groups') || '[]');
    const idx = groups.findIndex(g => g.id === this.group!.id);
    if (idx > -1) {
      groups[idx] = this.group!;
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }
}


