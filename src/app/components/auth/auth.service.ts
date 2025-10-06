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
    const authToken = localStorage.getItem('auth_token');

    console.log('🔍 AuthService.loadUserFromStorage - localStorage check:', {
      current_user: userData ? 'exists' : null,
      auth_token: authToken ? 'exists' : null
    });

    if (userData) {
      try {
        const user = JSON.parse(userData);

        // Add token from auth_token if user doesn't have it
        if (!user.token && authToken) {
          user.token = authToken;
          console.log('🔍 AuthService.loadUserFromStorage - Added token to user from auth_token');
        }

        console.log('🔍 AuthService.loadUserFromStorage - Final user object:', {
          id: user.id,
          username: user.username,
          hasToken: !!user.token,
          tokenLength: user.token ? user.token.length : 0
        });

        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        this.clearUserData();
      }
    } else {
      console.log('🔍 AuthService.loadUserFromStorage - No user data in localStorage');
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
      console.log('🔍 AuthService.login - Attempting login with backend API');

      // Call backend API for authentication
      const response = await this.apiService.login({ username, password }).toPromise();

      if (response && response.success && response.data) {
        console.log('🔍 AuthService.login - Backend response:', response);

        // Convert backend user data to frontend User model
        const user: User = {
          id: response.data.user._id,
          username: response.data.user.username,
          email: response.data.user.email,
          token: response.data.accessToken,
          roles: response.data.user.roles.map((role: string) => {
            switch (role) {
              case 'super_admin': return UserRole.SUPER_ADMIN;
              case 'group_admin': return UserRole.GROUP_ADMIN;
              case 'user': return UserRole.USER;
              default: return UserRole.USER;
            }
          }),
          groups: response.data.user.groups || [],
          createdAt: new Date(response.data.user.createdAt),
          updatedAt: new Date(response.data.user.updatedAt),
          isActive: response.data.user.isActive
        };

        console.log('🔍 AuthService.login - Converted user object:', user);

        // Store tokens separately for refresh functionality
        localStorage.setItem('auth_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);

        this.setUserData(user);
        return true;
      } else {
        console.error('🔍 AuthService.login - Login failed:', response);
        return false;
      }
    } catch (error: any) {
      console.error('🔍 AuthService.login - Login error:', error);

      // If it's an account locked error (403), throw it so LoginComponent can handle it
      if (error.status === 403 || error.error?.message?.includes('locked')) {
        throw error;
      }

      return false;
    }
  }

  async register(userData: { username: string; email: string; password: string }): Promise<boolean> {
    try {
      console.log('🔍 AuthService.register - Attempting registration with backend API');

      // Call backend API for registration
      const response = await this.apiService.register({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password
      }).toPromise();

      if (response && response.success && response.data) {
        console.log('🔍 AuthService.register - Backend response:', response);

        // Convert backend user data to frontend User model
        const user: User = {
          id: response.data.user._id,
          username: response.data.user.username,
          email: response.data.user.email,
          token: response.data.accessToken,
          roles: response.data.user.roles.map((role: string) => {
            switch (role) {
              case 'super_admin': return UserRole.SUPER_ADMIN;
              case 'group_admin': return UserRole.GROUP_ADMIN;
              case 'user': return UserRole.USER;
              default: return UserRole.USER;
            }
          }),
          groups: response.data.user.groups || [],
          createdAt: new Date(response.data.user.createdAt),
          updatedAt: new Date(response.data.user.updatedAt),
          isActive: response.data.user.isActive
        };

        console.log('🔍 AuthService.register - Converted user object:', user);

        // Store tokens separately for refresh functionality
        localStorage.setItem('auth_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);

        this.setUserData(user);
        return true;
      } else {
        console.error('🔍 AuthService.register - Registration failed:', response);
        return false;
      }
    } catch (error) {
      console.error('🔍 AuthService.register - Registration error:', error);
      return false;
    }
  }

  async checkUsernameUnique(username: string): Promise<boolean> {
    // For now, we'll assume username is unique since backend will handle validation
    // In a real implementation, you might want to add a specific API endpoint for this
    return true;
  }

  private setUserData(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }


  private clearUserData(): void {
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  async logout(): Promise<void> {
    try {
      console.log('🔍 AuthService.logout - Attempting logout with backend API');

      // Call backend API for logout
      await this.apiService.logout().toPromise();

      console.log('🔍 AuthService.logout - Backend logout successful');
    } catch (error) {
      console.error('🔍 AuthService.logout - Backend logout error:', error);
      // Continue with local logout even if backend fails
    } finally {
      // Always clear local data
      this.clearUserData();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.log('🔍 AuthService.refreshToken - No refresh token found');
        return false;
      }

      console.log('🔍 AuthService.refreshToken - Attempting to refresh token');

      const response = await this.apiService.refreshToken().toPromise();

      if (response && response.success && response.data) {
        console.log('🔍 AuthService.refreshToken - Token refreshed successfully');

        // Update stored tokens
        localStorage.setItem('auth_token', response.data.accessToken);

        // Update current user token
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          currentUser.token = response.data.accessToken;
          this.setUserData(currentUser);
        }

        return true;
      } else {
        console.error('🔍 AuthService.refreshToken - Token refresh failed:', response);
        return false;
      }
    } catch (error) {
      console.error('🔍 AuthService.refreshToken - Token refresh error:', error);
      return false;
    }
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): { [key: string]: string } {
    const user = this.getCurrentUser();
    console.log('🔍 AuthService.getAuthHeaders - Current user:', user);
    console.log('🔍 AuthService.getAuthHeaders - User token:', user?.token);

    // Try to get token from user object first, then fallback to localStorage
    let token = user?.token;
    if (!token) {
      token = localStorage.getItem('auth_token') || undefined;
      console.log('🔍 AuthService.getAuthHeaders - Fallback token from localStorage:', token);
    }

    if (token) {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      console.log('🔍 AuthService.getAuthHeaders - Headers with token:', headers);
      return headers;
    }

    console.log('🔍 AuthService.getAuthHeaders - No token found, returning headers without auth');
    return {
      'Content-Type': 'application/json'
    };
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
