// Export all services for easy importing
export { AuthService } from './auth.service';
export { UserService } from './user.service';
export { GroupService } from './group.service';
export { ChannelService } from './channel.service';
export { MessageService } from './message.service';
export { AdminService } from './admin.service';
export { SocketService } from './socket.service';
export { UploadService } from './upload.service';
export { ClientService } from './client.service';
export { VideoCallService } from './video-call.service';
export { AvatarService } from './avatar.service';

// Export interfaces for type safety
export type { LoginRequest, RegisterRequest, AuthResponse } from './auth.service';
export type { User } from '../models/user.model';
export type { UserCreate, UserUpdate, UserResponse, UsersListResponse } from './user.service';
export type { Group, GroupCreate, GroupUpdate, GroupResponse, GroupsListResponse } from './group.service';
export type { Channel, ChannelCreate, ChannelUpdate, ChannelResponse, ChannelsListResponse } from './channel.service';
export type { Message, MessageCreate, MessageUpdate, MessageResponse, MessagesListResponse } from './message.service';
export type { DashboardStats, SystemStats, UserActivity, GroupStats, ChannelStats } from './admin.service';
export type { SocketMessage, UserPresence, ChannelJoin, ChannelLeave, TypingIndicator } from './socket.service';
export type { UploadProgress, UploadResponse, AvatarUploadResponse, ImageUploadResponse } from './upload.service';
export type { ClientProfile, Notification, ClientStats, ClientResponse } from './client.service';
export type { VideoCall, VideoCallCreate, VideoCallResponse } from './video-call.service';
export type { AvatarInfo } from './avatar.service';
