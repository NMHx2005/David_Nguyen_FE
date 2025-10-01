import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models';

/**
 * Application route configuration
 * - Uses lazy-loaded standalone components for better performance
 * - Protects private areas with AuthGuard and role-based access via RoleGuard
 */
export const routes: Routes = [
  // Root redirects to home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // Public pages
  {
    path: 'home',
    loadComponent: () => import('./components/client/Home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/Login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/Register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'test-auth',
    loadComponent: () => import('./components/test-auth.component').then(m => m.TestAuthComponent)
  },

  // Authenticated client pages
  {
    path: 'profile',
    loadComponent: () => import('./components/client/Profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/Chat/chat.component').then(m => m.ChatComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'realtime-chat',
    loadComponent: () => import('./components/chat/RealtimeChat/realtime-chat.component').then(m => m.RealtimeChatComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'channels',
    loadComponent: () => import('./components/client/Channels/channels.component').then(m => m.ChannelsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'groups',
    loadComponent: () => import('./components/client/Groups/group-interest.component').then(m => m.GroupInterestComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'groups/:groupId',
    loadComponent: () => import('./components/client/Groups/client-group-detail.component').then(m => m.ClientGroupDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    // Deep link into a group's channel in chat view
    path: 'group/:groupId/channel/:channelId',
    loadComponent: () => import('./components/chat/Chat/chat.component').then(m => m.ChatComponent),
    canActivate: [AuthGuard]
  },
  {
    // Interest/registration flows within groups (limited to standard users)
    path: 'groups/interest',
    loadComponent: () => import('./components/client/Groups/group-interest.component').then(m => m.GroupInterestComponent),
    canActivate: [AuthGuard],
    data: { roles: [UserRole.USER] }
  },

  // Admin area (requires authentication and admin roles)
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] },
    loadComponent: () => import('./components/admin/admin-layout.component').then(m => m.SimpleAdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin/Dashboard/admin-dashboard.component').then(m => m.SimpleAdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/Users/manage-users.component').then(m => m.ManageUsersComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'groups',
        loadComponent: () => import('./components/admin/Groups/manage-groups.component').then(m => m.ManageGroupsComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'groups/:id',
        loadComponent: () => import('./components/admin/Groups/admin-group-detail.component').then(m => m.AdminGroupDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'groups/:groupId/edit',
        loadComponent: () => import('./components/admin/Groups/edit-group.component').then(m => m.EditGroupComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'channels',
        loadComponent: () => import('./components/admin/Channels/manage-channels.component').then(m => m.ManageChannelsComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'channels/:channelId/edit',
        loadComponent: () => import('./components/admin/Channels/edit-channel.component').then(m => m.EditChannelComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'groups/:groupId/channels',
        loadComponent: () => import('./components/admin/Channels/manage-channels.component').then(m => m.ManageChannelsComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      },
      {
        path: 'group-requests',
        loadComponent: () => import('./components/admin/GroupRequests/manage-group-requests.component').then(m => m.ManageGroupRequestsComponent),
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GROUP_ADMIN, UserRole.SUPER_ADMIN] }
      }
    ]
  },

  // Fallback: unknown routes -> home
  {
    path: '**',
    redirectTo: '/home'
  }
];
