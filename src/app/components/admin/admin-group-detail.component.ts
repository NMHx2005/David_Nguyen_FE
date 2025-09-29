import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';
import { Group, Channel, User, GroupStatus, ChannelType, UserRole } from '../../models';

@Component({
  selector: 'app-admin-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">{{ group?.name || 'Group Management' }}</h1>
            <p class="page-subtitle">Manage group settings, members, and channels</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" (click)="goBack()">
              <i class="material-icons">arrow_back</i>
              Back to Groups
            </button>
            <button class="btn btn-warning" (click)="editGroup()">
              <i class="material-icons">edit</i>
              Edit Group
            </button>
            <button class="btn btn-danger" (click)="deleteGroup()">
              <i class="material-icons">delete</i>
              Delete Group
            </button>
          </div>
        </div>
      </div>

      <!-- Group Content -->
      <div class="group-detail-content" *ngIf="group">
        <!-- Tabs Navigation -->
        <div class="tabs-nav">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'overview'"
            (click)="setActiveTab('overview')">
            <i class="material-icons">info</i>
            Overview
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'members'"
            (click)="setActiveTab('members')">
            <i class="material-icons">people</i>
            Members ({{ members.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'channels'"
            (click)="setActiveTab('channels')">
            <i class="material-icons">chat_bubble</i>
            Channels ({{ channels.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'settings'"
            (click)="setActiveTab('settings')">
            <i class="material-icons">settings</i>
            Settings
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div class="tab-panel" *ngIf="activeTab === 'overview'">
            <div class="overview-grid">
              <!-- Group Info Card -->
              <div class="info-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <i class="material-icons">info</i>
                    Group Information
                  </h2>
                  <div class="status-badge" [ngClass]="getStatusClass(group.status)">
                    {{ group.status }}
                  </div>
                </div>
                <div class="card-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Name:</label>
                      <span>{{ group.name }}</span>
                    </div>
                    <div class="info-item">
                      <label>Category:</label>
                      <span class="category-tag">{{ group.category }}</span>
                    </div>
                    <div class="info-item">
                      <label>Members:</label>
                      <span>{{ group.memberCount }} members</span>
                    </div>
                    <div class="info-item">
                      <label>Channels:</label>
                      <span>{{ group.channels?.length || 0 }} channels</span>
                    </div>
                    <div class="info-item">
                      <label>Created:</label>
                      <span>{{ formatDate(group.createdAt) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Last Updated:</label>
                      <span>{{ formatDate(group.updatedAt) }}</span>
                    </div>
                  </div>
                  <div class="description">
                    <label>Description:</label>
                    <p>{{ group.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="stats-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <i class="material-icons">analytics</i>
                    Quick Stats
                  </h2>
                </div>
                <div class="card-content">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value">{{ group.memberCount }}</div>
                      <div class="stat-label">Total Members</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ channels.length }}</div>
                      <div class="stat-label">Active Channels</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ getActiveMembers() }}</div>
                      <div class="stat-label">Active Members</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ getTotalMessages() }}</div>
                      <div class="stat-label">Total Messages</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Members Tab -->
          <div class="tab-panel" *ngIf="activeTab === 'members'">
            <div class="members-management">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="material-icons">people</i>
                  Member Management
                </h2>
                <div class="section-actions">
                  <button class="btn btn-primary" (click)="addMember()">
                    <i class="material-icons">person_add</i>
                    Add Member
                  </button>
                </div>
              </div>

              <!-- Search and Filter -->
              <div class="search-filter">
                <div class="search-box">
                  <i class="material-icons">search</i>
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    [(ngModel)]="memberSearchTerm"
                    (input)="filterMembers()">
                </div>
                <div class="filter-options">
                  <select [(ngModel)]="memberFilter" (change)="filterMembers()">
                    <option value="all">All Members</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>
              </div>

              <!-- Members Table -->
              <div class="members-table">
                <div class="table-header">
                  <div class="col-member">Member</div>
                  <div class="col-role">Role</div>
                  <div class="col-status">Status</div>
                  <div class="col-joined">Joined</div>
                  <div class="col-actions">Actions</div>
                </div>
                <div class="table-body">
                  <div class="table-row" *ngFor="let member of filteredMembers">
                    <div class="col-member">
                      <div class="member-info">
                        <img [src]="member.avatarUrl || '/assets/default-avatar.png'" [alt]="member.username" class="member-avatar">
                        <div class="member-details">
                          <div class="member-name">{{ member.username }}</div>
                          <div class="member-email">{{ member.email }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-role">
                      <span class="role-badge" *ngFor="let role of member.roles" [ngClass]="getRoleClass(role)">
                        {{ role }}
                      </span>
                    </div>
                    <div class="col-status">
                      <span class="status-indicator" [ngClass]="member.isActive ? 'active' : 'inactive'">
                        {{ member.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <div class="col-joined">
                      {{ formatDate(member.createdAt) }}
                    </div>
                    <div class="col-actions">
                      <button class="btn-icon" (click)="viewMember(member)" title="View Details">
                        <i class="material-icons">visibility</i>
                      </button>
                      <button class="btn-icon" (click)="editMember(member)" title="Edit">
                        <i class="material-icons">edit</i>
                      </button>
                      <button class="btn-icon btn-danger" (click)="removeMember(member)" title="Remove">
                        <i class="material-icons">person_remove</i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Channels Tab -->
          <div class="tab-panel" *ngIf="activeTab === 'channels'">
            <div class="channels-management">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="material-icons">chat_bubble</i>
                  Channel Management
                </h2>
                <div class="section-actions">
                  <button class="btn btn-primary" (click)="createChannel()">
                    <i class="material-icons">add</i>
                    Create Channel
                  </button>
                </div>
              </div>

              <!-- Channels Grid -->
              <div class="channels-grid">
                <div class="channel-card" *ngFor="let channel of channels">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h3 class="channel-name">{{ channel.name }}</h3>
                      <p class="channel-description">{{ channel.description || 'No description' }}</p>
                    </div>
                    <div class="channel-type" [ngClass]="getChannelTypeClass(channel.type)">
                      <i class="material-icons">{{ getChannelIcon(channel.type) }}</i>
                      {{ channel.type }}
                    </div>
                  </div>
                  <div class="channel-stats">
                    <span class="member-count">
                      <i class="material-icons">people</i>
                      {{ channel.memberCount || 0 }} members
                    </span>
                    <span class="last-activity">
                      <i class="material-icons">schedule</i>
                      {{ formatDate(channel.createdAt) }}
                    </span>
                  </div>
                  <div class="channel-actions">
                    <button class="btn btn-sm btn-primary" (click)="viewChannel(channel)">
                      <i class="material-icons">visibility</i>
                      View
                    </button>
                    <button class="btn btn-sm btn-warning" (click)="editChannel(channel)">
                      <i class="material-icons">edit</i>
                      Edit
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteChannel(channel)">
                      <i class="material-icons">delete</i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div class="tab-panel" *ngIf="activeTab === 'settings'">
            <div class="settings-management">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="material-icons">settings</i>
                  Group Settings
                </h2>
              </div>

              <div class="settings-form">
                <div class="form-group">
                  <label for="groupName">Group Name</label>
                  <input 
                    type="text" 
                    id="groupName" 
                    [(ngModel)]="group.name" 
                    class="form-control">
                </div>

                <div class="form-group">
                  <label for="groupDescription">Description</label>
                  <textarea 
                    id="groupDescription" 
                    [(ngModel)]="group.description" 
                    class="form-control" 
                    rows="3"></textarea>
                </div>

                <div class="form-group">
                  <label for="groupCategory">Category</label>
                  <select id="groupCategory" [(ngModel)]="group.category" class="form-control">
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="groupStatus">Status</label>
                  <select id="groupStatus" [(ngModel)]="group.status" class="form-control">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div class="form-actions">
                  <button class="btn btn-primary" (click)="saveSettings()">
                    <i class="material-icons">save</i>
                    Save Changes
                  </button>
                  <button class="btn btn-secondary" (click)="resetSettings()">
                    <i class="material-icons">refresh</i>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="!group">
        <div class="loading-spinner">
          <i class="material-icons">refresh</i>
        </div>
        <p>Loading group details...</p>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header-info {
      flex: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .btn-secondary:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-warning:hover {
      background: #e67e22;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .btn-icon {
      padding: 0.5rem;
      border: none;
      background: transparent;
      color: #6c757d;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .btn-icon:hover {
      background: #f8f9fa;
      color: #495057;
    }

    .btn-icon.btn-danger:hover {
      background: #f8d7da;
      color: #721c24;
    }

    .group-detail-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .tabs-nav {
      display: flex;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      color: #6c757d;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .tab-btn:hover {
      background: #e9ecef;
      color: #495057;
    }

    .tab-btn.active {
      background: white;
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }

    .tab-content {
      padding: 2rem;
    }

    .tab-panel {
      min-height: 400px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .info-card, .stats-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .card-header {
      background: white;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .card-content {
      padding: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .category-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
      display: inline-block;
      width: fit-content;
    }

    .description {
      margin-top: 1rem;
    }

    .description label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.9rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .description p {
      color: #495057;
      line-height: 1.6;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .section-actions {
      display: flex;
      gap: 1rem;
    }

    .search-filter {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-box {
      position: relative;
      flex: 1;
    }

    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    .filter-options select {
      padding: 0.75rem 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.95rem;
      min-width: 150px;
    }

    .members-table {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      font-weight: 600;
      color: #495057;
    }

    .table-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      align-items: center;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .member-details {
      flex: 1;
    }

    .member-name {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .member-email {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .role-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-right: 0.25rem;
    }

    .role-badge.user {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.group_admin {
      background: #fff3e0;
      color: #f57c00;
    }

    .role-badge.super_admin {
      background: #ffebee;
      color: #d32f2f;
    }

    .status-indicator {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-indicator.active {
      background: #d4edda;
      color: #155724;
    }

    .status-indicator.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .channel-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .channel-card:hover {
      background: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .channel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .channel-info {
      flex: 1;
    }

    .channel-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
    }

    .channel-description {
      color: #6c757d;
      margin: 0;
      font-size: 0.9rem;
    }

    .channel-type {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .channel-type.text {
      background: #e3f2fd;
      color: #1976d2;
    }

    .channel-type.voice {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .channel-type.video {
      background: #e8f5e8;
      color: #388e3c;
    }

    .channel-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .channel-stats span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .channel-actions {
      display: flex;
      gap: 0.5rem;
    }

    .settings-form {
      max-width: 600px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .loading-spinner {
      margin-bottom: 1rem;
    }

    .loading-spinner i {
      font-size: 2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .tabs-nav {
        flex-wrap: wrap;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .channels-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminGroupDetailComponent implements OnInit {
  group: Group | null = null;
  channels: Channel[] = [];
  members: User[] = [];
  filteredMembers: User[] = [];
  activeTab = 'overview';
  groupId: string = '';
  memberSearchTerm = '';
  memberFilter = 'all';
  newMember: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /**
   * Lifecycle hook: subscribe to route params and load group details.
   */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      if (this.groupId) {
        this.loadGroupDetails();
      }
    });
  }

  /**
   * Load group, channels, and members information (Phase 1 mock data).
   */
  loadGroupDetails(): void {
    // Mock data - replace with actual API call
    this.group = {
      id: this.groupId,
      name: 'Web Development Team',
      description: 'A group for web developers to collaborate and share knowledge about modern web technologies.',
      category: 'Technology',
      isActive: true, // Thêm trường isActive để fix lỗi thiếu property
      status: GroupStatus.ACTIVE,
      memberCount: 15,
      channels: [],
      members: ['user1', 'user2', 'user3'],
      admins: ['admin1'],
      createdBy: 'admin1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    };

    this.channels = [
      {
        id: 'channel1',
        name: 'general',
        description: 'General discussions and announcements',
        groupId: this.groupId,
        type: ChannelType.TEXT,
        memberCount: 15,
        members: ['user1', 'user2', 'user3'],
        bannedUsers: [],
        createdBy: 'admin1',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'channel2',
        name: 'frontend',
        description: 'Frontend development discussions',
        groupId: this.groupId,
        type: ChannelType.TEXT,
        memberCount: 8,
        members: ['user1', 'user2'],
        bannedUsers: [],
        createdBy: 'admin1',
        isActive: true,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-19')
      }
    ];

    this.members = [
      {
        id: 'user1',
        username: 'john_doe',
        email: 'john@example.com',
        roles: [UserRole.USER],
        groups: [this.groupId],
        avatarUrl: '/assets/avatars/user1.jpg',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'user2',
        username: 'jane_smith',
        email: 'jane@example.com',
        roles: [UserRole.USER],
        groups: [this.groupId],
        avatarUrl: '/assets/avatars/user2.jpg',
        isActive: true,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-19')
      },
      {
        id: 'admin1',
        username: 'admin_user',
        email: 'admin@example.com',
        roles: [UserRole.GROUP_ADMIN],
        groups: [this.groupId],
        avatarUrl: '/assets/avatars/admin1.jpg',
        isActive: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    this.filteredMembers = [...this.members];
  }

  /**
   * Set the active tab for the group detail view.
   * @param tab Tab id: 'overview' | 'members' | 'channels' | 'settings'
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Navigate back to the admin groups list.
   */
  goBack(): void {
    this.router.navigate(['/admin/groups']);
  }

  /**
   * Open edit group UI (stub for Phase 2 implementation).
   */
  editGroup(): void {
    alert('Edit group functionality - to be implemented');
  }

  /**
   * Confirm and delete the current group (stub for Phase 2).
   */
  deleteGroup(): void {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      alert('Delete group functionality - to be implemented');
    }
  }

  /**
   * Add member to group by username
   */
  addMember(): void {
    if (!this.newMember || !this.newMember.trim()) {
      alert('Please enter a username');
      return;
    }

    const username = this.newMember.trim();

    // Get all users from localStorage
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userToAdd = allUsers.find(u => u.username === username);

    if (!userToAdd) {
      alert(`User "${username}" not found`);
      return;
    }

    if (!this.group) {
      alert('Group not found');
      return;
    }

    // Check if user is already a member
    if (this.group.members.includes(userToAdd.id)) {
      alert(`User "${username}" is already a member of this group`);
      return;
    }

    // Add user to group
    this.group.members.push(userToAdd.id);
    this.group.updatedAt = new Date();

    // Update user's groups
    if (!userToAdd.groups.includes(this.group.id)) {
      userToAdd.groups.push(this.group.id);
      userToAdd.updatedAt = new Date();
    }

    // Save to localStorage
    const groups: Group[] = JSON.parse(localStorage.getItem('groups') || '[]');
    const groupIndex = groups.findIndex(g => g.id === this.group!.id);
    if (groupIndex > -1) {
      groups[groupIndex] = this.group;
      localStorage.setItem('groups', JSON.stringify(groups));
    }

    const userIndex = allUsers.findIndex(u => u.id === userToAdd.id);
    if (userIndex > -1) {
      allUsers[userIndex] = userToAdd;
      localStorage.setItem('users', JSON.stringify(allUsers));
    }

    // Update local members list
    this.members.push(userToAdd);
    this.filteredMembers = [...this.members];

    // Clear input
    this.newMember = '';

    alert(`User "${username}" added to group successfully`);
  }

  /**
   * View details for a specific member.
   * @param member User to view.
   */
  viewMember(member: User): void {
    alert(`View member: ${member.username}`);
  }

  /**
   * Edit a member's attributes or roles.
   * @param member User to edit.
   */
  editMember(member: User): void {
    alert(`Edit member: ${member.username}`);
  }

  /**
   * Remove a member from the group after confirmation.
   * @param member User to remove.
   */
  removeMember(member: User): void {
    if (confirm(`Are you sure you want to remove ${member.username} from this group?`)) {
      alert(`Remove member: ${member.username}`);
    }
  }

  /**
   * Create a new channel within the group (stub for Phase 2).
   */
  createChannel(): void {
    alert('Create channel functionality - to be implemented');
  }

  /**
   * View channel details.
   * @param channel Channel to view.
   */
  viewChannel(channel: Channel): void {
    alert(`View channel: ${channel.name}`);
  }

  /**
   * Edit channel metadata.
   * @param channel Channel to edit.
   */
  editChannel(channel: Channel): void {
    alert(`Edit channel: ${channel.name}`);
  }

  /**
   * Delete a channel after confirmation.
   * @param channel Channel to delete.
   */
  deleteChannel(channel: Channel): void {
    if (confirm(`Are you sure you want to delete the channel "${channel.name}"?`)) {
      alert(`Delete channel: ${channel.name}`);
    }
  }

  /**
   * Save group settings (stub for Phase 2).
   */
  saveSettings(): void {
    alert('Save settings functionality - to be implemented');
  }

  /**
   * Reset settings form to the latest persisted state (mock reload).
   */
  resetSettings(): void {
    this.loadGroupDetails();
  }

  /**
   * Filter members by search term and selected filter option.
   */
  filterMembers(): void {
    this.filteredMembers = this.members.filter(member => {
      const matchesSearch = member.username.toLowerCase().includes(this.memberSearchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(this.memberSearchTerm.toLowerCase());

      const matchesFilter = this.memberFilter === 'all' ||
        (this.memberFilter === 'active' && member.isActive) ||
        (this.memberFilter === 'inactive' && !member.isActive) ||
        (this.memberFilter === 'admin' && member.roles.some(role => role.includes('admin')));

      return matchesSearch && matchesFilter;
    });
  }

  /**
   * Count active members in the group.
   * @returns Number of active members.
   */
  getActiveMembers(): number {
    return this.members.filter(member => member.isActive).length;
  }

  /**
   * Get total messages metric (mocked for Phase 1).
   * @returns Total messages count.
   */
  getTotalMessages(): number {
    // Mock calculation - replace with actual API call
    return 1250;
  }

  /**
   * Convert group status to CSS class name.
   * @param status GroupStatus enum value.
   */
  getStatusClass(status: GroupStatus): string {
    return status.toLowerCase();
  }

  /**
   * Convert channel type to CSS class name.
   * @param type ChannelType enum value.
   */
  getChannelTypeClass(type: ChannelType): string {
    return type.toLowerCase();
  }

  /**
   * Resolve a Material icon name by channel type.
   * @param type ChannelType enum value.
   * @returns Icon name string.
   */
  getChannelIcon(type: ChannelType): string {
    switch (type) {
      case ChannelType.TEXT: return 'chat';
      case ChannelType.VOICE: return 'mic';
      case ChannelType.VIDEO: return 'videocam';
      default: return 'chat';
    }
  }

  /**
   * Convert role enum to a kebab-case CSS class.
   * @param role UserRole enum value.
   */
  getRoleClass(role: UserRole): string {
    return role.toLowerCase().replace('_', '-');
  }

  /**
   * Format a Date for display in en-US short form.
   * @param date Date to format.
   * @returns Localized date string.
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
