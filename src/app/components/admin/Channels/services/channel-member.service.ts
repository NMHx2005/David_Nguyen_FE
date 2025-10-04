import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChannelService } from '../../../../services/channel.service';

export interface MemberManagementResponse {
    success: boolean;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChannelMemberService {

    constructor(private channelService: ChannelService) { }

    /**
     * Add member to channel
     */
    addMember(channelId: string, userId: string): Observable<MemberManagementResponse> {
        return this.channelService.addMember(channelId, userId)
            .pipe(
                catchError(error => {
                    console.error('Error adding member:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Remove member from channel
     */
    removeMember(channelId: string, userId: string): Observable<MemberManagementResponse> {
        return this.channelService.removeMember(channelId, userId)
            .pipe(
                catchError(error => {
                    console.error('Error removing member:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Get channel members
     */
    getChannelMembers(channelId: string): Observable<any> {
        return this.channelService.getChannelMembers(channelId)
            .pipe(
                catchError(error => {
                    console.error('Error getting channel members:', error);
                    throw error;
                })
            );
    }

    /**
     * Join channel
     */
    joinChannel(channelId: string): Observable<MemberManagementResponse> {
        return this.channelService.joinChannel(channelId)
            .pipe(
                catchError(error => {
                    console.error('Error joining channel:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Leave channel
     */
    leaveChannel(channelId: string): Observable<MemberManagementResponse> {
        return this.channelService.leaveChannel(channelId)
            .pipe(
                catchError(error => {
                    console.error('Error leaving channel:', error);
                    throw error;
                })
            ) as Observable<MemberManagementResponse>;
    }

    /**
     * Check if user is member of channel
     */
    isMember(channelId: string, userId?: string): Observable<{ success: boolean; data: boolean }> {
        return this.channelService.isMember(channelId, userId);
    }
}
