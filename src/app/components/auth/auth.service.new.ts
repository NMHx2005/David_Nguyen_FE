import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../../models';
import { Router } from '@angular/router';
import { ApiService, LoginRequest, RegisterRequest } from '../../services/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private router: Router,
        private apiService: ApiService
    ) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error parsing user data from storage:', error);
                this.clearUserData();
            }
        }
    }

    /**
     * Ensure the current user is loaded from storage when subject is empty.
     * Useful for guard re-entrancy on lazy routes.
     * @returns true if a valid user was loaded or already present; otherwise false.
     */
    public ensureUserLoaded(): boolean {
        if (this.currentUserSubject.value) return true;
        const userData = localStorage.getItem('current_user');
        if (!userData) return false;
        try {
            const user = JSON.parse(userData);
            this.currentUserSubject.next(user);
            return true;
        } catch (error) {
            console.error('Error parsing user data from storage:', error);
            this.clearUserData();
            return false;
        }
    }

    async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await this.apiService.login({ username, password }).toPromise();

            if (response?.success && response.data) {
                const { user, accessToken, refreshToken } = response.data;

                // Store tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Convert API user to our User model
                const userModel: User = {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles as UserRole[],
                    groups: [], // Will be loaded separately
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true
                };

                this.setUserData(userModel);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            // Fallback to mock authentication for development
            return this.mockLogin(username, password);
        }
    }

    private mockLogin(username: string, password: string): boolean {
        if (username === 'super' && password === '123') {
            const user: User = {
                id: '1',
                username: 'super',
                email: 'super@example.com',
                roles: [UserRole.SUPER_ADMIN],
                groups: ['1', '2'],
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date(),
                isActive: true
            };

            this.setUserData(user);
            return true;
        } else if (username === 'admin' && password === '123') {
            const user: User = {
                id: '2',
                username: 'admin',
                email: 'admin@example.com',
                roles: [UserRole.GROUP_ADMIN],
                groups: ['1', '3'],
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date(),
                isActive: true
            };

            this.setUserData(user);
            return true;
        } else if (username === 'user' && password === '123') {
            const user: User = {
                id: '3',
                username: 'user',
                email: 'user@example.com',
                roles: [UserRole.USER],
                groups: ['1'],
                createdAt: new Date('2025-02-01'),
                updatedAt: new Date(),
                isActive: true
            };

            this.setUserData(user);
            return true;
        }

        return false;
    }

    async register(userData: RegisterRequest): Promise<boolean> {
        try {
            const response = await this.apiService.register(userData).toPromise();

            if (response?.success && response.data) {
                const { user, accessToken, refreshToken } = response.data;

                // Store tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Convert API user to our User model
                const userModel: User = {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles as UserRole[],
                    groups: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true
                };

                this.setUserData(userModel);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    }

    async logout(): Promise<void> {
        try {
            await this.apiService.logout().toPromise();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearUserData();
            this.router.navigate(['/login']);
        }
    }

    private setUserData(user: User): void {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    private clearUserData(): void {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return this.currentUserSubject.value !== null;
    }

    hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        return user ? user.roles.includes(role) : false;
    }

    hasAnyRole(roles: UserRole[]): boolean {
        const user = this.getCurrentUser();
        return user ? roles.some(role => user.roles.includes(role)) : false;
    }

    isSuperAdmin(): boolean {
        return this.hasRole(UserRole.SUPER_ADMIN);
    }

    isGroupAdmin(): boolean {
        return this.hasRole(UserRole.GROUP_ADMIN);
    }

    isUser(): boolean {
        return this.hasRole(UserRole.USER);
    }

    // Mock user storage for Phase 1
    private getStoredUsers(): User[] {
        const usersData = localStorage.getItem('registeredUsers');
        return usersData ? JSON.parse(usersData) : [];
    }

    private saveStoredUsers(users: User[]): void {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    // Mock register for Phase 1
    async registerMock(userData: { username: string; email: string; password: string }): Promise<boolean> {
        const users = this.getStoredUsers();

        // Check if user already exists
        if (users.find(u => u.username === userData.username || u.email === userData.email)) {
            return false;
        }

        const newUser: User = {
            id: `user_${Date.now()}`,
            username: userData.username,
            email: userData.email,
            roles: [UserRole.USER],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        users.push(newUser);
        this.saveStoredUsers(users);
        return true;
    }
}
