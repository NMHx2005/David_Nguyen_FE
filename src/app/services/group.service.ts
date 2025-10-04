import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Group {
    _id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isActive: boolean;
    members: {
        userId: string;
        username: string;
        role: 'admin' | 'member';
        joinedAt: string;
    }[];
    admins: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface GroupCreate {
    name: string;
    description: string;
    isPrivate: boolean;
}

export interface GroupUpdate {
    name?: string;
    description?: string;
    isPrivate?: boolean;
    status?: string;
}

export interface GroupResponse {
    success: boolean;
    data: Group;
    message?: string;
}

export interface GroupsListResponse {
    success: boolean;
    data: {
        groups: Group[];
        total: number;
        page: number;
        pages: number;
    };
}

export interface UserGroupsResponse {
    success: boolean;
    data: Group[];
}

export interface GroupStatsResponse {
    success: boolean;
    data: {
        totalGroups: number;
        activeGroups: number;
        privateGroups: number;
        publicGroups: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    private readonly API_URL = `${environment.apiUrl}/groups`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get all groups
     */
    getAllGroups(options?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        category?: string;
    }): Observable<GroupsListResponse> {
        let url = `${this.API_URL}`;
        if (options) {
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page.toString());
            if (options.limit) params.append('limit', options.limit.toString());
            if (options.search) params.append('search', options.search);
            if (options.status) params.append('status', options.status);
            if (options.category) params.append('category', options.category);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        return this.http.get<GroupsListResponse>(url, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get groups that the current user has joined
     */
    getUserGroups(): Observable<UserGroupsResponse> {
        return this.http.get<UserGroupsResponse>(`${environment.apiUrl}/client/groups`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get group by ID
     */
    getGroupById(id: string): Observable<GroupResponse> {
        return this.http.get<GroupResponse>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Create new group
     */
    createGroup(groupData: GroupCreate): Observable<GroupResponse> {
        return this.http.post<GroupResponse>(`${this.API_URL}`, groupData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update group
     */
    updateGroup(id: string, groupData: GroupUpdate): Observable<GroupResponse> {
        return this.http.put<GroupResponse>(`${this.API_URL}/${id}`, groupData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Delete group
     */
    deleteGroup(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Add member to group
     */
    addMember(groupId: string, memberData: {
        userId: string;
        username: string;
    }): Observable<GroupResponse> {
        return this.http.post<GroupResponse>(`${this.API_URL}/${groupId}/members`, memberData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Remove member from group
     */
    removeMember(groupId: string, userId: string): Observable<GroupResponse> {
        return this.http.delete<GroupResponse>(`${this.API_URL}/${groupId}/members/${userId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Add admin to group (Super Admin only)
     */
    addAdmin(groupId: string, userId: string): Observable<GroupResponse> {
        return this.http.post<GroupResponse>(`${this.API_URL}/${groupId}/admins`, { userId }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Remove admin from group (Super Admin only)
     */
    removeAdmin(groupId: string, userId: string): Observable<GroupResponse> {
        return this.http.delete<GroupResponse>(`${this.API_URL}/${groupId}/admins/${userId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get groups for current user
     */
    getMyGroups(): Observable<UserGroupsResponse> {
        return this.http.get<UserGroupsResponse>(`${this.API_URL}/my-groups`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Join group
     */
    joinGroup(groupId: string): Observable<GroupResponse> {
        return this.http.post<GroupResponse>(`${this.API_URL}/${groupId}/join`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Leave group
     */
    leaveGroup(groupId: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/${groupId}/leave`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Search groups
     */
    searchGroups(query: string): Observable<GroupsListResponse> {
        return this.http.get<GroupsListResponse>(`${this.API_URL}/search?query=${encodeURIComponent(query)}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get group statistics (Admin only)
     */
    getGroupStats(): Observable<GroupStatsResponse> {
        return this.http.get<GroupStatsResponse>(`${this.API_URL}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Check if user is member of group
     */
    isMember(groupId: string, userId?: string): Observable<{ success: boolean; data: boolean }> {
        const targetUserId = userId || this.authService.getCurrentUser()?.id;
        return this.http.get<{ success: boolean; data: boolean }>(`${this.API_URL}/${groupId}/members/${targetUserId}/check`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Check if user is admin of group
     */
    isAdmin(groupId: string, userId?: string): Observable<{ success: boolean; data: boolean }> {
        const targetUserId = userId || this.authService.getCurrentUser()?.id;
        return this.http.get<{ success: boolean; data: boolean }>(`${this.API_URL}/${groupId}/admins/${targetUserId}/check`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Get group members
     */
    getGroupMembers(groupId: string): Observable<{
        success: boolean;
        data: {
            members: Group['members'];
            admins: string[];
        };
    }> {
        return this.http.get<{
            success: boolean;
            data: {
                members: Group['members'];
                admins: string[];
            };
        }>(`${this.API_URL}/${groupId}/members`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    /**
     * Update member role
     */
    updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Observable<GroupResponse> {
        return this.http.put<GroupResponse>(`${this.API_URL}/${groupId}/members/${userId}/role`, { role }, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
