import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { ChannelsService, ClientChannelFilters } from './services/channels.service';
import { ChannelsHeaderComponent } from './ui/channels-header.component';
import { ChannelsSearchComponent } from './ui/channels-search.component';
import { ChannelsGridComponent } from './ui/channels-grid.component';
import { Channel } from '../../../models/channel.model';
import { Group } from '../../../models/group.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    ClientLayoutComponent,
    ChannelsHeaderComponent,
    ChannelsSearchComponent,
    ChannelsGridComponent
  ],
  template: `
    <app-client-layout 
      pageTitle="Channels" 
      pageDescription="Discover and join channels to connect with your team">
      
      <app-channels-header (resetData)="onResetData()"></app-channels-header>

      <app-channels-search 
        [filters]="filters" 
        (filtersChange)="onFiltersChange($event)">
      </app-channels-search>

      <app-channels-grid 
        [channels]="filteredChannels" 
        [groups]="groups" 
        [currentUser]="currentUser"
        (joinChannel)="onJoinChannel($event)">
      </app-channels-grid>

    </app-client-layout>
  `,
  styles: [``]
})
export class ChannelsComponent implements OnInit, OnDestroy {
  filteredChannels: Channel[] = [];
  groups: Group[] = [];
  currentUser: User | null = null;
  filters: ClientChannelFilters = { searchTerm: '', selectedType: '' };

  private destroy$ = new Subject<void>();

  constructor(
    private channelsService: ChannelsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.channelsService.setCurrentUser(this.currentUser);

    // Subscribe to filtered channels
    this.channelsService.filteredChannels$
      .pipe(takeUntil(this.destroy$))
      .subscribe(channels => {
        this.filteredChannels = channels;
      });

    // Subscribe to groups
    this.channelsService.groups$
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => {
        this.groups = groups;
      });

    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.channelsService.setCurrentUser(user);
      });

    console.log('🚀 ChannelsComponent initialized');
    console.log('👤 Current user from auth service:', this.currentUser);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFiltersChange(filters: ClientChannelFilters): void {
    this.filters = filters;
    this.channelsService.updateFilters(filters);
  }

  async onJoinChannel(channel: Channel): Promise<void> {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to join channels', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.channelsService.canJoinChannel(channel)) {
      this.snackBar.open('Cannot join this channel', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const success = await this.channelsService.joinChannel(channel);

      if (success) {
        this.snackBar.open(`Successfully joined "${channel.name}" channel!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.snackBar.open('Failed to join channel. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    } catch (error) {
      console.error('Join channel error:', error);
      this.snackBar.open('Failed to join channel. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onResetData(): void {
    this.channelsService.resetData();
    this.snackBar.open('Data reset successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}