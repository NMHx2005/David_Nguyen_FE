import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { GroupService } from '../../../../services/group.service';
import { User } from '../../../../models/user.model';

export interface GroupMember {
    userId: string;
    username: string;
    role: 'admin' | 'member';
    joinedAt: string;
}

export interface MemberManagementResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Group Member Management Service
 * Handles all group member operations
 */
@Injectable({
    providedIn: 'root'
})
export class GroupMemberService {
    private membersSubject = new BehaviorSubject<GroupMember[]>([]);
    public members$ = this.membersSubject.asObservable();

    constructor(private groupService: GroupService) { }

    /**
     * Add member to group
     */
    addMember(groupId: string, memberData: { userId: string; username: string }): Observable<MemberManagementResponse> {
        return this.groupService.addMember(groupId, memberData)
            .pipe(
                catchError(error => {
                    console.error('Error adding member:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Remove member from group
     */
    removeMember(groupId: string, userId: string): Observable<MemberManagementResponse> {
        return this.groupService.removeMember(groupId, userId)
            .pipe(
                catchError(error => {
                    console.error('Error removing member:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Get group members
     */
    getGroupMembers(groupId: string): Observable<MemberManagementResponse> {
        return this.groupService.getGroupMembers(groupId)
            .pipe(
                catchError(error => {
                    console.error('Error getting group members:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Update member role
     */
    updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Observable<MemberManagementResponse> {
        return this.groupService.updateMemberRole(groupId, userId, role)
            .pipe(
                catchError(error => {
                    console.error('Error updating member role:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Check if user is member of group
     */
    isMember(groupId: string, userId?: string): Observable<{ success: boolean; data: boolean }> {
        return this.groupService.isMember(groupId, userId)
            .pipe(
                catchError(error => {
                    console.error('Error checking membership:', error);
                    throw error;
                })
            );
    }

    /**
     * Check if user is admin of group
     */
    isAdmin(groupId: string, userId?: string): Observable<{ success: boolean; data: boolean }> {
        return this.groupService.isAdmin(groupId, userId)
            .pipe(
                catchError(error => {
                    console.error('Error checking admin status:', error);
                    throw error;
                })
            );
    }

    /**
     * Update local members state
     */
    updateMembersState(members: GroupMember[]): void {
        this.membersSubject.next(members);
    }

    /**
     * Get current members state
     */
    getCurrentMembers(): GroupMember[] {
        return this.membersSubject.value;
    }
}
