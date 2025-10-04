import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoCallService } from '../../services/video-call.service';
import { AuthService } from '../../auth/auth.service';
import { VideoCallComponent } from './video-call.component';

describe('VideoCallComponent', () => {
    let component: VideoCallComponent;
    let fixture: ComponentFixture<VideoCallComponent>;
    let mockVideoCallService: jasmine.SpyObj<VideoCallService>;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<VideoCallComponent>>;

    beforeEach(async () => {
        const videoCallServiceSpy = jasmine.createSpyObj('VideoCallService', [
            'initializePeer', 'startCall', 'answerCall', 'rejectCall', 'endCall',
            'toggleCamera', 'toggleMicrophone', 'toggleScreenShare'
        ]);
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [VideoCallComponent],
            providers: [
                { provide: VideoCallService, useValue: videoCallServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(VideoCallComponent);
        component = fixture.componentInstance;
        mockVideoCallService = TestBed.inject(VideoCallService) as jasmine.SpyObj<VideoCallService>;
        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VideoCallComponent>>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial values', () => {
        expect(component.currentCall).toBeNull();
        expect(component.localStream).toBeNull();
        expect(component.remoteStream).toBeNull();
        expect(component.isLoading).toBeFalse();
        expect(component.errorMessage).toBe('');
        expect(component.isCameraOn).toBeTrue();
        expect(component.isMicrophoneOn).toBeTrue();
    });

    it('should initialize video call on init', async () => {
        const mockUser = { id: 'user1', username: 'testuser' };
        mockAuthService.getCurrentUser.and.returnValue(mockUser);
        mockVideoCallService.initializePeer.and.returnValue(Promise.resolve());

        await component.ngOnInit();

        expect(mockVideoCallService.initializePeer).toHaveBeenCalledWith('user1');
    });

    it('should start call', async () => {
        const receiverId = 'receiver1';
        const receiverName = 'Receiver';
        mockVideoCallService.startCall.and.returnValue(Promise.resolve());

        await component.startCall(receiverId, receiverName);

        expect(mockVideoCallService.startCall).toHaveBeenCalledWith(receiverId, receiverName, undefined);
    });

    it('should answer call', async () => {
        mockVideoCallService.answerCall.and.returnValue(Promise.resolve());

        await component.answerCall();

        expect(mockVideoCallService.answerCall).toHaveBeenCalled();
    });

    it('should reject call', () => {
        component.rejectCall();

        expect(mockVideoCallService.rejectCall).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should end call', () => {
        component.endCall();

        expect(mockVideoCallService.endCall).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should toggle camera', async () => {
        mockVideoCallService.toggleCamera.and.returnValue(Promise.resolve());

        await component.toggleCamera();

        expect(mockVideoCallService.toggleCamera).toHaveBeenCalled();
        expect(component.isCameraOn).toBeFalse();
    });

    it('should toggle microphone', async () => {
        mockVideoCallService.toggleMicrophone.and.returnValue(Promise.resolve());

        await component.toggleMicrophone();

        expect(mockVideoCallService.toggleMicrophone).toHaveBeenCalled();
        expect(component.isMicrophoneOn).toBeFalse();
    });

    it('should toggle screen share', async () => {
        mockVideoCallService.toggleScreenShare.and.returnValue(Promise.resolve());

        await component.toggleScreenShare();

        expect(mockVideoCallService.toggleScreenShare).toHaveBeenCalled();
        expect(mockSnackBar.open).toHaveBeenCalledWith('Screen sharing started', 'Close', { duration: 3000 });
    });

    it('should get call status text', () => {
        component.currentCall = {
            id: 'call1',
            callerId: 'user1',
            callerName: 'Caller',
            receiverId: 'user2',
            receiverName: 'Receiver',
            status: 'calling'
        } as any;

        expect(component.getCallStatusText()).toBe('Calling...');
    });

    it('should clear error', () => {
        component.errorMessage = 'Test error';
        component.clearError();
        expect(component.errorMessage).toBe('');
    });
});
