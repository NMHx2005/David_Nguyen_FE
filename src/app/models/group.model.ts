export interface GroupMember {
  userId: string;
  username: string;
  joinedAt: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category?: string; // Group category (technology, business, education, etc.)
  status?: GroupStatus; // Group status (active, inactive, pending)
  createdBy: string; // User ID of creator
  admins: string[]; // Array of admin user IDs
  members: GroupMember[] | string[]; // Array of member objects or member IDs
  channels?: string[]; // Array of channel IDs
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive?: boolean;
  memberCount?: number; // Optional member count for display
  maxMembers?: number; // Optional max members limit
  isJoined?: boolean; // Whether current user has joined this group
  tags?: string[]; // Array of tags for the group
  isPrivate?: boolean; // Whether the group is private or public
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

export interface GroupInterestRequest {
  id: string;
  userId: string;
  username: string;
  userEmail?: string;
  groupId: string;
  groupName: string;
  requestType: 'register_interest' | 'request_invite';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewerName?: string;
  reason?: string;
  message?: string;
}

export interface GroupRequestsStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}