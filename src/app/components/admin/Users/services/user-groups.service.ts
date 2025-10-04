import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

export interface Group {
    _id: string;
    name: string;
    description: string;
    category: string;
    members: Array<{
        userId: string;
        username: string;
        role: 'admin' | 'member';
        joinedAt: Date;
    }>;
    admins: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface GroupResponse {
    success: boolean;
    data: Group[];
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserGroupsService {
    private readonly API_URL = `${environment.apiUrl}/groups`;
    private groupsCache = new BehaviorSubject<Group[]>([]);
    public groups$ = this.groupsCache.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.loadGroups();
    }

    /**
     * Load all groups
     */
    private loadGroups(): void {
        this.http.get<GroupResponse>(this.API_URL, {
            headers: this.authService.getAuthHeaders()
        }).subscribe({
            next: (response) => {
                if (response.success) {
                    this.groupsCache.next(response.data);
                }
            },
            error: (error) => {
                console.error('Error loading groups:', error);
            }
        });
    }

    /**
     * Get group by ID
     */
    getGroupById(groupId: string): Group | null {
        const groups = this.groupsCache.value;
        return groups.find(group => group._id === groupId) || null;
    }

    /**
     * Get group name by ID
     */
    getGroupName(groupId: string): string {
        const group = this.getGroupById(groupId);
        return group ? group.name : `Group ${groupId.slice(-4)}`;
    }

    /**
     * Refresh groups cache
     */
    refreshGroups(): void {
        this.loadGroups();
    }

    /**
     * Get groups for a specific user
     */
    getUserGroups(userId: string): Observable<Group[]> {
        return this.http.get<GroupResponse>(`${environment.apiUrl}/admin/users/${userId}/groups`, {
            headers: this.authService.getAuthHeaders()
        }).pipe(
            map(response => response.success ? response.data : [])
        );
    }
}
