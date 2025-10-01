import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group, GroupStatus } from '../../../../models/group.model';
import { User } from '../../../../models/user.model';

export interface GroupsFilters {
    searchTerm: string;
    selectedCategory: string;
    selectedStatus: string;
}

export interface GroupInterestRequest {
    id: string;
    groupId: string;
    groupName: string;
    userId: string;
    username: string;
    requestType: 'register_interest' | 'request_invite';
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GroupsInterestService {
    private groupsSubject = new BehaviorSubject<Group[]>([]);
    private filtersSubject = new BehaviorSubject<GroupsFilters>({
        searchTerm: '',
        selectedCategory: '',
        selectedStatus: ''
    });
    private currentPageSubject = new BehaviorSubject<number>(1);
    private itemsPerPageSubject = new BehaviorSubject<number>(12);
    private pendingRequestsSubject = new BehaviorSubject<string[]>([]);
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public groups$ = this.groupsSubject.asObservable();
    public filters$ = this.filtersSubject.asObservable();
    public currentPage$ = this.currentPageSubject.asObservable();
    public itemsPerPage$ = this.itemsPerPageSubject.asObservable();
    public pendingRequests$ = this.pendingRequestsSubject.asObservable();
    public currentUser$ = this.currentUserSubject.asObservable();

    public filteredGroups$: Observable<Group[]> = combineLatest([
        this.groups$,
        this.filters$,
        this.currentUser$
    ]).pipe(
        map(([groups, filters, currentUser]) => {
            return this.filterGroups(groups, filters, currentUser);
        })
    );

    public paginatedGroups$: Observable<Group[]> = combineLatest([
        this.filteredGroups$,
        this.currentPage$,
        this.itemsPerPage$
    ]).pipe(
        map(([groups, currentPage, itemsPerPage]) => {
            return this.paginateGroups(groups, currentPage, itemsPerPage);
        })
    );

    public totalPages$: Observable<number> = combineLatest([
        this.filteredGroups$,
        this.itemsPerPage$
    ]).pipe(
        map(([groups, itemsPerPage]) => {
            return Math.ceil(groups.length / itemsPerPage) || 1;
        })
    );

    constructor() {
        this.loadGroups();
        this.loadPendingRequests();
    }

    setCurrentUser(user: User | null): void {
        this.currentUserSubject.next(user);
        // Reload pending requests for the new user
        if (user) {
            const pendingRequests = this.getPendingRequestsForUser(user.id);
            this.pendingRequestsSubject.next(pendingRequests);
        } else {
            this.pendingRequestsSubject.next([]);
        }
    }

    updateFilters(filters: GroupsFilters): void {
        this.filtersSubject.next(filters);
        this.currentPageSubject.next(1); // Reset to first page when filtering
    }

    setCurrentPage(page: number): void {
        this.currentPageSubject.next(page);
    }

    async registerInterest(groupId: string): Promise<boolean> {
        try {
            const currentUser = this.currentUserSubject.value;
            if (!currentUser) return false;

            // Check if already has a pending request
            const existingRequest = this.getExistingRequest(groupId, currentUser.id);
            if (existingRequest) {
                return false; // Already requested
            }

            // Get group name
            const group = this.groupsSubject.value.find(g => g.id === groupId);
            if (!group) return false;

            // Create new request object
            const newRequest: GroupInterestRequest = {
                id: `req_${Date.now()}`,
                groupId: groupId,
                groupName: group.name,
                userId: currentUser.id,
                username: currentUser.username,
                requestType: 'register_interest',
                requestedAt: new Date().toISOString(),
                status: 'pending'
            };

            // Add to requests
            const allRequests = this.loadAllRequests();
            allRequests.push(newRequest);
            this.saveAllRequests(allRequests);

            // Update pending requests for UI
            const pendingRequests = this.getPendingRequestsForUser(currentUser.id);
            this.pendingRequestsSubject.next(pendingRequests);

            return true;
        } catch (error) {
            console.error('Failed to register interest:', error);
            return false;
        }
    }

    async requestInvite(groupId: string): Promise<boolean> {
        // For now, treat request invite same as register interest
        return this.registerInterest(groupId);
    }

    getUserGroups(): Observable<{ groups: Group[] }> {
        return this.currentUser$.pipe(
            map(currentUser => {
                if (!currentUser) {
                    return { groups: [] };
                }

                const allGroups = this.groupsSubject.value;
                const userGroups = allGroups.filter(group =>
                    group.members?.includes(currentUser.id)
                );

                return { groups: userGroups };
            })
        );
    }

    private filterGroups(groups: Group[], filters: GroupsFilters, currentUser: User | null): Group[] {
        return groups.filter(group => {
            // Search filter
            const matchesSearch = !filters.searchTerm ||
                group.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (group.description && group.description.toLowerCase().includes(filters.searchTerm.toLowerCase()));

            // Category filter
            const matchesCategory = !filters.selectedCategory ||
                group.category?.toLowerCase() === filters.selectedCategory.toLowerCase();

            // Status filter
            const matchesStatus = !filters.selectedStatus ||
                this.getStatusLabel(group.status).toLowerCase().includes(filters.selectedStatus.toLowerCase());

            // Don't show groups the user is already a member of
            const notMember = !currentUser || !group.members?.includes(currentUser.id);

            return matchesSearch && matchesCategory && matchesStatus && notMember;
        });
    }

    private paginateGroups(groups: Group[], currentPage: number, itemsPerPage: number): Group[] {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return groups.slice(startIndex, endIndex);
    }

    private getStatusLabel(status: GroupStatus | string): string {
        const s = (typeof status === 'string') ? status.toString().toUpperCase() : status;
        switch (s) {
            case GroupStatus.ACTIVE:
            case 'ACTIVE':
                return 'Active';
            case GroupStatus.INACTIVE:
            case 'INACTIVE':
                return 'Inactive';
            case GroupStatus.PENDING:
            case 'PENDING':
                return 'Pending';
            default:
                return 'Unknown';
        }
    }

    private loadGroups(): void {
        const storedGroups = localStorage.getItem('groups');
        if (storedGroups) {
            const raw = JSON.parse(storedGroups);
            const normalizeStatus = (s: any): GroupStatus => {
                const up = (typeof s === 'string') ? s.toUpperCase() : s;
                switch (up) {
                    case 'ACTIVE': return GroupStatus.ACTIVE;
                    case 'INACTIVE': return GroupStatus.INACTIVE;
                    case 'PENDING': return GroupStatus.PENDING;
                    default: return GroupStatus.ACTIVE;
                }
            };

            const groups: Group[] = (Array.isArray(raw) ? raw : []).map((g: any) => ({
                id: g.id,
                name: g.name,
                description: g.description || '',
                status: normalizeStatus(g.status),
                category: g.category || 'general',
                members: Array.isArray(g.members) ? g.members : [],
                admins: Array.isArray(g.admins) ? g.admins : [],
                channels: Array.isArray(g.channels) ? g.channels : [],
                createdBy: g.createdBy || '',
                createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
                updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
                isActive: g.isActive !== false,
                memberCount: g.memberCount || 0,
                maxMembers: g.maxMembers || 50
            }));

            this.groupsSubject.next(groups);
        } else {
            this.initializeDefaultGroups();
        }
    }

    private loadPendingRequests(): void {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
            const pendingRequests = this.getPendingRequestsForUser(currentUser.id);
            this.pendingRequestsSubject.next(pendingRequests);
        }
    }

