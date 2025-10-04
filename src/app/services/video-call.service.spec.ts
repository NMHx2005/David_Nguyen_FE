import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VideoCallService } from './video-call.service';
import { AuthService } from './auth.service';

describe('VideoCallService', () => {
    let service: VideoCallService;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthService', ['getAuthHeaders']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                VideoCallService,
                { provide: AuthService, useValue: authSpy }
            ]
        });
        service = TestBed.inject(VideoCallService);
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a video call', () => {
        const callData = {
            receiverId: 'receiver-id',
            channelId: 'channel-id'
        };
        spyOn(service, 'createCall').and.callThrough();
        service.createCall(callData);
        expect(service.createCall).toHaveBeenCalledWith(callData);
    });

    it('should get call by id', () => {
        const callId = 'call-id';
        spyOn(service, 'getCallById').and.callThrough();
        service.getCallById(callId);
        expect(service.getCallById).toHaveBeenCalledWith(callId);
    });

    it('should answer a call', () => {
        const callId = 'call-id';
        spyOn(service, 'answerCall').and.callThrough();
        service.answerCall(callId);
        expect(service.answerCall).toHaveBeenCalledWith(callId);
    });

    it('should reject a call', () => {
        const callId = 'call-id';
        spyOn(service, 'rejectCall').and.callThrough();
        service.rejectCall(callId);
        expect(service.rejectCall).toHaveBeenCalledWith(callId);
    });

    it('should end a call', () => {
        const callId = 'call-id';
        spyOn(service, 'endCall').and.callThrough();
        service.endCall(callId);
        expect(service.endCall).toHaveBeenCalledWith(callId);
    });
});
