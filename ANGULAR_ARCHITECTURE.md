# Angular Architecture Documentation - Chat System

## 🏗️ Project Structure

```
src/app/
├── app.component.ts              # Root component
├── app.config.ts                 # Application configuration
├── app.routes.ts                 # Route definitions
├── components/                   # Feature components
│   ├── layouts/                  # Layout components
│   │   ├── admin-layout.component.ts
│   │   └── client-layout.component.ts
│   ├── auth/                     # Authentication components
│   │   ├── login.component.ts
│   │   └── register.component.ts
│   ├── admin/                    # Admin management components
│   │   ├── admin-dashboard.component.ts
│   │   ├── manage-users.component.ts
│   │   ├── manage-groups.component.ts
│   │   ├── manage-channels.component.ts
│   │   ├── admin-group-detail.component.ts
│   │   ├── edit-group.component.ts
│   │   ├── edit-channel.component.ts
│   │   └── manage-group-requests.component.ts
│   ├── chat/                     # Chat functionality
│   │   └── chat.component.ts
│   ├── channels/                 # Channel management
│   │   └── channels.component.ts
│   ├── groups/                   # Group management
│   │   ├── group-interest.component.ts
│   │   └── client-group-detail.component.ts
│   ├── home/                     # Landing page
│   │   └── home.component.ts
│   └── profile/                  # User profile
│       └── profile.component.ts
├── guards/                       # Route guards
│   ├── auth.guard.ts
│   └── role.guard.ts
├── models/                       # TypeScript interfaces
│   ├── user.model.ts
│   ├── group.model.ts
│   ├── channel.model.ts
│   ├── message.model.ts
│   └── index.ts
└── services/                     # Business logic services
    └── auth.service.ts
```

## 🎯 Component Architecture

### Layout Components

#### AdminLayoutComponent
**Purpose**: Provides consistent layout for admin pages
**Features**:
- Collapsible sidebar navigation
- Header with user info and logout
- Main content area with router-outlet
- Responsive design

**Key Properties**:
```typescript
@Input() pageTitle: string = '';
```

**Template Structure**:
```html
<div class="admin-layout">
  <mat-sidenav-container>
    <mat-sidenav #sidenav mode="side" opened>
      <!-- Sidebar navigation -->
    </mat-sidenav>
    <mat-sidenav-content>
      <mat-toolbar>
        <!-- Header content -->
      </mat-toolbar>
      <main>
        <ng-content></ng-content>
      </main>
    </mat-sidenav-content>
  </mat-sidenav-container>
</div>
```

#### ClientLayoutComponent
**Purpose**: Provides consistent layout for client pages
**Features**:
- Sticky header with navigation
- Footer with links
- Main content area
- Mobile-responsive design

### Authentication Components

#### LoginComponent
**Purpose**: User authentication interface
**Features**:
- Form validation with Angular Reactive Forms
- Demo account quick login
- Error handling and success messages
- Responsive design

**Key Methods**:
```typescript
onSubmit(): Promise<void>          // Handle form submission
useDemoAccount(username: string, password: string): void  // Quick login
```

#### RegisterComponent
**Purpose**: User registration interface
**Features**:
- Form validation with custom validators
- Password confirmation matching
- Username uniqueness checking
- Success/error feedback

### Admin Components

#### AdminDashboardComponent
**Purpose**: Main admin dashboard with statistics and quick actions
**Features**:
- Statistics cards with real-time data
- Quick action buttons
- Recent activity feed
- Responsive grid layout

**Key Properties**:
```typescript
totalUsers: number = 0;
totalGroups: number = 0;
totalChannels: number = 0;
newUsersThisWeek: number = 0;
```

#### ManageUsersComponent
**Purpose**: User management interface for admins
**Features**:
- Data table with pagination
- Search and filter functionality
- Bulk operations (select multiple users)
- User role management
- User status toggle

**Key Methods**:
```typescript
filterUsers(): void                // Filter users based on search/filter criteria
toggleUserSelection(userId: string): void  // Toggle user selection
bulkDelete(): Promise<void>        // Delete selected users
promoteUser(user: User): Promise<void>  // Promote user to admin
```

#### AdminGroupDetailComponent
**Purpose**: Detailed group management interface
**Features**:
- Tabbed interface (Overview, Members, Channels, Settings)
- Member management (add/remove)
- Channel creation and management
- Group settings editing

**Key Methods**:
```typescript
addMember(): void                  // Add member to group
removeMember(member: User): void   // Remove member from group
createChannel(): void              // Create new channel
```

### Chat Components

#### ChatComponent
**Purpose**: Main chat interface
**Features**:
- 3-column layout (groups, messages, info)
- Real-time messaging (Phase 2)
- Message history
- User presence indicators

## 🔐 Guards Architecture

### AuthGuard
**Purpose**: Protects routes requiring authentication
**Implementation**:
```typescript
canActivate(): boolean {
  if (!this.authService.isAuthenticated()) {
    this.authService.ensureUserLoaded();
  }
  
  if (this.authService.isAuthenticated()) {
    return true;
  } else {
    this.router.navigate(['/login']);
    return false;
  }
}
```

