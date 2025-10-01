import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel, ChannelType } from '../../../../models/channel.model';
import { Group } from '../../../../models/group.model';
import { User, UserRole } from '../../../../models/user.model';

/**
 * Channel Business Logic Service
 * Handles all channel-related business operations
 */
@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    private channelSubject = new BehaviorSubject<Channel | null>(null);
    private groupsSubject = new BehaviorSubject<Group[]>([]);
    private channelsSubject = new BehaviorSubject<Channel[]>([]);

    public channel$ = this.channelSubject.asObservable();
    public groups$ = this.groupsSubject.asObservable();
    public channels$ = this.channelsSubject.asObservable();

    constructor() {
        this.loadAllGroups();
        this.loadAllChannels();
    }

    /**
     * Load channel by ID
     */
    loadChannel(channelId: string): Promise<{ success: boolean; channel?: Channel; message?: string }> {
        return new Promise((resolve) => {
            try {
                const channels = this.getStoredChannels();
                const channel = channels.find(c => c.id === channelId);

                if (channel) {
                    this.channelSubject.next(channel);
                    resolve({ success: true, channel });
                } else {
                    this.channelSubject.next(null);
                    resolve({ success: false, message: 'Channel not found' });
                }
            } catch (error) {
                console.error('Error loading channel:', error);
                resolve({ success: false, message: 'Failed to load channel' });
            }
        });
    }

    /**
     * Update channel
     */
    updateChannel(channelId: string, updates: Partial<Channel>, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                console.log('ChannelService - Update Channel:', { channelId, updates, currentUser });
                const channels = this.getStoredChannels();
                console.log('ChannelService - Stored Channels:', channels);
                const channelIndex = channels.findIndex(c => c.id === channelId);
                console.log('ChannelService - Channel Index:', channelIndex);

                if (channelIndex === -1) {
                    console.log('ChannelService - Channel not found');
                    resolve({ success: false, message: 'Channel not found' });
                    return;
                }

                const channel = channels[channelIndex];

                // Check permissions
                if (!this.canEditChannel(channel, currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to edit this channel' });
                    return;
                }

                // Check for name conflicts within the same group
                if (updates.name && (updates.name !== channel.name || updates.groupId !== channel.groupId)) {
                    const nameExists = channels.some(c =>
                        c.name === updates.name &&
                        c.groupId === (updates.groupId || channel.groupId) &&
                        c.id !== channelId
                    );
                    if (nameExists) {
                        resolve({ success: false, message: 'Channel name already exists in this group' });
                        return;
                    }
                }

                // Update channel
                const updatedChannel: Channel = {
                    ...channel,
                    ...updates,
                    updatedAt: new Date()
                };

                channels[channelIndex] = updatedChannel;
                localStorage.setItem('channels', JSON.stringify(channels));

                // Update group's channels array if group changed
                if (updates.groupId && updates.groupId !== channel.groupId) {
                    this.updateGroupChannels(channel.groupId, updates.groupId, channelId);
                }

                // Update local state
                this.channelSubject.next(updatedChannel);
                this.loadAllChannels();

                resolve({ success: true, message: 'Channel updated successfully' });
            } catch (error) {
                console.error('Error updating channel:', error);
                resolve({ success: false, message: 'Failed to update channel' });
            }
        });
    }

    /**
     * Delete channel
     */
    deleteChannel(channelId: string, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const channels = this.getStoredChannels();
                const channel = channels.find(c => c.id === channelId);

                if (!channel) {
                    resolve({ success: false, message: 'Channel not found' });
                    return;
                }

                // Check permissions
                if (!this.canDeleteChannel(channel, currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to delete this channel' });
                    return;
                }

                // Remove from channels
                const filteredChannels = channels.filter(c => c.id !== channelId);
                localStorage.setItem('channels', JSON.stringify(filteredChannels));

                // Remove from group
                this.removeChannelFromGroup(channel.groupId, channelId);

                // Update local state
                this.channelSubject.next(null);
                this.loadAllChannels();

                resolve({ success: true, message: 'Channel deleted successfully' });
            } catch (error) {
                console.error('Error deleting channel:', error);
                resolve({ success: false, message: 'Failed to delete channel' });
            }
        });
    }

    /**
     * Create new channel
     */
    createChannel(channelData: {
        name: string;
        description: string;
        type: ChannelType;
        groupId: string;
        maxMembers?: number;
    }, currentUser: User): Promise<{ success: boolean; message: string; channel?: Channel }> {
        return new Promise((resolve) => {
            try {
                const channels = this.getStoredChannels();

                // Check for name conflicts
                const nameExists = channels.some(c =>
                    c.name === channelData.name && c.groupId === channelData.groupId
                );
                if (nameExists) {
                    resolve({ success: false, message: 'Channel name already exists in this group' });
                    return;
                }

                // Create new channel
                const newChannel: Channel = {
                    id: Date.now().toString(),
                    name: channelData.name,
                    description: channelData.description,
                    type: channelData.type,
                    groupId: channelData.groupId,
                    createdBy: currentUser.id,
                    members: [],
                    bannedUsers: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    maxMembers: channelData.maxMembers || 100
                };

                channels.push(newChannel);
                localStorage.setItem('channels', JSON.stringify(channels));

                // Add to group
                this.addChannelToGroup(channelData.groupId, newChannel.id);

                // Update local state
                this.loadAllChannels();

                resolve({ success: true, message: 'Channel created successfully', channel: newChannel });
            } catch (error) {
                console.error('Error creating channel:', error);
                resolve({ success: false, message: 'Failed to create channel' });
            }
        });
    }

    /**
     * Get current channel
     */
    getChannel(): Channel | null {
        return this.channelSubject.value;
    }

    /**
     * Get all groups
     */
    getGroups(): Group[] {
        return this.groupsSubject.value;
    }

    /**
     * Get all channels
     */
    getChannels(): Channel[] {
        return this.channelsSubject.value;
    }

    /**
     * Check if user can edit channel
     */
    canEditChannel(channel: Channel, user: User): boolean {
        if (!user) return false;
        if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
        if (user.roles.includes(UserRole.GROUP_ADMIN)) {
            const groups = this.getGroups();
            const group = groups.find(g => g.id === channel.groupId);
            return group ? group.createdBy === user.id : false;
        }
        return false;
    }

    /**
     * Check if user can delete channel
     */
    canDeleteChannel(channel: Channel, user: User): boolean {
        return this.canEditChannel(channel, user);
    }

    /**
     * Load all groups
     */
    private loadAllGroups(): void {
        const groups = this.getStoredGroups();
        this.groupsSubject.next(groups);
    }

    /**
     * Load all channels
     */
    private loadAllChannels(): void {
        const channels = this.getStoredChannels();
        this.channelsSubject.next(channels);
    }

    /**
     * Update group's channels array when channel moves between groups
     */
    private updateGroupChannels(oldGroupId: string, newGroupId: string, channelId: string): void {
        const groups = this.getStoredGroups();

        // Remove channel from old group
        const oldGroup = groups.find(g => g.id === oldGroupId);
        if (oldGroup) {
            oldGroup.channels = oldGroup.channels.filter(id => id !== channelId);
            oldGroup.updatedAt = new Date();
        }

        // Add channel to new group
        const newGroup = groups.find(g => g.id === newGroupId);
        if (newGroup && !newGroup.channels.includes(channelId)) {
            newGroup.channels.push(channelId);
            newGroup.updatedAt = new Date();
        }

        localStorage.setItem('groups', JSON.stringify(groups));
        this.loadAllGroups();
    }

    /**
     * Add channel to group
     */
    private addChannelToGroup(groupId: string, channelId: string): void {
        const groups = this.getStoredGroups();
        const group = groups.find(g => g.id === groupId);

        if (group && !group.channels.includes(channelId)) {
            group.channels.push(channelId);
            group.updatedAt = new Date();
            localStorage.setItem('groups', JSON.stringify(groups));
            this.loadAllGroups();
        }
    }

    /**
     * Remove channel from group
     */
    private removeChannelFromGroup(groupId: string, channelId: string): void {
        const groups = this.getStoredGroups();
        const group = groups.find(g => g.id === groupId);

        if (group) {
            group.channels = group.channels.filter(id => id !== channelId);
            group.updatedAt = new Date();
            localStorage.setItem('groups', JSON.stringify(groups));
            this.loadAllGroups();
        }
    }

    /**
     * Private helper methods
     */
    private getStoredGroups(): Group[] {
        try {
            const groupsData = localStorage.getItem('groups');
            return groupsData ? JSON.parse(groupsData) : [];
        } catch (error) {
            console.error('Error parsing groups from storage:', error);
            return [];
        }
    }

    private getStoredChannels(): Channel[] {
        try {
            const channelsData = localStorage.getItem('channels');
            return channelsData ? JSON.parse(channelsData) : [];
        } catch (error) {
            console.error('Error parsing channels from storage:', error);
            return [];
        }
    }
}
