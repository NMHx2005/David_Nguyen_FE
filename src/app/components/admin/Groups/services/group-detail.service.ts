import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group, Channel, User, GroupStatus, ChannelType, UserRole } from '../../../../models';

/**
 * Group Detail Business Logic Service
 * Handles all group detail related business operations
 */
@Injectable({
    providedIn: 'root'
})
export class GroupDetailService {
    private groupSubject = new BehaviorSubject<Group | null>(null);
    private membersSubject = new BehaviorSubject<User[]>([]);
    private channelsSubject = new BehaviorSubject<Channel[]>([]);
    private allUsersSubject = new BehaviorSubject<User[]>([]);

    public group$ = this.groupSubject.asObservable();
    public members$ = this.membersSubject.asObservable();
    public channels$ = this.channelsSubject.asObservable();
    public allUsers$ = this.allUsersSubject.asObservable();

    constructor() {
        this.loadAllUsers();
        // Ensure data is initialized
        this.initializeDataIfNeeded();
    }

    /**
     * Initialize data if not exists
     */
    private initializeDataIfNeeded(): void {
        const groups = this.getStoredGroups();
        if (groups.length === 0) {
            console.log('GroupDetailService: No groups found, initializing data...');
            // Initialize basic data structure
            const mockGroups = [
                {
                    id: '1',
                    name: 'Development Team',
                    description: 'Software development team',
                    category: 'Technology',
                    status: 'ACTIVE',
                    createdBy: '1',
                    admins: ['1', '2'],
                    members: ['1', '2', '3'],
                    channels: ['1', '2'],
                    createdAt: new Date('2025-01-01'),
                    updatedAt: new Date('2025-01-01'),
                    isActive: true,
                    memberCount: 3,
                    maxMembers: 50
                },
                {
                    id: '2',
                    name: 'Design Team',
                    description: 'UI/UX design team',
                    category: 'Design',
                    status: 'ACTIVE',
                    createdBy: '1',
                    admins: ['1'],
                    members: ['1', '4'],
                    channels: ['3'],
                    createdAt: new Date('2025-01-10'),
                    updatedAt: new Date('2025-01-10'),
                    isActive: true,
                    memberCount: 2,
                    maxMembers: 30
                },
                {
                    id: '3',
                    name: 'Marketing Team',
                    description: 'Marketing and promotion team',
                    category: 'Marketing',
                    status: 'ACTIVE',
                    createdBy: '2',
                    admins: ['2', '5'],
                    members: ['2', '5'],
                    channels: ['4', '5'],
                    createdAt: new Date('2025-01-20'),
                    updatedAt: new Date('2025-01-20'),
                    isActive: true,
                    memberCount: 2,
                    maxMembers: 40
                }
            ];
            localStorage.setItem('groups', JSON.stringify(mockGroups));
            console.log('GroupDetailService: Groups initialized');
        }
    }

    /**
     * Load group by ID
     */
    loadGroup(groupId: string): void {
        console.log('GroupDetailService: Loading group with ID:', groupId);
        const groups = this.getStoredGroups();
        console.log('GroupDetailService: Available groups:', groups);
        const group = groups.find(g => g.id === groupId);
        console.log('GroupDetailService: Found group:', group);

        if (group) {
            this.groupSubject.next(group);
            this.loadGroupMembers(group);
            this.loadGroupChannels(group);
        } else {
            console.error('GroupDetailService: Group not found with ID:', groupId);
            this.groupSubject.next(null);
        }
    }

    /**
     * Load group members
     */
    private loadGroupMembers(group: Group): void {
        const allUsers = this.getAllUsers();
        const members = allUsers.filter(user => group.members.includes(user.id));
        this.membersSubject.next(members);
    }

    /**
     * Load group channels
     */
    private loadGroupChannels(group: Group): void {
        const allChannels = this.getStoredChannels();
        const channels = allChannels.filter(channel => group.channels.includes(channel.id));
        this.channelsSubject.next(channels);
    }

    /**
     * Load all users
     */
    private loadAllUsers(): void {
        const users = this.getStoredUsers();
        this.allUsersSubject.next(users);
    }

