import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
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
    const userData = localStorage.getItem('currentUser');
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
    // Mock authentication for Phase 1
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

    // Try local registered users (Phase 1 mock auth)
    try {
      const users = this.getStoredUsers();
      console.log('Stored users:', users); // Debug log

      const existing = users.find(u => u.username === username || u.email === username);
      console.log('Found user:', existing); // Debug log

      if (existing) {
        const isValidPassword = this.validateUserPassword(existing.id, password);
        console.log('Password valid:', isValidPassword); // Debug log

        if (isValidPassword) {
          this.setUserData(existing);
          return true;
        }
      }
    } catch (e) {
      console.error('Local login error:', e);
    }
    return false;
  }

  async register(userData: { username: string; email: string; password: string }): Promise<boolean> {
    try {
      // Check if username already exists
      const isUnique = await this.checkUsernameUnique(userData.username);
      if (!isUnique) {
        return false;
      }

      // Create new user (mock implementation for Phase 1)
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        roles: [UserRole.USER],
        groups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Store user in localStorage (mock database)
      const existingUsers = this.getStoredUsers();
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      // Store mock credential separately
      this.storeUserPassword(newUser.id, userData.password);

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  async checkUsernameUnique(username: string): Promise<boolean> {
    try {
      const storedUsers = this.getStoredUsers();
      const existingUser = storedUsers.find(user => user.username === username);
      return !existingUser;
    } catch (error) {
      console.error('Username check error:', error);
      return false;
    }
  }

  private getStoredUsers(): User[] {
    try {
      const usersData = localStorage.getItem('users');
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Error parsing users from storage:', error);
      return [];
    }
  }

  private setUserData(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Store a mock password for a user in localStorage (Phase 1 only).
   */
  private storeUserPassword(userId: string, password: string): void {
    try {
      localStorage.setItem(`cred_${userId}`, JSON.stringify({ password }));
    } catch (e) {
      console.error('Failed to store user credential', e);
    }
  }

  /**
   * Validate provided password against stored mock credential.
   */
  private validateUserPassword(userId: string, password: string): boolean {
    try {
      const raw = localStorage.getItem(`cred_${userId}`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed?.password === password;
    } catch (e) {
      console.error('Failed to validate user credential', e);
      return false;
    }
  }

  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  logout(): void {
    this.clearUserData();
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
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

  canAccessAdminFeatures(): boolean {
    return this.isSuperAdmin() || this.isGroupAdmin();
  }

  canManageUsers(): boolean {
    return this.isSuperAdmin() || this.isGroupAdmin();
  }

  canManageGroups(): boolean {
    return this.isSuperAdmin() || this.isGroupAdmin();
  }

  canManageChannels(): boolean {
    return this.isSuperAdmin() || this.isGroupAdmin();
  }

  canPromoteUsers(): boolean {
    return this.isSuperAdmin();
  }

  canDeleteUsers(): boolean {
    return this.isSuperAdmin();
  }

  canBanUsersFromChannels(): boolean {
    return this.isSuperAdmin() || this.isGroupAdmin();
  }

  isUserActive(): boolean {
    const user = this.getCurrentUser();
    return user ? user.isActive : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.isActive) return false;

    switch (permission) {
      case 'manage_users':
        return this.canManageUsers();
      case 'manage_groups':
        return this.canManageGroups();
      case 'manage_channels':
        return this.canManageChannels();
      case 'promote_users':
        return this.canPromoteUsers();
      case 'delete_users':
        return this.canDeleteUsers();
      case 'ban_users':
        return this.canBanUsersFromChannels();
      case 'admin_access':
        return this.canAccessAdminFeatures();
      default:
        return false;
    }
  }
}