    private loadAllRequests(): GroupInterestRequest[] {
        const stored = localStorage.getItem('groupInterestRequests');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing groupInterestRequests:', error);
                return [];
            }
        }
        return [];
    }

    private saveAllRequests(requests: GroupInterestRequest[]): void {
        localStorage.setItem('groupInterestRequests', JSON.stringify(requests));
    }

    private getPendingRequestsForUser(userId: string): string[] {
        const allRequests = this.loadAllRequests();
        return allRequests
            .filter(req => req.userId === userId && req.status === 'pending')
            .map(req => req.groupId);
    }

    private getExistingRequest(groupId: string, userId: string): GroupInterestRequest | undefined {
        const allRequests = this.loadAllRequests();
        return allRequests.find(req =>
            req.groupId === groupId &&
            req.userId === userId &&
            (req.status === 'pending' || req.status === 'approved')
        );
    }

    private initializeDefaultGroups(): void {
        const defaultGroups: Group[] = [
            {
                id: '1',
                name: 'Web Development Team',
                description: 'A group for web developers to collaborate and share knowledge about modern web technologies.',
                category: 'development',
                status: GroupStatus.ACTIVE,
                members: ['user1', 'user2'],
                admins: ['admin1'],
                channels: ['channel1', 'channel2'],
                createdBy: 'admin1',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-20'),
                isActive: true,
                memberCount: 2,
                maxMembers: 50
            },
            {
                id: '2',
                name: 'UI/UX Designers',
                description: 'Creative minds working on user interface and experience design.',
                category: 'design',
                status: GroupStatus.ACTIVE,
                members: ['user3', 'user4'],
                admins: ['admin2'],
                channels: ['channel3'],
                createdBy: 'admin2',
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-05'),
                isActive: true,
                memberCount: 2,
                maxMembers: 30
            },
            {
                id: '3',
                name: 'Marketing Champions',
                description: 'Marketing professionals sharing strategies and campaigns.',
                category: 'marketing',
                status: GroupStatus.PENDING,
                members: ['user5'],
                admins: ['admin3'],
                channels: ['channel4'],
                createdBy: 'admin3',
                createdAt: new Date('2024-02-10'),
                updatedAt: new Date('2024-02-12'),
                isActive: true,
                memberCount: 1,
                maxMembers: 25
            }
        ];

        this.groupsSubject.next(defaultGroups);
        localStorage.setItem('groups', JSON.stringify(defaultGroups));
    }
}
