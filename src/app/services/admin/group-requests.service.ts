import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../../models/user.model';
import { Group } from '../../models/group.model';

export interface GroupInterestRequest {
    id: string;
    groupId: string;
    groupName: string;
    userId: string;
    username: string;
    requestType: 'register_interest' | 'request_invite';
    requestedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy: string | null;
    reviewedAt: Date | null;
}

export interface GroupRequestsStats {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
}

@Injectable({
    providedIn: 'root'
})
export class GroupRequestsService {
    private requestsSubject = new BehaviorSubject<GroupInterestRequest[]>([]);
    public requests$ = this.requestsSubject.asObservable();

    private statsSubject = new BehaviorSubject<GroupRequestsStats>({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
    });
    public stats$ = this.statsSubject.asObservable();

    constructor() {
        this.loadRequests();
    }

    /**
     * Load all join/invite requests from localStorage
     */
    private loadRequests(): void {
        const storedRequests = localStorage.getItem('groupInterestRequests');
        if (storedRequests) {
            const requests = JSON.parse(storedRequests).map((req: any) => ({
                ...req,
                requestedAt: new Date(req.requestedAt),
                reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : null
            }));
            this.requestsSubject.next(requests);
            this.updateStats(requests);
        } else {
            this.initializeDefaultRequests();
        }
    }

    /**
     * Initialize default requests if none exist
     */
    private initializeDefaultRequests(): void {
        const defaultRequests: GroupInterestRequest[] = [
            {
                id: '1',
                groupId: '1',
                groupName: 'Development Team',
                userId: '4',
                username: 'john_doe',
                requestType: 'register_interest',
                requestedAt: new Date('2025-01-10'),
                status: 'pending',
                reviewedBy: null,
                reviewedAt: null
            },
            {
                id: '2',
                groupId: '2',
                groupName: 'Design Team',
                userId: '5',
                username: 'jane_smith',
                requestType: 'request_invite',
                requestedAt: new Date('2025-01-12'),
                status: 'approved',
                reviewedBy: '2',
                reviewedAt: new Date('2025-01-13')
            },
            {
                id: '3',
                groupId: '1',
                groupName: 'Development Team',
                userId: '6',
                username: 'bob_wilson',
                requestType: 'register_interest',
                requestedAt: new Date('2025-01-14'),
                status: 'rejected',
                reviewedBy: '1',
                reviewedAt: new Date('2025-01-15')
            }
        ];

        localStorage.setItem('groupInterestRequests', JSON.stringify(defaultRequests));
        this.requestsSubject.next(defaultRequests);
        this.updateStats(defaultRequests);
    }

    /**
     * Update statistics based on current requests
     */
    private updateStats(requests: GroupInterestRequest[]): void {
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(r => r.status === 'pending').length;
        const approvedRequests = requests.filter(r => r.status === 'approved').length;
        const rejectedRequests = requests.filter(r => r.status === 'rejected').length;

        this.statsSubject.next({
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests
        });
    }