    /**
     * Add member to group
     */
    addMemberToGroup(groupId: string, username: string): Promise<{ success: boolean; message: string }> {
        try {
            const allUsers = this.getAllUsers();
            const userToAdd = allUsers.find(u => u.username === username);

            if (!userToAdd) {
                return Promise.resolve({ success: false, message: `User "${username}" not found` });
            }

            const groups = this.getStoredGroups();
            const groupIndex = groups.findIndex(g => g.id === groupId);

            if (groupIndex === -1) {
                return Promise.resolve({ success: false, message: 'Group not found' });
            }

            const group = groups[groupIndex];

            // Check if user is already a member
            if (group.members.includes(userToAdd.id)) {
                return Promise.resolve({ success: false, message: `User "${username}" is already a member of this group` });
            }

            // Add user to group
            group.members.push(userToAdd.id);
            group.memberCount = group.memberCount ? group.memberCount + 1 : group.members.length;
            group.updatedAt = new Date();

            // Update user's groups
            if (!userToAdd.groups.includes(groupId)) {
                userToAdd.groups.push(groupId);
                userToAdd.updatedAt = new Date();
            }

            // Save to localStorage
            groups[groupIndex] = group;
            localStorage.setItem('groups', JSON.stringify(groups));

            const userIndex = allUsers.findIndex(u => u.id === userToAdd.id);
            if (userIndex > -1) {
                allUsers[userIndex] = userToAdd;
                localStorage.setItem('users', JSON.stringify(allUsers));
            }

            // Update local state
            this.groupSubject.next(group);
            this.loadGroupMembers(group);

            return Promise.resolve({ success: true, message: `User "${username}" added to group successfully` });
        } catch (error) {
            console.error('Error adding member to group:', error);
            return Promise.resolve({ success: false, message: 'Failed to add member to group' });
        }
    }

    /**
     * Remove member from group
     */
    removeMemberFromGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            const groups = this.getStoredGroups();
            const groupIndex = groups.findIndex(g => g.id === groupId);

            if (groupIndex === -1) {
                return Promise.resolve({ success: false, message: 'Group not found' });
            }

            const group = groups[groupIndex];

            // Check if user is a member
            if (!group.members.includes(userId)) {
                return Promise.resolve({ success: false, message: 'User is not a member of this group' });
            }

            // Remove user from group
            group.members = group.members.filter((id: string) => id !== userId);
            group.memberCount = group.memberCount ? group.memberCount - 1 : group.members.length;
            group.updatedAt = new Date();

            // Update user's groups
            const allUsers = this.getAllUsers();
            const userIndex = allUsers.findIndex(u => u.id === userId);
            if (userIndex > -1) {
                allUsers[userIndex].groups = allUsers[userIndex].groups.filter((id: string) => id !== groupId);
                allUsers[userIndex].updatedAt = new Date();
                localStorage.setItem('users', JSON.stringify(allUsers));
            }

            // Save to localStorage
            groups[groupIndex] = group;
            localStorage.setItem('groups', JSON.stringify(groups));

            // Update local state
            this.groupSubject.next(group);
            this.loadGroupMembers(group);

