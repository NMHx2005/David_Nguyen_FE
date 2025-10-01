import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group, GroupStatus, GroupUpdate } from '../../../../models/group.model';
import { User, UserRole } from '../../../../models/user.model';

/**
 * Group Edit Business Logic Service
 * Handles all group editing business operations
 */
@Injectable({
    providedIn: 'root'
})
export class GroupEditService {
    private groupSubject = new BehaviorSubject<Group | null>(null);
    public group$ = this.groupSubject.asObservable();

    constructor() { }

    /**
     * Load group by ID
     */
    loadGroup(groupId: string): Promise<{ success: boolean; group?: Group; message?: string }> {
        return new Promise((resolve) => {
            try {
                const groups = this.getStoredGroups();
                const group = groups.find(g => g.id === groupId);

                if (group) {
                    this.groupSubject.next(group);
                    resolve({ success: true, group });
                } else {
                    this.groupSubject.next(null);
                    resolve({ success: false, message: 'Group not found' });
                }
            } catch (error) {
                console.error('Error loading group:', error);
                resolve({ success: false, message: 'Failed to load group' });
            }
        });
    }

    /**
     * Update group
     */
    updateGroup(groupId: string, updates: GroupUpdate, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const groups = this.getStoredGroups();
                const groupIndex = groups.findIndex(g => g.id === groupId);

                if (groupIndex === -1) {
                    resolve({ success: false, message: 'Group not found' });
                    return;
                }

                const group = groups[groupIndex];

                // Check permissions
                if (!this.canEditGroup(group, currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to edit this group' });
                    return;
                }

                // Check for name conflicts
                if (updates.name && updates.name !== group.name) {
                    const nameExists = groups.some(g => g.name === updates.name && g.id !== groupId);
                    if (nameExists) {
                        resolve({ success: false, message: 'Group name already exists' });
                        return;
                    }
                }

                // Update group
                const updatedGroup: Group = {
                    ...group,
                    ...updates,
                    updatedAt: new Date()
                };

                groups[groupIndex] = updatedGroup;
                localStorage.setItem('groups', JSON.stringify(groups));

                // Update local state
                this.groupSubject.next(updatedGroup);

                resolve({ success: true, message: 'Group updated successfully' });
            } catch (error) {
                console.error('Error updating group:', error);
                resolve({ success: false, message: 'Failed to update group' });
            }
        });
    }

    /**
     * Check if user can edit group
     */
    canEditGroup(group: Group, user: User): boolean {
        if (!user) return false;
        if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
        if (user.roles.includes(UserRole.GROUP_ADMIN)) {
            return group.createdBy === user.id;
        }
        return false;
    }

    /**
     * Get all stored groups
     */
    private getStoredGroups(): Group[] {
        const groupsData = localStorage.getItem('groups');
        return groupsData ? JSON.parse(groupsData) : [];
    }
}