### RoleGuard
**Purpose**: Protects routes based on user roles
**Implementation**:
```typescript
canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  if (!this.authService.isAuthenticated()) {
    this.authService.ensureUserLoaded();
  }

  const requiredRoles = route.data['roles'] as UserRole[];
  const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
  
  if (hasRequiredRole) {
    return true;
  } else {
    // Redirect based on user role
    this.router.navigate(['/admin']); // or appropriate page
    return false;
  }
}
```

## 🏛️ Service Architecture

### AuthService
**Purpose**: Handles authentication and user session management
**Key Features**:
- User login/logout
- User registration
- Session persistence
- Role-based permissions
- Mock authentication (Phase 1)

**Key Methods**:
```typescript
login(username: string, password: string): Promise<boolean>
register(userData: UserRegistration): Promise<boolean>
logout(): void
isAuthenticated(): boolean
hasRole(role: UserRole): boolean
hasAnyRole(roles: UserRole[]): boolean
```

**State Management**:
```typescript
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
```

## 📊 Data Models

### User Model
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  groups: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  avatarUrl?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  GROUP_ADMIN = 'group_admin',
  USER = 'user'
}
```

### Group Model
```typescript
export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  status: GroupStatus;
  createdBy: string;
  admins: string[];
  members: string[];
  channels: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  memberCount?: number;
  maxMembers?: number;
}
```

### Channel Model
```typescript
export interface Channel {
  id: string;
  name: string;
  description: string;
  groupId: string;
  type: ChannelType;
  createdBy: string;
  members: string[];
  bannedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  memberCount?: number;
  maxMembers?: number;
}
```

## 🛣️ Routing Architecture

### Route Structure
```typescript
export const routes: Routes = [
  // Public routes
  { path: 'home', loadComponent: () => import('./components/home/home.component') },
  { path: 'login', loadComponent: () => import('./components/auth/login.component') },
  { path: 'register', loadComponent: () => import('./components/auth/register.component') },
  
  // Protected client routes
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component'),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'chat', 
    loadComponent: () => import('./components/chat/chat.component'),
    canActivate: [AuthGuard] 
  },
  
  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] },
    children: [
      { path: '', loadComponent: () => import('./components/admin/admin-dashboard.component') },
      { path: 'users', loadComponent: () => import('./components/admin/manage-users.component') },
      { path: 'groups', loadComponent: () => import('./components/admin/manage-groups.component') }
    ]
  }
];
```

### Lazy Loading
All components use lazy loading for better performance:
```typescript
loadComponent: () => import('./components/path/component').then(m => m.ComponentName)
```

## 🎨 UI/UX Architecture

### Material Design Integration
- Angular Material components throughout
- Consistent theming and styling
- Responsive breakpoints
- Accessibility features

### Component Styling Strategy
- Component-scoped styles
- SCSS for advanced styling
- CSS Grid and Flexbox for layouts
- Mobile-first responsive design

### State Management
- Service-based state management
- BehaviorSubject for reactive updates
- LocalStorage for persistence (Phase 1)
- Future: NgRx for complex state (Phase 2)

## 🔄 Data Flow Architecture

### Authentication Flow
```
User Login → AuthService.login() → Validate Credentials → 
Set User Data → Update BehaviorSubject → Navigate to Dashboard
```

### Component Communication
```
Parent Component → @Input() → Child Component
Child Component → @Output() → Parent Component
Service → BehaviorSubject → Multiple Components
```

### Data Persistence (Phase 1)
```
Component Action → Service Method → localStorage → 
Update BehaviorSubject → UI Update
```

## 🚀 Performance Optimizations

### Lazy Loading
- All routes use lazy loading
- Reduces initial bundle size
- Improves load time

### OnPush Change Detection
- Components use OnPush strategy where appropriate
- Reduces unnecessary change detection cycles
- Improves performance

### TrackBy Functions
- List components use trackBy functions
- Prevents unnecessary DOM updates
- Improves rendering performance

## 🔧 Development Patterns

### Component Lifecycle
```typescript
export class ComponentName implements OnInit, OnDestroy {
  ngOnInit(): void {
    // Initialize component
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions
  }
}
```

### Error Handling
```typescript
try {
  const result = await this.service.method();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

### Form Handling
```typescript
// Reactive Forms
this.form = this.fb.group({
  field: ['', [Validators.required, Validators.minLength(3)]]
});

// Template-driven Forms
[(ngModel)]="model.property"
```

## 📱 Responsive Design

### Breakpoints
```scss
// Mobile First Approach
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

### Grid System
```scss
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

## 🔒 Security Considerations

### Input Validation
- Client-side validation with Angular validators
- Server-side validation (Phase 2)
- XSS prevention

### Route Protection
- AuthGuard for authentication
- RoleGuard for authorization
- Route-level security

### Data Sanitization
- Angular's built-in sanitization
- Safe HTML rendering
- Input sanitization

## 🧪 Testing Strategy

### Unit Testing
- Component testing with Angular Testing Utilities
- Service testing with mocked dependencies
- Guard testing with router mocks

### Integration Testing
- Component interaction testing
- Service integration testing
- Route testing

### E2E Testing
- User flow testing
- Cross-browser testing
- Performance testing

## 📈 Future Enhancements (Phase 2)

### State Management
- NgRx for complex state management
- Effects for side effects
- Selectors for data selection

### Real-time Features
- Socket.io integration
- WebSocket service
- Real-time updates

### Advanced Features
- File upload service
- Image processing
- Advanced search
- Analytics integration
