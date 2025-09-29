import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group } from '../../models/group.model';
import { User, UserRole } from '../../models/user.model';

export interface EditData {
    newUsername: string;
    newEmail: string;
    currentPassword: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private userGroupsSubject = new BehaviorSubject<Group[]>([]);
    private isSubmittingSubject = new BehaviorSubject<boolean>(false);

    public userGroups$ = this.userGroupsSubject.asObservable();
    public isSubmitting$ = this.isSubmittingSubject.asObservable();

    constructor() {
        this.loadUserGroups();
    }

    getUserGroups(): Group[] {
        return this.userGroupsSubject.value;
    }

    async updateProfile(editData: EditData, currentUser: User | null): Promise<boolean> {
        if (!currentUser) {
            throw new Error('No current user found');
        }

        if (!editData.currentPassword) {
            throw new Error('Current password is required');
        }

        this.isSubmittingSubject.next(true);

        try {
            // Mock update for Phase 1
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update user data in localStorage
            const updatedUser = {
                ...currentUser,
                username: editData.newUsername || currentUser.username,
                email: editData.newEmail || currentUser.email,
                updatedAt: new Date()
            };

            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            return true;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        } finally {
            this.isSubmittingSubject.next(false);
        }
    }

    async leaveGroup(groupId: string, currentUser: User | null): Promise<boolean> {
        if (!currentUser) {
            throw new Error('No current user found');
        }

        try {
            const groups = this.userGroupsSubject.value;
            const groupIndex = groups.findIndex(g => g.id === groupId);

            if (groupIndex !== -1) {
                const group = groups[groupIndex];

                // Remove user from group members
                if (group.members) {
                    group.members = group.members.filter(memberId => memberId !== currentUser.id);
                }

                // Update group in localStorage
                this.updateGroupInStorage(group);

                // Remove from user's groups list
                groups.splice(groupIndex, 1);
                this.userGroupsSubject.next([...groups]);

                return true;
            }

            return false;
        } catch (error) {
            console.error('Leave group error:', error);
            throw error;
        }
    }

    private loadUserGroups(): void {
        // Mock data for Phase 1
        const mockGroups: Group[] = [
            {
                id: '1',
                name: 'Development Team',
                description: 'Main development team for the chat system project.',
                category: 'development',
                status: 'ACTIVE' as any,
                members: ['super', 'admin', 'user'],
                admins: ['super', 'admin'],
                channels: ['channel1', 'channel2'],
                createdBy: 'super',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-20'),
                isActive: true,
                memberCount: 3,
                maxMembers: 50
            },
            {
                id: '2',
                name: 'Design Team',
                description: 'Creative discussions and design feedback.',
                category: 'design',
                status: 'ACTIVE' as any,
                members: ['admin', 'user'],
                admins: ['admin'],
                channels: ['channel3'],
                createdBy: 'admin',
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-05'),
                isActive: true,
                memberCount: 2,
                maxMembers: 30
            }
        ];

        this.userGroupsSubject.next(mockGroups);
    }

    private updateGroupInStorage(group: Group): void {
        const storedGroups = localStorage.getItem('groups');
        if (storedGroups) {
            const groups = JSON.parse(storedGroups);
            const groupIndex = groups.findIndex((g: any) => g.id === group.id);

            if (groupIndex !== -1) {
                groups[groupIndex] = group;
                localStorage.setItem('groups', JSON.stringify(groups));
            }
        }
    }

    getRoleDisplayName(user: User | null): string {
        if (!user) return 'User';

        if (user.roles?.includes(UserRole.SUPER_ADMIN)) return 'Super Administrator';
        if (user.roles?.includes(UserRole.GROUP_ADMIN)) return 'Group Administrator';
        return 'User';
    }

    getRoleColor(user: User | null): string {
        if (!user) return 'primary';

        if (user.roles?.includes(UserRole.SUPER_ADMIN)) return 'warn';
        if (user.roles?.includes(UserRole.GROUP_ADMIN)) return 'accent';
        return 'primary';
    }
}
