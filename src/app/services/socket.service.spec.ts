import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have initial connection status as false', () => {
        expect(service.isSocketConnected()).toBeFalse();
    });

    it('should connect to socket', () => {
        spyOn(service, 'connect');
        service.connect();
        expect(service.connect).toHaveBeenCalled();
    });

    it('should disconnect from socket', () => {
        spyOn(service, 'disconnect');
        service.disconnect();
        expect(service.disconnect).toHaveBeenCalled();
    });

    it('should join channel', () => {
        const channelId = 'test-channel-id';
        spyOn(service, 'joinChannel');
        service.joinChannel(channelId);
        expect(service.joinChannel).toHaveBeenCalledWith(channelId);
    });

    it('should leave channel', () => {
        const channelId = 'test-channel-id';
        spyOn(service, 'leaveChannel');
        service.leaveChannel(channelId);
        expect(service.leaveChannel).toHaveBeenCalledWith(channelId);
    });

    it('should send message', () => {
        const message = {
            channelId: 'test-channel',
            text: 'Test message',
            type: 'text' as const,
            senderId: 'user1',
            senderName: 'Test User'
        };
        spyOn(service, 'sendMessage');
        service.sendMessage(message);
        expect(service.sendMessage).toHaveBeenCalledWith(message);
    });

    it('should send typing indicator', () => {
        const channelId = 'test-channel';
        spyOn(service, 'sendTyping');
        service.sendTyping(channelId, true);
        expect(service.sendTyping).toHaveBeenCalledWith(channelId, true);
    });

    it('should update presence', () => {
        spyOn(service, 'updatePresence');
        service.updatePresence('online', 'test-channel');
        expect(service.updatePresence).toHaveBeenCalledWith('online', 'test-channel');
    });

    it('should initiate video call', () => {
        const callData = {
            recipientId: 'user1',
            channelId: 'test-channel'
        };
        spyOn(service, 'initiateVideoCall');
        service.initiateVideoCall(callData);
        expect(service.initiateVideoCall).toHaveBeenCalledWith(callData);
    });

    it('should answer video call', () => {
        const callId = 'call123';
        spyOn(service, 'answerVideoCall');
        service.answerVideoCall(callId);
        expect(service.answerVideoCall).toHaveBeenCalledWith(callId);
    });

    it('should reject video call', () => {
        const callId = 'call123';
        spyOn(service, 'rejectVideoCall');
        service.rejectVideoCall(callId);
        expect(service.rejectVideoCall).toHaveBeenCalledWith(callId);
    });

    it('should end video call', () => {
        const callId = 'call123';
        spyOn(service, 'endVideoCall');
        service.endVideoCall(callId);
        expect(service.endVideoCall).toHaveBeenCalledWith(callId);
    });
});