    /**
     * Approve a user's request to join a group
     */
    approveRequest(request: GroupInterestRequest, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const requests = this.getStoredRequests();
                const requestIndex = requests.findIndex(r => r.id === request.id);

                if (requestIndex === -1) {
                    resolve({ success: false, message: 'Request not found' });
                    return;
                }

                // Update request status
                requests[requestIndex].status = 'approved';
                requests[requestIndex].reviewedBy = currentUser.id;
                requests[requestIndex].reviewedAt = new Date();

                // Add user to group
                this.addUserToGroup(request.userId, request.groupId, request.groupName);

                // Add group to user's groups list
                this.addGroupToUser(request.userId, request.groupId);

                // Remove from pending requests
                this.removeFromPendingRequests(request.userId, request.groupId);

                // Save changes
                this.saveRequests(requests);

                resolve({
                    success: true,
                    message: `Request approved! ${request.username} has been added to "${request.groupName}"`
                });
            } catch (error) {
                console.error('Error approving request:', error);
                resolve({ success: false, message: 'Failed to approve request. Please try again.' });
            }
        });
    }

    /**
     * Reject a user's request to join a group
     */
    rejectRequest(request: GroupInterestRequest, currentUser: User): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve) => {
            try {
                const requests = this.getStoredRequests();
                const requestIndex = requests.findIndex(r => r.id === request.id);

                if (requestIndex === -1) {
                    resolve({ success: false, message: 'Request not found' });
                    return;
                }

                // Update request status
                requests[requestIndex].status = 'rejected';
                requests[requestIndex].reviewedBy = currentUser.id;
                requests[requestIndex].reviewedAt = new Date();

                // Remove from pending requests
                this.removeFromPendingRequests(request.userId, request.groupId);

                // Save changes
                this.saveRequests(requests);

                resolve({
                    success: true,
                    message: `Request rejected for ${request.username}`
                });
            } catch (error) {
                console.error('Error rejecting request:', error);
                resolve({ success: false, message: 'Failed to reject request. Please try again.' });
            }
        });
    }

    /**
     * Add user to group (creates group if missing)
     */
    private addUserToGroup(userId: string, groupId: string, groupName?: string): void {
        const groups = this.getStoredGroups();
        let groupIndex = groups.findIndex((g: any) => g.id === groupId);

        if (groupIndex === -1) {
            // Create minimal group if not found
            const newGroup: Group = {
                id: groupId,
                name: groupName || `Group ${groupId}`,
                description: '',
                category: 'general',
                status: 'active' as any,
                createdBy: 'system',
                admins: ['system'],
                members: [],
                channels: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                maxMembers: 100
            };
            groups.push(newGroup);
            groupIndex = groups.length - 1;
        }

        // Add user to group members if not already a member
        if (!Array.isArray(groups[groupIndex].members)) {
            groups[groupIndex].members = [];
        }
        if (!groups[groupIndex].members.includes(userId)) {
            groups[groupIndex].members.push(userId);
            groups[groupIndex].updatedAt = new Date();
        }

        localStorage.setItem('groups', JSON.stringify(groups));
    }

    /**
     * Add group to user's groups list
     */
    private addGroupToUser(userId: string, groupId: string): void {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex((u: any) => u.id === userId);

        if (userIndex > -1) {
            if (!Array.isArray(users[userIndex].groups)) {
                users[userIndex].groups = [];
            }
            if (!users[userIndex].groups.includes(groupId)) {
                users[userIndex].groups.push(groupId);
            }
            users[userIndex].updatedAt = new Date();
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    /**
     * Remove request from user's pending requests
     */
    private removeFromPendingRequests(userId: string, groupId: string): void {
        const pendingRequests = JSON.parse(localStorage.getItem(`pendingRequests_${userId}`) || '[]');
        const updatedRequests = pendingRequests.filter((id: string) => id !== groupId);
        localStorage.setItem(`pendingRequests_${userId}`, JSON.stringify(updatedRequests));
    }

    /**
     * Get reviewer name by ID
     */
    getReviewerName(reviewerId: string | null): string {
        if (!reviewerId) return 'Unknown';
        const users = this.getStoredUsers();
        const reviewer = users.find((u: any) => u.id === reviewerId);
        return reviewer ? reviewer.username : 'Unknown';
    }

    /**
     * Format date for display
     */
    formatDate(date: Date | null): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get request type color
     */
    getRequestTypeColor(type: string): string {
        switch (type) {
            case 'register_interest': return 'primary';
            case 'request_invite': return 'accent';
            default: return 'primary';
        }
    }

    /**
     * Get request type icon
     */
    getRequestTypeIcon(type: string): string {
        switch (type) {
            case 'register_interest': return 'person_add';
            case 'request_invite': return 'mail';
            default: return 'help';
        }
    }

    /**
     * Get request type label
     */
    getRequestTypeLabel(type: string): string {
        switch (type) {
            case 'register_interest': return 'Register Interest';
            case 'request_invite': return 'Request Invite';
            default: return 'Unknown';
        }
    }

    /**
     * Get status color
     */
    getStatusColor(status: string): string {
        switch (status) {
            case 'pending': return 'warn';
            case 'approved': return 'primary';
            case 'rejected': return 'accent';
            default: return 'primary';
        }
    }

    /**
     * Get status icon
     */
    getStatusIcon(status: string): string {
        switch (status) {
            case 'pending': return 'pending';
            case 'approved': return 'check_circle';
            case 'rejected': return 'cancel';
            default: return 'help';
        }
    }

    /**
     * Get status label
     */
    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return 'Pending';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return 'Unknown';
        }
    }

    private getStoredRequests(): GroupInterestRequest[] {
        const stored = localStorage.getItem('groupInterestRequests');
        return stored ? JSON.parse(stored) : [];
    }

    private saveRequests(requests: GroupInterestRequest[]): void {
        localStorage.setItem('groupInterestRequests', JSON.stringify(requests));
        this.requestsSubject.next(requests);
        this.updateStats(requests);
    }

    private getStoredGroups(): any[] {
        const stored = localStorage.getItem('groups');
        return stored ? JSON.parse(stored) : [];
    }

    private getStoredUsers(): any[] {
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : [];
    }
}
