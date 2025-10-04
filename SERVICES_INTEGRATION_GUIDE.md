# Frontend Services Integration Guide

## Overview
This guide covers the Angular services created to integrate the frontend with the backend API. All services are designed to work seamlessly with the backend endpoints and provide type safety.

## Services Structure

### 1. AuthService (`auth.service.ts`)
**Purpose**: Handle authentication and user session management

**Key Features**:
- Login/Register functionality
- Token management with localStorage
- User profile management
- Role-based access control
- Password change and reset
- Automatic token refresh

**Usage**:
```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

// Login
this.authService.login({ email: 'user@example.com', password: 'password' })
  .subscribe(response => {
    if (response.success) {
      // User logged in successfully
    }
  });

// Check authentication
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Check roles
if (this.authService.isSuperAdmin()) {
  // User is super admin
}
```

### 2. UserService (`user.service.ts`)
**Purpose**: Manage user accounts and profiles

**Key Features**:
- CRUD operations for users
- User search and filtering
- Avatar upload
- User statistics
- Activity logs

**Usage**:
```typescript
import { UserService } from './services/user.service';

constructor(private userService: UserService) {}

// Get all users
this.userService.getAllUsers({ page: 1, limit: 10 })
  .subscribe(response => {
    console.log(response.data.users);
  });

// Upload avatar
this.userService.uploadAvatar(userId, file)
  .subscribe(response => {
    console.log('Avatar uploaded:', response.data);
  });
```

### 3. GroupService (`group.service.ts`)
**Purpose**: Manage groups and group memberships

**Key Features**:
- Group CRUD operations
- Member management
- Admin management
- Group search
- Statistics

**Usage**:
```typescript
import { GroupService } from './services/group.service';

constructor(private groupService: GroupService) {}

// Create group
this.groupService.createGroup({
  name: 'My Group',
  description: 'Group description',
  isPrivate: false
}).subscribe(response => {
  console.log('Group created:', response.data);
});

// Add member
this.groupService.addMember(groupId, { userId, username })
  .subscribe(response => {
    console.log('Member added:', response.data);
  });
```

### 4. ChannelService (`channel.service.ts`)
**Purpose**: Manage channels within groups

**Key Features**:
- Channel CRUD operations
- Member management
- Channel types (text, voice, video)
- Channel search
- Settings management

**Usage**:
```typescript
import { ChannelService } from './services/channel.service';

constructor(private channelService: ChannelService) {}

// Get channels by group
this.channelService.getChannelsByGroup(groupId)
  .subscribe(response => {
    console.log('Channels:', response.data);
  });

// Join channel
this.channelService.joinChannel(channelId)
  .subscribe(response => {
    console.log('Joined channel:', response.data);
  });
```

### 5. MessageService (`message.service.ts`)
**Purpose**: Handle chat messages and communication

**Key Features**:
- Send/receive messages
- Message search
- File and image messages
- Message editing/deletion
- Pagination support

**Usage**:
```typescript
import { MessageService } from './services/message.service';

constructor(private messageService: MessageService) {}

// Send text message
this.messageService.sendTextMessage(channelId, 'Hello!')
  .subscribe(response => {
    console.log('Message sent:', response.data);
  });

// Get messages
this.messageService.getMessagesByChannel(channelId, { limit: 50 })
  .subscribe(response => {
    console.log('Messages:', response.data);
  });
```

### 6. SocketService (`socket.service.ts`)
**Purpose**: Real-time communication using Socket.IO

**Key Features**:
- Real-time messaging
- User presence
- Typing indicators
- Video call signaling
- Connection management

**Usage**:
```typescript
import { SocketService } from './services/socket.service';

constructor(private socketService: SocketService) {}

// Connect to socket
this.socketService.connect();

// Listen for messages
this.socketService.message$.subscribe(message => {
  console.log('New message:', message);
});

// Send message
this.socketService.sendMessage({
  channelId: 'channel123',
  text: 'Hello!',
  type: 'text'
});
```

### 7. UploadService (`upload.service.ts`)
**Purpose**: Handle file uploads (avatars, images, files)

**Key Features**:
- Avatar upload
- Image upload for messages
- File upload with progress tracking
- File validation
- URL generation

**Usage**:
```typescript
import { UploadService } from './services/upload.service';

constructor(private uploadService: UploadService) {}

// Upload avatar with progress
this.uploadService.uploadAvatarWithProgress(file)
  .subscribe(result => {
    if (result.progress) {
      console.log('Upload progress:', result.progress.percentage);
    }
    if (result.response) {
      console.log('Upload complete:', result.response.data);
    }
  });
```

### 8. AdminService (`admin.service.ts`)
**Purpose**: Administrative functions and system management

**Key Features**:
- Dashboard statistics
- System monitoring
- User management
- Data export/import
- System health checks

**Usage**:
```typescript
import { AdminService } from './services/admin.service';

constructor(private adminService: AdminService) {}

// Get dashboard stats
this.adminService.getDashboardStats()
  .subscribe(response => {
    console.log('Dashboard stats:', response.data);
  });
```

### 9. ClientService (`client.service.ts`)
**Purpose**: Client-specific functionality and user preferences

**Key Features**:
- User profile management
- Notifications
- Activity logs
- Preferences
- Data export

**Usage**:
```typescript
import { ClientService } from './services/client.service';

constructor(private clientService: ClientService) {}

// Get notifications
this.clientService.getNotifications({ unreadOnly: true })
  .subscribe(response => {
    console.log('Unread notifications:', response.data);
  });
```

### 10. VideoCallService (`video-call.service.ts`)
**Purpose**: Video call management and signaling

**Key Features**:
- Call initiation
- Call management
- Call history
- Quality metrics

**Usage**:
```typescript
import { VideoCallService } from './services/video-call.service';

constructor(private videoCallService: VideoCallService) {}

// Create call
this.videoCallService.createCall({
  receiverId: 'user123',
  channelId: 'channel456'
}).subscribe(response => {
  console.log('Call created:', response.data);
});
```

## Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000'
};
```

And `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  socketUrl: 'https://your-api-domain.com'
};
```

## Error Handling

All services include proper error handling:

```typescript
this.userService.getUserById('123')
  .subscribe({
    next: (response) => {
      if (response.success) {
        console.log('User:', response.data);
      } else {
        console.error('Error:', response.message);
      }
    },
    error: (error) => {
      console.error('HTTP Error:', error);
    }
  });
```

## Type Safety

All services provide TypeScript interfaces for type safety:

```typescript
import { User, UserCreate, UserResponse } from './services';

const user: User = {
  _id: '123',
  username: 'john',
  email: 'john@example.com',
  roles: ['user'],
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};
```

## Best Practices

1. **Always check response.success** before using data
2. **Handle errors gracefully** with proper error messages
3. **Use observables properly** with unsubscribe in ngOnDestroy
4. **Validate data** before sending to API
5. **Use type safety** with provided interfaces
6. **Implement loading states** for better UX
7. **Cache data** when appropriate to reduce API calls

## Integration with Components

Example component integration:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, UserService, SocketService } from './services';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  users: any[] = [];
  messages: any[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    // Load users
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response.success) {
          this.users = response.data.users;
        }
      });

    // Listen for real-time messages
    this.socketService.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.messages.push(message);
      });

    // Connect to socket
    this.socketService.connect();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
  }
}
```

This comprehensive service layer provides a complete integration between the Angular frontend and the Node.js backend API, ensuring type safety, proper error handling, and real-time communication capabilities.
