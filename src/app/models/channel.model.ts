export interface Channel {
  id: string;
  name: string;
  description: string;
  groupId: string; // Parent group ID
  type: ChannelType; // Channel type (text, voice, video)
  createdBy: string; // User ID of creator
  members: string[]; // Array of member user IDs
  bannedUsers: string[]; // Array of banned user IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  memberCount?: number; // Optional member count for display
  maxMembers?: number; // Optional max members limit
  avatarUrl?: string;
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
