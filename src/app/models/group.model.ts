export interface Group {
  id: string;
  name: string;
  description: string;
  category: string; // Group category (technology, business, education, etc.)
  status: GroupStatus; // Group status (active, inactive, pending)
  createdBy: string; // User ID of creator
  admins: string[]; // Array of admin user IDs
  members: string[]; // Array of member user IDs
  channels: string[]; // Array of channel IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  memberCount?: number; // Optional member count for display
  maxMembers?: number; // Optional max members limit
}

export enum GroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface GroupCreation {
  name: string;
  description: string;
  category: string;
  maxMembers?: number;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  category?: string;
  maxMembers?: number;
}
