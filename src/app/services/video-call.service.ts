import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface VideoCall {
    _id: string;
    callerId: string;
    callerName: string;
    receiverId: string;
    receiverName: string;
    channelId: string;
    status: 'initiated' | 'answered' | 'rejected' | 'ended' | 'failed';
    startTime: string;
    endTime?: string;
    duration?: number;
    recordingUrl?: string;
    qualityMetrics?: CallQualityMetrics;
}

export interface CallQualityMetrics {
    audioLevel: number;
    videoBitrate: number;
    audioBitrate: number;
    packetLoss: number;
    latency: number;
    resolution: string;
    frameRate: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface VideoCallCreate {
    receiverId: string;
    channelId: string;
}

export interface VideoCallResponse {
    success: boolean;
    data: VideoCall;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VideoCallService {
    private readonly API_URL = `${environment.apiUrl}/video-calls`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    createCall(callData: VideoCallCreate): Observable<VideoCallResponse> {
        return this.http.post<VideoCallResponse>(`${this.API_URL}`, callData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    getCallById(callId: string): Observable<VideoCallResponse> {
        return this.http.get<VideoCallResponse>(`${this.API_URL}/${callId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    answerCall(callId: string): Observable<VideoCallResponse> {
        return this.http.post<VideoCallResponse>(`${this.API_URL}/${callId}/answer`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    rejectCall(callId: string): Observable<VideoCallResponse> {
        return this.http.post<VideoCallResponse>(`${this.API_URL}/${callId}/reject`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    endCall(callId: string): Observable<VideoCallResponse> {
        return this.http.post<VideoCallResponse>(`${this.API_URL}/${callId}/end`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    getCallHistory(options: {
        limit?: number;
        offset?: number;
        status?: string;
    } = {}): Observable<{ success: boolean; data: VideoCall[]; message?: string }> {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        if (options.status) params.append('status', options.status);

        return this.http.get<{ success: boolean; data: VideoCall[]; message?: string }>(`${this.API_URL}/history?${params}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    startRecording(callId: string): Observable<VideoCallResponse> {
        return this.http.post<VideoCallResponse>(`${this.API_URL}/${callId}/recording/start`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    stopRecording(callId: string): Observable<VideoCallResponse> {
        return this.http.post<VideoCallResponse>(`${this.API_URL}/${callId}/recording/stop`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    updateCallQuality(callId: string, qualityMetrics: CallQualityMetrics): Observable<VideoCallResponse> {
        return this.http.put<VideoCallResponse>(`${this.API_URL}/${callId}/quality`, qualityMetrics, {
            headers: this.authService.getAuthHeaders()
        });
    }

    getCallRecording(callId: string): Observable<Blob> {
        return this.http.get(`${this.API_URL}/${callId}/recording`, {
            headers: this.authService.getAuthHeaders(),
            responseType: 'blob'
        });
    }
}