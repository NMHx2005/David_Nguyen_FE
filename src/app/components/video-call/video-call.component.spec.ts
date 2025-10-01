import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';
import { VideoCallComponent } from './video-call.component';
import { VideoCallService } from '../../services/video-call.service';

describe('VideoCallComponent', () => {
    let component: VideoCallComponent;
    let fixture: ComponentFixture<VideoCallComponent>;
    let mockVideoCallService: jasmine.SpyObj<VideoCallService>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<VideoCallComponent>>;

    beforeEach(async () => {
        const videoCallServiceSpy = jasmine.createSpyObj('VideoCallService', [
            'acceptCall',
            'rejectCall',
            'endCall',
            'toggleVideo',
            'toggleAudio',
            'clearSubjects'
        ], {
            incomingCall$: new BehaviorSubject(null),
            callStatus$: new BehaviorSubject(null),
            localStream$: new BehaviorSubject(null),
            remoteStream$: new BehaviorSubject(null),
            callError$: new BehaviorSubject(null)
        });

        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [
                VideoCallComponent,
                MatButtonModule,
                MatIconModule,
                MatCardModule,
                MatProgressSpinnerModule,
                NoopAnimationsModule
            ],
            providers: [
                { provide: VideoCallService, useValue: videoCallServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(VideoCallComponent);
        component = fixture.componentInstance;
        mockVideoCallService = TestBed.inject(VideoCallService) as jasmine.SpyObj<VideoCallService>;
        mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VideoCallComponent>>;
    });

    beforeEach(() => {
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display incoming call UI when isIncomingCall is true', () => {
        component.isIncomingCall = true;
        component.incomingCall = {
            callId: 'call123',
            initiatorId: 'user1',
            initiatorUsername: 'testuser',
            channelId: 'channel1'
        };
        fixture.detectChanges();

        const incomingCallUI = fixture.debugElement.nativeElement.querySelector('.incoming-call-ui');
        expect(incomingCallUI).toBeTruthy();
    });

    it('should display active call UI when call is active', () => {
        component.isCallActive = true;
        component.callStatus = 'accepted';
        fixture.detectChanges();

        const activeCallUI = fixture.debugElement.nativeElement.querySelector('.active-call-ui');
        expect(activeCallUI).toBeTruthy();
    });

    it('should call acceptCall when accept button is clicked', () => {
        component.isIncomingCall = true;
        component.incomingCall = {
            callId: 'call123',
            initiatorId: 'user1',
            initiatorUsername: 'testuser',
            channelId: 'channel1'
        };
        fixture.detectChanges();

        const acceptButton = fixture.debugElement.nativeElement.querySelector('.call-button:last-child');
        acceptButton.click();

        expect(mockVideoCallService.acceptCall).toHaveBeenCalledWith('call123');
    });

    it('should call rejectCall when reject button is clicked', () => {
        component.isIncomingCall = true;
        component.incomingCall = {
            callId: 'call123',
            initiatorId: 'user1',
            initiatorUsername: 'testuser',
            channelId: 'channel1'
        };
        fixture.detectChanges();

        const rejectButton = fixture.debugElement.nativeElement.querySelector('.call-button:first-child');
        rejectButton.click();

        expect(mockVideoCallService.rejectCall).toHaveBeenCalledWith('call123');
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should call endCall when end call button is clicked', () => {
        component.isCallActive = true;
        fixture.detectChanges();

        const endButton = fixture.debugElement.nativeElement.querySelector('.end-call');
        endButton.click();

        expect(mockVideoCallService.endCall).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should toggle video when video button is clicked', () => {
        component.isCallActive = true;
        component.isVideoEnabled = true;
        fixture.detectChanges();

        const videoButton = fixture.debugElement.nativeElement.querySelector('.control-button:first-child');
        videoButton.click();

        expect(mockVideoCallService.toggleVideo).toHaveBeenCalled();
        expect(component.isVideoEnabled).toBe(false);
    });

    it('should toggle audio when audio button is clicked', () => {
        component.isCallActive = true;
        component.isAudioEnabled = true;
        fixture.detectChanges();

        const audioButton = fixture.debugElement.nativeElement.querySelector('.control-button:nth-child(2)');
        audioButton.click();

        expect(mockVideoCallService.toggleAudio).toHaveBeenCalled();
        expect(component.isAudioEnabled).toBe(false);
    });

    it('should display correct video icon based on video state', () => {
        component.isCallActive = true;
        component.isVideoEnabled = true;
        fixture.detectChanges();

        let videoIcon = fixture.debugElement.nativeElement.querySelector('.control-button:first-child mat-icon');
        expect(videoIcon.textContent.trim()).toBe('videocam');

        component.isVideoEnabled = false;
        fixture.detectChanges();

        videoIcon = fixture.debugElement.nativeElement.querySelector('.control-button:first-child mat-icon');
        expect(videoIcon.textContent.trim()).toBe('videocam_off');
    });

    it('should display correct audio icon based on audio state', () => {
        component.isCallActive = true;
        component.isAudioEnabled = true;
        fixture.detectChanges();

        let audioIcon = fixture.debugElement.nativeElement.querySelector('.control-button:nth-child(2) mat-icon');
        expect(audioIcon.textContent.trim()).toBe('mic');

        component.isAudioEnabled = false;
        fixture.detectChanges();

        audioIcon = fixture.debugElement.nativeElement.querySelector('.control-button:nth-child(2) mat-icon');
        expect(audioIcon.textContent.trim()).toBe('mic_off');
    });

    it('should display call status when ringing', () => {
        component.isCallActive = true;
        component.callStatus = 'ringing';
        fixture.detectChanges();

        const statusElement = fixture.debugElement.nativeElement.querySelector('.status-ringing');
        expect(statusElement).toBeTruthy();
        expect(statusElement.textContent.trim()).toContain('Calling...');
    });

    it('should display call status when connected', () => {
        component.isCallActive = true;
        component.callStatus = 'accepted';
        fixture.detectChanges();

        const statusElement = fixture.debugElement.nativeElement.querySelector('.status-connected');
        expect(statusElement).toBeTruthy();
        expect(statusElement.textContent.trim()).toContain('Connected');
    });

    it('should display error message when callError is set', () => {
        component.callError = 'Test error message';
        fixture.detectChanges();

        const errorElement = fixture.debugElement.nativeElement.querySelector('.call-error');
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent.trim()).toContain('Test error message');
    });

    it('should clear error when dismiss button is clicked', () => {
        component.callError = 'Test error message';
        fixture.detectChanges();

        const dismissButton = fixture.debugElement.nativeElement.querySelector('.call-error button');
        dismissButton.click();

        expect(component.callError).toBeNull();
    });

    it('should clean up on destroy', () => {
        component.ngOnDestroy();
        expect(mockVideoCallService.clearSubjects).toHaveBeenCalled();
    });

    it('should update video state when local stream changes', () => {
        const mockStream = new MediaStream();
        Object.defineProperty(mockStream, 'getVideoTracks', {
            value: () => [{ enabled: true }]
        });
        Object.defineProperty(mockStream, 'getAudioTracks', {
            value: () => [{ enabled: true }]
        });

        (mockVideoCallService.localStream$ as BehaviorSubject<any>).next(mockStream);

        expect(component.isVideoEnabled).toBe(true);
        expect(component.isAudioEnabled).toBe(true);
    });

    it('should update remote stream when received', () => {
        const mockStream = new MediaStream();
        (mockVideoCallService.remoteStream$ as BehaviorSubject<any>).next(mockStream);

        expect(component.remoteStream).toBe(mockStream);
    });

    it('should update incoming call when received', () => {
        const incomingCall = {
            callId: 'call123',
            initiatorId: 'user1',
            initiatorUsername: 'testuser',
            channelId: 'channel1'
        };

        (mockVideoCallService.incomingCall$ as BehaviorSubject<any>).next(incomingCall);

        expect(component.incomingCall).toBe(incomingCall);
        expect(component.isIncomingCall).toBe(true);
    });

    it('should update call status when received', () => {
        const callStatus = {
            callId: 'call123',
            status: 'accepted'
        };

        (mockVideoCallService.callStatus$ as BehaviorSubject<any>).next(callStatus);

        expect(component.callStatus).toBe('accepted');
        expect(component.isIncomingCall).toBe(false);
    });
});
