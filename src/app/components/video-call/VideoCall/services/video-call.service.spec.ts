import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { VideoCallService } from './video-call.service';
import { SocketService } from './socket.service';

describe('VideoCallService', () => {
    let service: VideoCallService;
    let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        const socketServiceSpy = jasmine.createSpyObj('SocketService', [], {
            socket: {
                on: jasmine.createSpy('on'),
                emit: jasmine.createSpy('emit')
            }
        });

        TestBed.configureTestingModule({
            providers: [
                VideoCallService,
                { provide: SocketService, useValue: socketServiceSpy }
            ]
        });

        service = TestBed.inject(VideoCallService);
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initiateCall', () => {
        it('should get user media and emit initiate call event', async () => {
            const mockStream = new MediaStream();
            spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(mockStream));
            spyOn(service, 'createOffer');

            await service.initiateCall('user123', 'channel123');

            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
                video: true,
                audio: true
            });
            expect(mockSocketService.socket?.emit).toHaveBeenCalledWith('video_call_initiate', {
                recipientId: 'user123',
                channelId: 'channel123'
            });
        });

        it('should handle getUserMedia error', async () => {
            spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.reject(new Error('Permission denied')));
            spyOn(service.callError$, 'next');

            await service.initiateCall('user123', 'channel123');

            expect(service.callError$.next).toHaveBeenCalledWith('Failed to access camera/microphone');
        });
    });

    describe('acceptCall', () => {
        it('should get user media and emit accept call event', async () => {
            const mockStream = new MediaStream();
            spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(mockStream));

            service.acceptCall('call123');

            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
                video: true,
                audio: true
            });
            expect(mockSocketService.socket?.emit).toHaveBeenCalledWith('video_call_accept', {
                callId: 'call123'
            });
        });

        it('should handle getUserMedia error', async () => {
            spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.reject(new Error('Permission denied')));
            spyOn(service.callError$, 'next');

            service.acceptCall('call123');

            expect(service.callError$.next).toHaveBeenCalledWith('Failed to access camera/microphone');
        });
    });

    describe('rejectCall', () => {
        it('should emit reject call event and cleanup', () => {
            spyOn(service, 'cleanupCall');

            service.rejectCall('call123');

            expect(mockSocketService.socket?.emit).toHaveBeenCalledWith('video_call_reject', {
                callId: 'call123'
            });
            expect(service.cleanupCall).toHaveBeenCalled();
        });
    });

    describe('endCall', () => {
        it('should emit end call event and cleanup when current call exists', () => {
            service['currentCall'] = {
                callId: 'call123',
                initiatorId: 'user1',
                recipientId: 'user2',
                channelId: 'channel1',
                status: 'accepted'
            };
            spyOn(service, 'cleanupCall');

            service.endCall();

            expect(mockSocketService.socket?.emit).toHaveBeenCalledWith('video_call_end', {
                callId: 'call123'
            });
            expect(service.cleanupCall).toHaveBeenCalled();
        });

        it('should not emit event when no current call', () => {
            service['currentCall'] = null;
            spyOn(service, 'cleanupCall');

            service.endCall();

            expect(mockSocketService.socket?.emit).not.toHaveBeenCalled();
            expect(service.cleanupCall).toHaveBeenCalled();
        });
    });

    describe('toggleVideo', () => {
        it('should toggle video track when local stream exists', () => {
            const mockVideoTrack = { enabled: true };
            const mockStream = {
                getVideoTracks: () => [mockVideoTrack]
            } as any;
            service['localStream'] = mockStream;

            service.toggleVideo();

            expect(mockVideoTrack.enabled).toBe(false);
        });

        it('should not throw error when no local stream', () => {
            service['localStream'] = null;

            expect(() => service.toggleVideo()).not.toThrow();
        });
    });

    describe('toggleAudio', () => {
        it('should toggle audio track when local stream exists', () => {
            const mockAudioTrack = { enabled: true };
            const mockStream = {
                getAudioTracks: () => [mockAudioTrack]
            } as any;
            service['localStream'] = mockStream;

            service.toggleAudio();

            expect(mockAudioTrack.enabled).toBe(false);
        });

        it('should not throw error when no local stream', () => {
            service['localStream'] = null;

            expect(() => service.toggleAudio()).not.toThrow();
        });
    });

    describe('cleanupCall', () => {
        it('should stop local stream tracks and clear streams', () => {
            const mockTrack1 = { stop: jasmine.createSpy('stop') };
            const mockTrack2 = { stop: jasmine.createSpy('stop') };
            const mockStream = {
                getTracks: () => [mockTrack1, mockTrack2]
            } as any;

            service['localStream'] = mockStream;
            service['remoteStream'] = new MediaStream();
            service['currentCall'] = { callId: 'call123' } as any;

            service['cleanupCall']();

            expect(mockTrack1.stop).toHaveBeenCalled();
            expect(mockTrack2.stop).toHaveBeenCalled();
            expect(service['localStream']).toBeNull();
            expect(service['remoteStream']).toBeNull();
            expect(service['currentCall']).toBeNull();
        });
    });

    describe('getters', () => {
        it('should return true when call is active', () => {
            service['currentCall'] = {
                callId: 'call123',
                status: 'accepted'
            } as any;

            expect(service.isCallActive).toBe(true);
        });

        it('should return false when no current call', () => {
            service['currentCall'] = null;

            expect(service.isCallActive).toBe(false);
        });

        it('should return current call data', () => {
            const mockCall = { callId: 'call123' };
            service['currentCall'] = mockCall as any;

            expect(service.currentCallData).toBe(mockCall);
        });
    });

    describe('clearSubjects', () => {
        it('should clear all subjects', () => {
            spyOn(service['incomingCallSubject'], 'next');
            spyOn(service['callStatusSubject'], 'next');
            spyOn(service['localStreamSubject'], 'next');
            spyOn(service['remoteStreamSubject'], 'next');
            spyOn(service['callErrorSubject'], 'next');

            service.clearSubjects();

            expect(service['incomingCallSubject'].next).toHaveBeenCalledWith(null);
            expect(service['callStatusSubject'].next).toHaveBeenCalledWith(null);
            expect(service['localStreamSubject'].next).toHaveBeenCalledWith(null);
            expect(service['remoteStreamSubject'].next).toHaveBeenCalledWith(null);
            expect(service['callErrorSubject'].next).toHaveBeenCalledWith(null);
        });
    });

    describe('WebRTC handling', () => {
        it('should handle offer and create answer', async () => {
            const mockOffer = {
                callId: 'call123',
                initiatorId: 'user1',
                recipientId: 'user2',
                channelId: 'channel1',
                offer: { type: 'offer', sdp: 'test-sdp' }
            };

            const mockPeerConnection = {
                setRemoteDescription: jasmine.createSpy('setRemoteDescription'),
                createAnswer: jasmine.createSpy('createAnswer').and.returnValue(Promise.resolve({ type: 'answer', sdp: 'answer-sdp' })),
                setLocalDescription: jasmine.createSpy('setLocalDescription'),
                ontrack: null,
                onicecandidate: null
            };

            service['peerConnection'] = mockPeerConnection as any;
            service['localStream'] = new MediaStream();

            await service['handleOffer'](mockOffer);

            expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith(mockOffer.offer);
            expect(mockPeerConnection.createAnswer).toHaveBeenCalled();
            expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
            expect(mockSocketService.socket?.emit).toHaveBeenCalledWith('video_call_answer', {
                callId: 'call123',
                answer: { type: 'answer', sdp: 'answer-sdp' }
            });
        });

        it('should handle answer', async () => {
            const mockAnswer = {
                callId: 'call123',
                answer: { type: 'answer', sdp: 'answer-sdp' }
            };

            const mockPeerConnection = {
                setRemoteDescription: jasmine.createSpy('setRemoteDescription')
            };

            service['peerConnection'] = mockPeerConnection as any;

            await service['handleAnswer'](mockAnswer);

            expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith(mockAnswer.answer);
        });

        it('should handle ICE candidate', async () => {
            const mockCandidate = {
                callId: 'call123',
                candidate: { candidate: 'test-candidate' }
            };

            const mockPeerConnection = {
                addIceCandidate: jasmine.createSpy('addIceCandidate')
            };

            service['peerConnection'] = mockPeerConnection as any;

            await service['handleIceCandidate'](mockCandidate);

            expect(mockPeerConnection.addIceCandidate).toHaveBeenCalledWith(mockCandidate.candidate);
        });
    });
});
