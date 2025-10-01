import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../../../../models/user.model';

export interface UserStats {
    totalUsers: number;
    superAdmins: number;
    groupAdmins: number;
    activeUsers: number;
}

export interface UserFilters {
    searchTerm: string;
    role: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class UsersManagementService {
    private usersSubject = new BehaviorSubject<User[]>([]);
    public users$ = this.usersSubject.asObservable();

    private filteredUsersSubject = new BehaviorSubject<User[]>([]);
    public filteredUsers$ = this.filteredUsersSubject.asObservable();

    private statsSubject = new BehaviorSubject<UserStats>({
        totalUsers: 0,
        superAdmins: 0,
        groupAdmins: 0,
        activeUsers: 0
    });
    public stats$ = this.statsSubject.asObservable();

    constructor() {
        this.loadUsers();
    }

    /**
     * Load users from localStorage or initialize with default data
     */
    private loadUsers(): void {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            const users: User[] = JSON.parse(storedUsers);
            this.usersSubject.next(users);
            this.updateStats(users);
            this.filterUsers(); // Apply initial filter
        } else {
            this.initializeDefaultUsers();
        }
    }

    /**
     * Initialize default users if none exist
     */
    private initializeDefaultUsers(): void {
        const defaultUsers: User[] = [
            {
                id: '1',
                username: 'super',
                email: 'super@example.com',
                roles: [UserRole.SUPER_ADMIN],
                groups: ['1', '2'], // Development Team, Design Team
                isActive: true,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date()
            },
            {
                id: '2',
                username: 'admin',
                email: 'admin@example.com',
                roles: [UserRole.GROUP_ADMIN],
                groups: ['1', '3'], // Development Team, Marketing Team
                isActive: true,
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date()
            },
            {
                id: '3',
                username: 'user',
                email: 'user@example.com',
                roles: [UserRole.USER],
                groups: ['1'], // Development Team
                isActive: true,
                createdAt: new Date('2025-02-01'),
                updatedAt: new Date()
            },
            {
                id: '4',
                username: 'john_doe',
                email: 'john@example.com',
                roles: [UserRole.USER],
                groups: ['2'], // Design Team
                isActive: true,
                createdAt: new Date('2025-02-15'),
                updatedAt: new Date()
            },
            {
                id: '5',
                username: 'jane_smith',
                email: 'jane@example.com',
                roles: [UserRole.GROUP_ADMIN],
                groups: ['3'], // Marketing Team
                isActive: false,
                createdAt: new Date('2025-01-20'),
                updatedAt: new Date()
            }
        ];

        localStorage.setItem('users', JSON.stringify(defaultUsers));
        this.usersSubject.next(defaultUsers);
        this.updateStats(defaultUsers);
        this.filterUsers();
    }

    /**
     * Update user statistics based on current users
     */
    private updateStats(users: User[]): void {
        const totalUsers = users.length;
        const superAdmins = users.filter(u => u.roles.includes(UserRole.SUPER_ADMIN)).length;
        const groupAdmins = users.filter(u => u.roles.includes(UserRole.GROUP_ADMIN)).length;
        const activeUsers = users.filter(u => u.isActive).length;

        this.statsSubject.next({
            totalUsers,
            superAdmins,
            groupAdmins,
            activeUsers
        });
    }

