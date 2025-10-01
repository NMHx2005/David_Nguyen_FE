import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel, ChannelType } from '../../../../models/channel.model';
import { Group } from '../../../../models/group.model';
import { User, UserRole } from '../../../../models/user.model';

export interface ChannelStats {
    totalChannels: number;
    textChannels: number;
    voiceChannels: number;
    videoChannels: number;
}

export interface ChannelFilters {
    searchTerm: string;
    groupId: string;
    type: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChannelsManagementService {
    private channelsSubject = new BehaviorSubject<Channel[]>([]);
    public channels$: Observable<Channel[]> = this.channelsSubject.asObservable();

    private filteredChannelsSubject = new BehaviorSubject<Channel[]>([]);
    public filteredChannels$: Observable<Channel[]> = this.filteredChannelsSubject.asObservable();

    private statsSubject = new BehaviorSubject<ChannelStats>({
        totalChannels: 0,
        textChannels: 0,
        voiceChannels: 0,
        videoChannels: 0
    });
    public stats$: Observable<ChannelStats> = this.statsSubject.asObservable();

    private groupsSubject = new BehaviorSubject<Group[]>([]);
    public groups$: Observable<Group[]> = this.groupsSubject.asObservable();

    private currentFilters: ChannelFilters = { searchTerm: '', groupId: '', type: '' };

    constructor() {
        this.loadChannels();
        this.loadGroups();
    }

    private loadChannels(): void {
        const storedChannels = localStorage.getItem('channels');
        let channels: Channel[] = [];
        if (storedChannels) {
            channels = JSON.parse(storedChannels).map((channel: any) => ({
                ...channel,
                createdAt: new Date(channel.createdAt),
                updatedAt: new Date(channel.updatedAt)
            }));
        } else {
            channels = this.initializeDefaultChannels();
        }
        this.channelsSubject.next(channels);
        this.applyFilters();
        this.updateStats(channels);
    }

    private loadGroups(): void {
        const storedGroups = localStorage.getItem('groups');
        let groups: Group[] = [];
        if (storedGroups) {
            groups = JSON.parse(storedGroups).map((group: any) => ({
                ...group,
                createdAt: new Date(group.createdAt),
                updatedAt: new Date(group.updatedAt)
            }));
        }
        this.groupsSubject.next(groups);
    }

    private initializeDefaultChannels(): Channel[] {
        const defaultChannels: Channel[] = [
            {
                id: '1',
                name: 'general',
                description: 'General discussion channel',
                type: ChannelType.TEXT,
                groupId: '1',
                createdBy: '1',
                members: ['1', '2', '3'],
                bannedUsers: [],
                maxMembers: 100,
                isActive: true,
                createdAt: new Date('2025-01-01T10:00:00Z'),
                updatedAt: new Date('2025-01-01T10:00:00Z')
            },
            {
                id: '2',
                name: 'development',
                description: 'Development team discussions',
                type: ChannelType.TEXT,
                groupId: '1',
                createdBy: '1',
                members: ['1', '2'],
                bannedUsers: [],
                maxMembers: 50,
                isActive: true,
                createdAt: new Date('2025-01-01T11:00:00Z'),
                updatedAt: new Date('2025-01-01T11:00:00Z')
            },
            {
                id: '3',
                name: 'design-discussions',
                description: 'UI/UX design discussions',
                type: ChannelType.TEXT,
                groupId: '2',
                createdBy: '2',
                members: ['2', '3'],
                bannedUsers: [],
                maxMembers: 25,
                isActive: true,
                createdAt: new Date('2025-01-15T12:00:00Z'),
                updatedAt: new Date('2025-01-15T12:00:00Z')
            }
        ];
        localStorage.setItem('channels', JSON.stringify(defaultChannels));
        return defaultChannels;
    }

    private updateStats(channels: Channel[]): void {
        const totalChannels = channels.length;
        const textChannels = channels.filter(c => c.type === ChannelType.TEXT).length;
        const voiceChannels = channels.filter(c => c.type === ChannelType.VOICE).length;
        const videoChannels = channels.filter(c => c.type === ChannelType.VIDEO).length;

        this.statsSubject.next({ totalChannels, textChannels, voiceChannels, videoChannels });
    }

    private saveChannels(channels: Channel[]): void {
        localStorage.setItem('channels', JSON.stringify(channels));
        this.channelsSubject.next(channels);
        this.applyFilters();
        this.updateStats(channels);
    }

    setFilters(filters: ChannelFilters): void {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.applyFilters();
    }

    applyFilters(): void {
        let filtered = this.channelsSubject.value;

        if (this.currentFilters.searchTerm) {
            const term = this.currentFilters.searchTerm.toLowerCase();
            filtered = filtered.filter(channel =>
                channel.name.toLowerCase().includes(term) ||
                channel.description?.toLowerCase().includes(term)
            );
        }

        if (this.currentFilters.groupId) {
            filtered = filtered.filter(channel => channel.groupId === this.currentFilters.groupId);
        }

        if (this.currentFilters.type) {
            filtered = filtered.filter(channel => channel.type === this.currentFilters.type);
        }

        this.filteredChannelsSubject.next(filtered);
    }

    async createChannel(channelData: Partial<Channel>, currentUser: User | null): Promise<{ success: boolean; message: string; channel?: Channel }> {
        if (!currentUser || !this.canCreateChannel(currentUser)) {
            return { success: false, message: 'You do not have permission to create channels.' };
        }

        const channels = this.channelsSubject.value;
        const groupId = channelData.groupId;

        if (!groupId) {
            return { success: false, message: 'Group ID is required.' };
        }

        // Check if channel name already exists in the same group
        const existingChannel = channels.find(c =>
            c.name.toLowerCase() === channelData.name?.toLowerCase() &&
            c.groupId === groupId
        );

        if (existingChannel) {
            return { success: false, message: 'Channel with this name already exists in the selected group.' };
        }

        const newChannel: Channel = {
            id: Date.now().toString(),
            name: channelData.name || '',
            description: channelData.description || '',
            type: channelData.type || ChannelType.TEXT,
            groupId: groupId,
            createdBy: currentUser.id,
            members: [currentUser.id],
            bannedUsers: [],
            maxMembers: channelData.maxMembers || 100,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedChannels = [...channels, newChannel];
        this.saveChannels(updatedChannels);

        // Add channel to group
        await this.addChannelToGroup(newChannel.id, groupId);

        return { success: true, message: 'Channel created successfully.', channel: newChannel };
    }

    async updateChannel(channelId: string, updates: Partial<Channel>, currentUser: User | null): Promise<{ success: boolean; message: string }> {
        if (!currentUser || !this.canEditChannel(channelId, currentUser)) {
            return { success: false, message: 'You do not have permission to edit this channel.' };
        }

        let channels = this.channelsSubject.value;
        const channelIndex = channels.findIndex(c => c.id === channelId);

        if (channelIndex === -1) {
            return { success: false, message: 'Channel not found.' };
        }

        const existingChannel = channels[channelIndex];
        const updatedChannel: Channel = {
            ...existingChannel,
            ...updates,
            updatedAt: new Date(),
            id: channelId // Ensure ID doesn't change
        };

        channels = [...channels.slice(0, channelIndex), updatedChannel, ...channels.slice(channelIndex + 1)];
        this.saveChannels(channels);

        return { success: true, message: 'Channel updated successfully.' };
    }

    async deleteChannel(channelId: string, currentUser: User | null): Promise<{ success: boolean; message: string }> {
        if (!currentUser || !this.canDeleteChannel(channelId, currentUser)) {
            return { success: false, message: 'You do not have permission to delete this channel.' };
        }

        let channels = this.channelsSubject.value;
        const channelToDelete = channels.find(c => c.id === channelId);

        if (!channelToDelete) {
            return { success: false, message: 'Channel not found.' };
        }

        // For Phase 1 (mock data), allow deletion regardless of members
        // In Phase 2, you might want to enforce this rule
        const memberCount = channelToDelete.memberCount || (channelToDelete.members?.length || 0);
        console.log('Deleting channel:', channelToDelete.name, 'Members:', memberCount);

        channels = channels.filter(c => c.id !== channelId);
        this.saveChannels(channels);

        // Remove channel from group
        await this.removeChannelFromGroup(channelId, channelToDelete.groupId);

        return { success: true, message: 'Channel deleted successfully.' };
    }

    async banUserFromChannel(channelId: string, userId: string, reason: string, currentUser: User | null): Promise<{ success: boolean; message: string }> {
        if (!currentUser || !this.canBanUserFromChannel(channelId, currentUser)) {
            return { success: false, message: 'You do not have permission to ban users from this channel.' };
        }

        let channels = this.channelsSubject.value;
        const channelIndex = channels.findIndex(c => c.id === channelId);

        if (channelIndex === -1) {
            return { success: false, message: 'Channel not found.' };
        }

        const channel = channels[channelIndex];
        if (channel.bannedUsers.includes(userId)) {
            return { success: false, message: 'User is already banned from this channel.' };
        }

        // Add user to banned list and remove from members
        const updatedChannel = {
            ...channel,
            bannedUsers: [...channel.bannedUsers, userId],
            members: channel.members.filter(id => id !== userId),
            updatedAt: new Date()
        };

        channels = [...channels.slice(0, channelIndex), updatedChannel, ...channels.slice(channelIndex + 1)];
        this.saveChannels(channels);

        return { success: true, message: `User banned from channel. Reason: ${reason}` };
    }

    private async addChannelToGroup(channelId: string, groupId: string): Promise<void> {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const groupIndex = groups.findIndex((g: Group) => g.id === groupId);

        if (groupIndex > -1) {
            if (!groups[groupIndex].channels.includes(channelId)) {
                groups[groupIndex].channels.push(channelId);
                groups[groupIndex].updatedAt = new Date();
                localStorage.setItem('groups', JSON.stringify(groups));
            }
        }
    }

    private async removeChannelFromGroup(channelId: string, groupId: string): Promise<void> {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const groupIndex = groups.findIndex((g: Group) => g.id === groupId);

        if (groupIndex > -1) {
            groups[groupIndex].channels = groups[groupIndex].channels.filter((id: string) => id !== channelId);
            groups[groupIndex].updatedAt = new Date();
            localStorage.setItem('groups', JSON.stringify(groups));
        }
    }

    canCreateChannel(currentUser: User | null): boolean {
        if (!currentUser) return false;
        return currentUser.roles.includes(UserRole.SUPER_ADMIN) || currentUser.roles.includes(UserRole.GROUP_ADMIN);
    }

    canEditChannel(channelId: string, currentUser: User | null): boolean {
        if (!currentUser) return false;
        const channel = this.channelsSubject.value.find(c => c.id === channelId);
        if (!channel) return false;

        // Super admins can edit all channels
        if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;

        // Group admins can edit channels they created
        if (currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            return channel.createdBy === currentUser.id;
        }

        return false;
    }

    canDeleteChannel(channelId: string, currentUser: User | null): boolean {
        if (!currentUser) return false;
        const channel = this.channelsSubject.value.find(c => c.id === channelId);
        if (!channel) return false;

        // Super admins can delete all channels
        if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;

        // Group admins can delete channels they created
        if (currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            return channel.createdBy === currentUser.id;
        }

        return false;
    }

    canBanUserFromChannel(channelId: string, currentUser: User | null): boolean {
        if (!currentUser) return false;
        const channel = this.channelsSubject.value.find(c => c.id === channelId);
        if (!channel) return false;

        // Super admins and group admins can ban users
        return currentUser.roles.includes(UserRole.SUPER_ADMIN) ||
            currentUser.roles.includes(UserRole.GROUP_ADMIN);
    }

    getChannelMembers(channel: Channel): User[] {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.filter((user: User) => channel.members?.includes(user.id) || false);
    }

    getAvailableUsersForBan(channel: Channel): User[] {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.filter((user: User) =>
            !(channel.bannedUsers?.includes(user.id) || false) &&
            user.id !== this.getCurrentUser()?.id
        );
    }

    private getCurrentUser(): User | null {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
}
