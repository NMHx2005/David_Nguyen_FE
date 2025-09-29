export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optional password for authentication
  roles: UserRole[]; // Array of roles (can have multiple roles)
  role?: UserRole; // Single role for backward compatibility
  groups: string[]; // Array of group IDs
  createdAt: Date;
  updatedAt: Date;
  avatarUrl?: string;
  isActive: boolean;
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
