export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optional password for authentication
  token?: string; // JWT token for API authentication
  roles: UserRole[]; // Array of roles (can have multiple roles)
  role?: UserRole; // Single role for backward compatibility
  groups: string[]; // Array of group IDs
  createdAt: Date;
  updatedAt: Date;
  avatarUrl?: string;
  isActive: boolean;
  canRemove?: boolean; // Flag to indicate if user can be removed from group
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  GROUP_ADMIN = 'group_admin',
  USER = 'user'
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

export interface UserStats {
  totalUsers: number;
  superAdmins: number;
  groupAdmins: number;
  activeUsers: number;
}

export interface UserFilters {
  searchTerm: string;
  role: UserRole | 'all';
  isActive: boolean | 'all';
  sortBy: 'username' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
}