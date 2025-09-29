import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group, GroupStatus, GroupCreation } from '../../models/group.model';
import { User, UserRole } from '../../models/user.model';

/**
 * Groups Management Business Logic Service
 * Handles all groups management business operations
 */
@Injectable({
    providedIn: 'root'
})
export class GroupsManagementService {
    private groupsSubject = new BehaviorSubject<Group[]>([]);
    private filteredGroupsSubject = new BehaviorSubject<Group[]>([]);

    public groups$ = this.groupsSubject.asObservable();
    public filteredGroups$ = this.filteredGroupsSubject.asObservable();

    constructor() {
        this.loadGroups();
    }

    /**
     * Load all groups from localStorage
     */
    loadGroups(): void {
        const storedGroups = localStorage.getItem('groups');
        if (storedGroups) {
            const groups = JSON.parse(storedGroups);
            this.groupsSubject.next(groups);
            this.filteredGroupsSubject.next(groups);
        } else {
            this.initializeDefaultGroups();
        }
    }

    /**
     * Filter groups based on search criteria
     */
    filterGroups(searchTerm: string = '', categoryFilter: string = '', statusFilter: string = ''): void {
        const groups = this.groupsSubject.value;
        let filtered = groups;

        if (searchTerm) {
            filtered = filtered.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(group => group.category === categoryFilter);
        }

        if (statusFilter) {
            filtered = filtered.filter(group => group.status === statusFilter);
        }

        this.filteredGroupsSubject.next(filtered);
    }

    /**
     * Create new group
     */
    createGroup(groupData: GroupCreation, currentUser: User): Promise<{ success: boolean; message: string; group?: Group }> {
        return new Promise((resolve) => {
            try {
                // Check permissions
                if (!this.canCreateGroup(currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to create groups' });
                    return;
                }

                // Check for name conflicts
                const existingGroups = this.groupsSubject.value;
                const nameExists = existingGroups.some(g => g.name === groupData.name);
                if (nameExists) {
                    resolve({ success: false, message: 'Group name already exists' });
                    return;
                }

                // Create new group
                const newGroup: Group = {
                    id: Date.now().toString(),
                    name: groupData.name,
                    description: groupData.description || '',
                    category: groupData.category,
                    status: GroupStatus.ACTIVE,
                    createdBy: currentUser.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    admins: [currentUser.id], // Creator becomes first admin
                    members: [currentUser.id], // Creator becomes first member
                    channels: [],
                    isActive: true,
                    maxMembers: groupData.maxMembers || 100
                };

                // Add to storage
                const updatedGroups = [...existingGroups, newGroup];
                localStorage.setItem('groups', JSON.stringify(updatedGroups));

                // Update local state
                this.groupsSubject.next(updatedGroups);
                this.filterGroups();

                resolve({ success: true, message: 'Group created successfully', group: newGroup });
            } catch (error) {
                console.error('Error creating group:', error);
                resolve({ success: false, message: 'Failed to create group' });
            }
        });
    }

    /**
     * Delete group
     */
    deleteGroup(groupId: string, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const groups = this.groupsSubject.value;
                const groupIndex = groups.findIndex(g => g.id === groupId);

                if (groupIndex === -1) {
                    resolve({ success: false, message: 'Group not found' });
                    return;
                }

                const group = groups[groupIndex];

                // Check permissions
                if (!this.canDeleteGroup(group, currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to delete this group' });
                    return;
                }

                // Check if group has members
                if (group.members && group.members.length > 1) {
                    resolve({ success: false, message: 'Cannot delete group with active members. Remove all members first.' });
                    return;
                }

                // Delete group
                const updatedGroups = groups.filter(g => g.id !== groupId);
                localStorage.setItem('groups', JSON.stringify(updatedGroups));

                // Update local state
                this.groupsSubject.next(updatedGroups);
                this.filterGroups();

                resolve({ success: true, message: 'Group deleted successfully' });
            } catch (error) {
                console.error('Error deleting group:', error);
                resolve({ success: false, message: 'Failed to delete group' });
            }
        });
    }

    /**
     * Check if user can create groups
     */
    canCreateGroup(user: User): boolean {
        if (!user) return false;
        return user.roles.includes(UserRole.SUPER_ADMIN) || user.roles.includes(UserRole.GROUP_ADMIN);
    }

    /**
     * Check if user can delete group
     */
    canDeleteGroup(group: Group, user: User): boolean {
        if (!user) return false;
        if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
        if (user.roles.includes(UserRole.GROUP_ADMIN)) {
            return group.createdBy === user.id;
        }
        return false;
    }

    /**
     * Check if user can edit group
     */
    canEditGroup(group: Group, user: User): boolean {
        return this.canDeleteGroup(group, user);
    }

    /**
     * Get group statistics
     */
    getGroupStats(): { total: number; active: number; inactive: number; pending: number } {
        const groups = this.groupsSubject.value;
        return {
            total: groups.length,
            active: groups.filter(g => g.status === GroupStatus.ACTIVE).length,
            inactive: groups.filter(g => g.status === GroupStatus.INACTIVE).length,
            pending: groups.filter(g => g.status === GroupStatus.PENDING).length
        };
    }

    /**
     * Initialize default groups if none exist
     */
    private initializeDefaultGroups(): void {
        const defaultGroups: Group[] = [
            {
                id: '1',
                name: 'Development Team',
                description: 'Main development team for the project',
                category: 'technology',
                status: GroupStatus.ACTIVE,
                createdBy: '1', // super admin
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date(),
                admins: ['1', '2'],
                members: ['1', '2', '3'],
                channels: ['1', '2'],
                isActive: true,
                maxMembers: 50
            },
            {
                id: '2',
                name: 'Design Team',
                description: 'UI/UX design and creative team',
                category: 'design',
                status: GroupStatus.ACTIVE,
                createdBy: '2', // group admin
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date(),
                admins: ['2'],
                members: ['2', '3'],
                channels: ['3'],
                isActive: true,
                maxMembers: 25
            }
        ];

        localStorage.setItem('groups', JSON.stringify(defaultGroups));
        this.groupsSubject.next(defaultGroups);
        this.filteredGroupsSubject.next(defaultGroups);
    }
}
