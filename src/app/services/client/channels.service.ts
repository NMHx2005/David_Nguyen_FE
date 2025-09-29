import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Channel, ChannelType } from '../../models/channel.model';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';

export interface ClientChannelFilters {
    searchTerm: string;
    selectedType: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChannelsService {
    private channelsSubject = new BehaviorSubject<Channel[]>([]);
    private groupsSubject = new BehaviorSubject<Group[]>([]);
    private filtersSubject = new BehaviorSubject<ClientChannelFilters>({ searchTerm: '', selectedType: '' });
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public channels$ = this.channelsSubject.asObservable();
    public groups$ = this.groupsSubject.asObservable();
    public filters$ = this.filtersSubject.asObservable();
    public currentUser$ = this.currentUserSubject.asObservable();

    public filteredChannels$: Observable<Channel[]> = combineLatest([
        this.channels$,
        this.groups$,
        this.currentUser$,
        this.filters$
    ]).pipe(
        map(([channels, groups, currentUser, filters]) => {
            return this.filterChannels(channels, groups, currentUser, filters);
        })
    );

    constructor() {
        this.loadMockData();
    }

    setCurrentUser(user: User | null): void {
        this.currentUserSubject.next(user);
    }

    updateFilters(filters: ClientChannelFilters): void {
        this.filtersSubject.next(filters);
    }

    async joinChannel(channel: Channel): Promise<boolean> {
        const currentUser = this.currentUserSubject.value;
        if (!currentUser) {
            return false;
        }

        if (!this.canJoinChannel(channel)) {
            return false;
        }

        try {
            // Add user to channel members
            const channels = this.channelsSubject.value;
            const channelIndex = channels.findIndex(c => c.id === channel.id);

            if (channelIndex > -1) {
                // Ensure members array exists
                if (!channels[channelIndex].members) {
                    channels[channelIndex].members = [];
                }
                channels[channelIndex].members.push(currentUser.id);
                channels[channelIndex].memberCount = channels[channelIndex].members.length;
                channels[channelIndex].updatedAt = new Date();

                // Update the subject
                this.channelsSubject.next([...channels]);

                // Persist to localStorage
                this.updateChannelsInStorage(channels);

                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to join channel:', error);
            return false;
        }
    }

    canJoinChannel(channel: Channel): boolean {
        const currentUser = this.currentUserSubject.value;
        const groups = this.groupsSubject.value;

        if (!currentUser) return false;

        // Check if user is already a member
        if (this.isChannelMember(channel)) return false;

        // Check if user is banned from this channel
        if (Array.isArray(channel.bannedUsers) && channel.bannedUsers.includes(currentUser.id)) {
            return false;
        }

        // Check if user is a member of the group
        const group = groups.find(g => g.id === channel.groupId);
        if (!group || !Array.isArray(group.members) || !group.members.includes(currentUser.id)) {
            return false;
        }

        // Check if channel has reached max members
        if (channel.maxMembers && (channel.memberCount || 0) >= channel.maxMembers) {
            return false;
        }

        return true;
    }

    isChannelMember(channel: Channel): boolean {
        const currentUser = this.currentUserSubject.value;
        if (!currentUser) return false;
        return Array.isArray(channel.members) && channel.members.includes(currentUser.id);
    }

    getGroupName(groupId: string): string {
        const groups = this.groupsSubject.value;
        const group = groups.find(g => g.id === groupId);
        return group ? group.name : 'Unknown Group';
    }

    resetData(): void {
        localStorage.removeItem('groups');
        localStorage.removeItem('channels');
        this.loadMockData();
    }

    private filterChannels(channels: Channel[], groups: Group[], currentUser: User | null, filters: ClientChannelFilters): Channel[] {
        return channels.filter(channel => {
            const matchesSearch = !filters.searchTerm ||
                channel.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (channel.description && channel.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));

            const matchesType = !filters.selectedType || channel.type === filters.selectedType;

            // Show channels that belong to groups the current user is a member of
            let userInGroup = false;
            if (currentUser) {
                const group = groups.find(g => g.id === channel.groupId);
                if (group && Array.isArray(group.members)) {
                    userInGroup = group.members.includes(currentUser.id);
                }
                if (!userInGroup && Array.isArray(currentUser.groups)) {
                    userInGroup = currentUser.groups.includes(channel.groupId);
                }
            }

            return matchesSearch && matchesType && userInGroup;
        });
    }

    private loadMockData(): void {
        // Load groups from localStorage
        const storedGroups = localStorage.getItem('groups');
        if (storedGroups) {
            this.groupsSubject.next(JSON.parse(storedGroups));
        } else {
            this.initializeDefaultGroups();
        }

        // Load channels from localStorage
        const storedChannels = localStorage.getItem('channels');
        if (storedChannels) {
            this.channelsSubject.next(JSON.parse(storedChannels));
        } else {
            this.initializeDefaultChannels();
        }
    }

    private initializeDefaultGroups(): void {
        const currentUserId = this.currentUserSubject.value?.id || '1';

        const defaultGroups: Group[] = [
            {
                id: '1',
                name: 'Technology Team',
                description: 'Core technology development team',
                category: 'Technology',
                status: 'active' as any,
                createdBy: currentUserId,
                admins: [currentUserId],
                members: [currentUserId],
                channels: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                memberCount: 1,
                maxMembers: 50
            },
            {
                id: '2',
                name: 'Marketing Department',
                description: 'Marketing and communications team',
                category: 'Marketing',
                status: 'active' as any,
                createdBy: 'user2',
                admins: ['user2'],
                members: ['user2'],
                channels: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                memberCount: 1,
                maxMembers: 30
            }
        ];

        this.groupsSubject.next(defaultGroups);
        localStorage.setItem('groups', JSON.stringify(defaultGroups));
    }

    private initializeDefaultChannels(): void {
        const currentUserId = this.currentUserSubject.value?.id || '1';

        const defaultChannels: Channel[] = [
            {
                id: '1',
                name: 'general',
                description: 'General discussion for the technology team',
                groupId: '1',
                type: ChannelType.TEXT,
                createdBy: currentUserId,
                members: [],
                bannedUsers: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                memberCount: 0,
                maxMembers: 50
            },
            {
                id: '2',
                name: 'code-reviews',
                description: 'Code review discussions and feedback',
                groupId: '1',
                type: ChannelType.TEXT,
                createdBy: currentUserId,
                members: [],
                bannedUsers: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                memberCount: 0,
                maxMembers: 20
            },
            {
                id: '3',
                name: 'announcements',
                description: 'Important announcements and updates',
                groupId: '2',
                type: ChannelType.TEXT,
                createdBy: 'user2',
                members: [],
                bannedUsers: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                memberCount: 0,
                maxMembers: 30
            },
            {
                id: '4',
                name: 'campaign-planning',
                description: 'Marketing campaign planning and strategy',
                groupId: '2',
                type: ChannelType.VOICE,
                createdBy: 'user2',
                members: [],
                bannedUsers: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                memberCount: 0,
                maxMembers: 15
            }
        ];

        this.channelsSubject.next(defaultChannels);
        localStorage.setItem('channels', JSON.stringify(defaultChannels));
    }

    private updateChannelsInStorage(channels: Channel[]): void {
        localStorage.setItem('channels', JSON.stringify(channels));
    }
}
