import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GroupInterestRequest, GroupRequestsStats } from '../models/group.model';
import { AuthService } from './auth.service';

export interface GroupRequestResponse {
    success: boolean;
    data: any;
    message?: string;
}

export interface GroupRequestsPaginatedResponse {
    success: boolean;
    data: {
        requests: GroupInterestRequest[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GroupRequestService {
    private apiUrl = `${environment.apiUrl}/group-requests`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get auth headers for requests
     */
    private getAuthHeaders(): HttpHeaders {
        return this.authService.getAuthHeaders();
    }

    /**
     * Get all group requests with pagination
     */
    getGroupRequests(options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        groupId?: string;
        requestType?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}): Observable<GroupRequestsPaginatedResponse> {
        const params = new URLSearchParams();

        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.search) params.append('search', options.search);
        if (options.status) params.append('status', options.status);
        if (options.groupId) params.append('groupId', options.groupId);
        if (options.requestType) params.append('requestType', options.requestType);
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortOrder) params.append('sortOrder', options.sortOrder);

        return this.http.get<GroupRequestsPaginatedResponse>(`${this.apiUrl}?${params.toString()}`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Get group request statistics
     */
    getGroupRequestStats(): Observable<GroupRequestResponse> {
        return this.http.get<GroupRequestResponse>(`${this.apiUrl}/stats`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Approve a group request
     */
    approveRequest(requestId: string, reason?: string): Observable<GroupRequestResponse> {
        return this.http.post<GroupRequestResponse>(`${this.apiUrl}/${requestId}/approve`, {
            reason
        }, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Reject a group request
     */
    rejectRequest(requestId: string, reason?: string): Observable<GroupRequestResponse> {
        return this.http.post<GroupRequestResponse>(`${this.apiUrl}/${requestId}/reject`, {
            reason
        }, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Get a specific group request
     */
    getGroupRequest(requestId: string): Observable<GroupRequestResponse> {
        return this.http.get<GroupRequestResponse>(`${this.apiUrl}/${requestId}`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Create a group request (for users)
     */
    createGroupRequest(requestData: {
        groupId: string;
        requestType: 'register_interest' | 'request_invite';
        message?: string;
    }): Observable<GroupRequestResponse> {
        return this.http.post<GroupRequestResponse>(`${this.apiUrl}`, requestData, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Delete a group request
     */
    deleteRequest(requestId: string): Observable<GroupRequestResponse> {
        return this.http.delete<GroupRequestResponse>(`${this.apiUrl}/${requestId}`, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Bulk approve requests
     */
    bulkApproveRequests(requestIds: string[], reason?: string): Observable<GroupRequestResponse> {
        return this.http.post<GroupRequestResponse>(`${this.apiUrl}/bulk/approve`, {
            requestIds,
            reason
        }, {
            headers: this.getAuthHeaders()
        });
    }

    /**
     * Bulk reject requests
     */
    bulkRejectRequests(requestIds: string[], reason?: string): Observable<GroupRequestResponse> {
        return this.http.post<GroupRequestResponse>(`${this.apiUrl}/bulk/reject`, {
            requestIds,
            reason
        }, {
            headers: this.getAuthHeaders()
        });
    }
}