            return Promise.resolve({ success: true, message: 'Member removed from group successfully' });
        } catch (error) {
            console.error('Error removing member from group:', error);
            return Promise.resolve({ success: false, message: 'Failed to remove member from group' });
        }
    }

    /**
     * Add channel to group
     */
    addChannelToGroup(groupId: string, channelData: { name: string; description: string; type: ChannelType }): Promise<{ success: boolean; message: string; channel?: Channel }> {
        try {
            const newChannel: Channel = {
                id: Date.now().toString(),
                name: channelData.name,
                description: channelData.description,
                type: channelData.type,
                groupId: groupId,
                createdBy: 'current-user', // This should be the actual current user ID
                members: [],
                bannedUsers: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            };

            // Add to channels
            const channels = this.getStoredChannels();
            channels.push(newChannel);
            localStorage.setItem('channels', JSON.stringify(channels));

            // Add to group
            const groups = this.getStoredGroups();
            const groupIndex = groups.findIndex(g => g.id === groupId);

            if (groupIndex > -1) {
                groups[groupIndex].channels.push(newChannel.id);
                groups[groupIndex].updatedAt = new Date();
                localStorage.setItem('groups', JSON.stringify(groups));

                // Update local state
                this.groupSubject.next(groups[groupIndex]);
                this.loadGroupChannels(groups[groupIndex]);
            }

            return Promise.resolve({ success: true, message: 'Channel created successfully', channel: newChannel });
        } catch (error) {
            console.error('Error adding channel to group:', error);
            return Promise.resolve({ success: false, message: 'Failed to create channel' });
        }
    }

    /**
     * Delete channel from group
     */
    deleteChannelFromGroup(groupId: string, channelId: string): Promise<{ success: boolean; message: string }> {
        try {
            // Remove from channels
            const channels = this.getStoredChannels();
            const filteredChannels = channels.filter(c => c.id !== channelId);
            localStorage.setItem('channels', JSON.stringify(filteredChannels));

            // Remove from group
            const groups = this.getStoredGroups();
            const groupIndex = groups.findIndex(g => g.id === groupId);

            if (groupIndex > -1) {
                groups[groupIndex].channels = groups[groupIndex].channels.filter((id: string) => id !== channelId);
                groups[groupIndex].updatedAt = new Date();
                localStorage.setItem('groups', JSON.stringify(groups));

                // Update local state
                this.groupSubject.next(groups[groupIndex]);
                this.loadGroupChannels(groups[groupIndex]);
            }

            return Promise.resolve({ success: true, message: 'Channel deleted successfully' });
        } catch (error) {
            console.error('Error deleting channel from group:', error);
            return Promise.resolve({ success: false, message: 'Failed to delete channel' });
        }
    }

    /**
     * Update group information
     */
    updateGroup(groupId: string, updates: Partial<Group>): Promise<{ success: boolean; message: string }> {
        try {
            const groups = this.getStoredGroups();
            const groupIndex = groups.findIndex(g => g.id === groupId);

            if (groupIndex === -1) {
                return Promise.resolve({ success: false, message: 'Group not found' });
            }

            groups[groupIndex] = {
                ...groups[groupIndex],
                ...updates,
                updatedAt: new Date()
            };

            localStorage.setItem('groups', JSON.stringify(groups));

            // Update local state
            this.groupSubject.next(groups[groupIndex]);

            return Promise.resolve({ success: true, message: 'Group updated successfully' });
        } catch (error) {
            console.error('Error updating group:', error);
            return Promise.resolve({ success: false, message: 'Failed to update group' });
        }
    }

    /**
     * Delete group
     */
    deleteGroup(groupId: string): Promise<{ success: boolean; message: string }> {
        try {
            // Remove group from groups
            const groups = this.getStoredGroups();
            const filteredGroups = groups.filter(g => g.id !== groupId);
            localStorage.setItem('groups', JSON.stringify(filteredGroups));

            // Remove group from users' groups
            const allUsers = this.getAllUsers();
            allUsers.forEach(user => {
                user.groups = user.groups.filter((id: string) => id !== groupId);
                user.updatedAt = new Date();
            });
            localStorage.setItem('users', JSON.stringify(allUsers));

            // Remove group channels
            const channels = this.getStoredChannels();
            const filteredChannels = channels.filter(c => c.groupId !== groupId);
            localStorage.setItem('channels', JSON.stringify(filteredChannels));

            // Clear local state
            this.groupSubject.next(null);
            this.membersSubject.next([]);
            this.channelsSubject.next([]);

            return Promise.resolve({ success: true, message: 'Group deleted successfully' });
        } catch (error) {
            console.error('Error deleting group:', error);
            return Promise.resolve({ success: false, message: 'Failed to delete group' });
        }
    }

    /**
     * Search users by username
     */
    searchUsers(searchTerm: string): User[] {
        const allUsers = this.getAllUsers();
        if (!searchTerm.trim()) return allUsers;

        return allUsers.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    /**
     * Get group statistics
     */
    getGroupStats(group: Group): {
        totalMembers: number;
        totalChannels: number;
        activeMembers: number;
        inactiveMembers: number;
    } {
        const members = this.getMembers();
        const channels = this.getChannels();

        return {
            totalMembers: members.length,
            totalChannels: channels.length,
            activeMembers: members.filter(m => m.isActive).length,
            inactiveMembers: members.filter(m => !m.isActive).length
        };
    }

    /**
     * Get current group
     */
    getGroup(): Group | null {
        return this.groupSubject.value;
    }

    /**
     * Get current members
     */
    getMembers(): User[] {
        return this.membersSubject.value;
    }

    /**
     * Get current channels
     */
    getChannels(): Channel[] {
        return this.channelsSubject.value;
    }

    /**
     * Get all users
     */
    getAllUsers(): User[] {
        return this.allUsersSubject.value;
    }

    /**
     * Private helper methods
     */
    private getStoredUsers(): User[] {
        try {
            const usersData = localStorage.getItem('users');
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            console.error('Error parsing users from storage:', error);
            return [];
        }
    }

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