    /**
     * Filter users based on search term, role, and status
     */
    filterUsers(filters: UserFilters = { searchTerm: '', role: '', status: '' }): void {
        let filtered = this.usersSubject.value;

        // Search filter
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.roles.some(role => role.toLowerCase().includes(term))
            );
        }

        // Role filter
        if (filters.role) {
            filtered = filtered.filter(user =>
                user.roles.includes(filters.role as UserRole)
            );
        }

        // Status filter
        if (filters.status) {
            if (filters.status === 'active') {
                filtered = filtered.filter(user => user.isActive);
            } else if (filters.status === 'inactive') {
                filtered = filtered.filter(user => !user.isActive);
            }
        }

        this.filteredUsersSubject.next(filtered);
    }

    /**
     * Create a new user
     */
    createUser(userData: Partial<User>, currentUser: User): Promise<{ success: boolean; message: string; user?: User }> {
        return new Promise((resolve) => {
            try {
                const users = this.getStoredUsers();

                // Check for username conflicts
                if (users.some(u => u.username === userData.username)) {
                    resolve({ success: false, message: 'Username already exists' });
                    return;
                }

                // Check for email conflicts
                if (users.some(u => u.email === userData.email)) {
                    resolve({ success: false, message: 'Email already exists' });
                    return;
                }

                // Permission check for creating super admin
                if (userData.roles?.includes(UserRole.SUPER_ADMIN) && !currentUser.roles.includes(UserRole.SUPER_ADMIN)) {
                    resolve({ success: false, message: 'Only super admins can create super admin accounts' });
                    return;
                }

                const newUser: User = {
                    id: Date.now().toString(),
                    username: userData.username!,
                    email: userData.email!,
                    roles: userData.roles || [UserRole.USER],
                    groups: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                users.push(newUser);
                this.saveUsers(users);
                this.usersSubject.next(users);
                this.updateStats(users);
                this.filterUsers();

                resolve({ success: true, message: 'User created successfully', user: newUser });
            } catch (error) {
                console.error('Error creating user:', error);
                resolve({ success: false, message: 'Failed to create user. Please try again.' });
            }
        });
    }

    /**
     * Update an existing user
     */
    updateUser(userId: string, updates: Partial<User>, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const users = this.getStoredUsers();
                const userIndex = users.findIndex(u => u.id === userId);

                if (userIndex === -1) {
                    resolve({ success: false, message: 'User not found' });
                    return;
                }

                const user = users[userIndex];

                // Permission check
                if (!this.canEditUser(user, currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to edit this user' });
                    return;
                }

                // Check for username conflicts (excluding current user)
                if (updates.username && users.some((u, index) => index !== userIndex && u.username === updates.username)) {
                    resolve({ success: false, message: 'Username already exists' });
                    return;
                }

                // Check for email conflicts (excluding current user)
                if (updates.email && users.some((u, index) => index !== userIndex && u.email === updates.email)) {
                    resolve({ success: false, message: 'Email already exists' });
                    return;
                }

                // Permission check for role changes
                if (updates.roles?.includes(UserRole.SUPER_ADMIN) && !currentUser.roles.includes(UserRole.SUPER_ADMIN)) {
                    resolve({ success: false, message: 'Only super admins can assign super admin role' });
                    return;
                }

                // Update user
                users[userIndex] = {
                    ...user,
                    ...updates,
                    updatedAt: new Date()
                };

                this.saveUsers(users);
                this.usersSubject.next(users);
                this.updateStats(users);
                this.filterUsers();

                resolve({ success: true, message: 'User updated successfully' });
            } catch (error) {
                console.error('Error updating user:', error);
                resolve({ success: false, message: 'Failed to update user. Please try again.' });
            }
        });
    }

    /**
     * Delete a user
     */
    deleteUser(userId: string, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const users = this.getStoredUsers();
                const userToDelete = users.find(u => u.id === userId);

                if (!userToDelete) {
                    resolve({ success: false, message: 'User not found' });
                    return;
                }

                // Permission check
                if (!this.canDeleteUser(userToDelete, currentUser)) {
                    resolve({ success: false, message: 'You do not have permission to delete this user' });
                    return;
                }

                // Prevent deleting self
                if (userId === currentUser.id) {
                    resolve({ success: false, message: 'You cannot delete your own account' });
                    return;
                }

                const updatedUsers = users.filter(u => u.id !== userId);
                this.saveUsers(updatedUsers);
                this.usersSubject.next(updatedUsers);
                this.updateStats(updatedUsers);
                this.filterUsers();

                resolve({ success: true, message: 'User deleted successfully' });
            } catch (error) {
                console.error('Error deleting user:', error);
                resolve({ success: false, message: 'Failed to delete user. Please try again.' });
            }
        });
    }

    /**
     * Bulk delete users
     */
    bulkDeleteUsers(userIds: string[], currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                // Prevent deleting self
                if (userIds.includes(currentUser.id)) {
                    resolve({ success: false, message: 'You cannot delete your own account' });
                    return;
                }

                const users = this.getStoredUsers();
                const usersToDelete = users.filter(u => userIds.includes(u.id));

                // Permission check for all users
                for (const user of usersToDelete) {
                    if (!this.canDeleteUser(user, currentUser)) {
                        resolve({ success: false, message: `You do not have permission to delete user: ${user.username}` });
                        return;
                    }
                }

                const updatedUsers = users.filter(u => !userIds.includes(u.id));
                this.saveUsers(updatedUsers);
                this.usersSubject.next(updatedUsers);
                this.updateStats(updatedUsers);
                this.filterUsers();

                resolve({ success: true, message: `${userIds.length} users deleted successfully` });
            } catch (error) {
                console.error('Error bulk deleting users:', error);
                resolve({ success: false, message: 'Failed to delete users. Please try again.' });
            }
        });
    }

    /**
     * Bulk activate users
     */
    bulkActivateUsers(userIds: string[], currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const users = this.getStoredUsers();
                const updatedUsers = users.map(user => {
                    if (userIds.includes(user.id)) {
                        return { ...user, isActive: true, updatedAt: new Date() };
                    }
                    return user;
                });

                this.saveUsers(updatedUsers);
                this.usersSubject.next(updatedUsers);
                this.updateStats(updatedUsers);
                this.filterUsers();

                resolve({ success: true, message: `${userIds.length} users activated successfully` });
            } catch (error) {
                console.error('Error bulk activating users:', error);
                resolve({ success: false, message: 'Failed to activate users. Please try again.' });
            }
        });
    }

    /**
     * Check if current user can edit target user
     */
    canEditUser(targetUser: User, currentUser: User): boolean {
        if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
        if (currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            // Group admins can edit users but not other admins
            return !targetUser.roles.includes(UserRole.SUPER_ADMIN) && !targetUser.roles.includes(UserRole.GROUP_ADMIN);
        }
        return false;
    }

    /**
     * Check if current user can delete target user
     */
    canDeleteUser(targetUser: User, currentUser: User): boolean {
        if (currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
        if (currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            // Group admins can delete users but not other admins
            return !targetUser.roles.includes(UserRole.SUPER_ADMIN) && !targetUser.roles.includes(UserRole.GROUP_ADMIN);
        }
        return false;
    }

    /**
     * Check if current user can create super admin
     */
    canCreateSuperAdmin(currentUser: User): boolean {
        return currentUser.roles.includes(UserRole.SUPER_ADMIN);
    }

    /**
     * Get group name by ID
     */
    getGroupName(groupId: string): string {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const group = groups.find((g: any) => g.id === groupId);
        return group ? group.name : `Group ${groupId}`;
    }

    /**
     * Get role color for display
     */
    getRoleColor(role: UserRole): string {
        switch (role) {
            case UserRole.SUPER_ADMIN: return 'warn';
            case UserRole.GROUP_ADMIN: return 'primary';
            case UserRole.USER: return 'accent';
            default: return 'primary';
        }
    }

    /**
     * Get role icon for display
     */
    getRoleIcon(role: UserRole): string {
        switch (role) {
            case UserRole.SUPER_ADMIN: return 'admin_panel_settings';
            case UserRole.GROUP_ADMIN: return 'group_work';
            case UserRole.USER: return 'person';
            default: return 'help';
        }
    }

    /**
     * Get role display name
     */
    getRoleDisplayName(role: UserRole): string {
        switch (role) {
            case UserRole.SUPER_ADMIN: return 'Super Admin';
            case UserRole.GROUP_ADMIN: return 'Group Admin';
            case UserRole.USER: return 'User';
            default: return role;
        }
    }

    /**
     * Get status color for display
     */
    getStatusColor(isActive: boolean): string {
        return isActive ? 'primary' : 'warn';
    }

    /**
     * Get status icon for display
     */
    getStatusIcon(isActive: boolean): string {
        return isActive ? 'check_circle' : 'cancel';
    }

    private getStoredUsers(): User[] {
        const usersData = localStorage.getItem('users');
        return usersData ? JSON.parse(usersData) : [];
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem('users', JSON.stringify(users));
    }
}
