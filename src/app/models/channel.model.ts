export interface Channel {
  id: string;
  name: string;
  description: string;
  groupId: string; // Parent group ID
  type: ChannelType; // Channel type (text, voice, video)
  createdBy: string; // User ID of creator
  members: string[]; // Array of member user IDs
  admins: string[]; // Array of admin user IDs
  bannedUsers: string[]; // Array of banned user IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isPrivate: boolean; // Whether the channel is private
  memberCount?: number; // Optional member count for display
  maxMembers?: number; // Optional max members limit
  avatarUrl?: string;
  settings?: ChannelSettings; // Channel settings
  lastMessage?: {
    id: string;
    channelId: string;
    userId: string;
    username: string;
    text: string;
    createdAt: Date;
    avatarUrl: string;
  };
}

export interface ChannelSettings {
  slowMode: number; // Slow mode delay in seconds
  requireApproval: boolean; // Require approval for new members
  allowReactions: boolean; // Allow reactions on messages
  allowPolls: boolean; // Allow polls in channel
}

export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
  VIDEO = 'video'
}

export interface ChannelCreation {
  name: string;
  description: string;
  groupId: string;
  type: ChannelType;
  maxMembers?: number;
  avatarUrl?: string;
  lastMessage?: string;
}

export interface ChannelUpdate {
  name?: string;
  description?: string;
  type?: ChannelType;
  maxMembers?: number;
  avatarUrl?: string;
  lastMessage?: string;
}

export interface ChannelStats {
  totalChannels: number;
  activeChannels: number;
  textChannels: number;
  voiceChannels: number;
  videoChannels: number;
}

export interface ChannelFilters {
  searchTerm: string;
  groupId: string;
  channelType: ChannelType | 'all';
  isActive: boolean | 'all';
  sortBy: 'name' | 'createdAt' | 'memberCount';
  sortOrder: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClientChannelFilters {
  searchTerm: string;
  groupId: string;
  channelType: ChannelType | 'all';
  sortBy: 'name' | 'createdAt' | 'memberCount';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}