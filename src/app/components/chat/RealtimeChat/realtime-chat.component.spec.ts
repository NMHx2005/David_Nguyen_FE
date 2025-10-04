import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RealtimeChatComponent } from './realtime-chat.component';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { GroupsInterestService } from '../../client/Groups/services/groups-interest.service';
import { ChannelsService } from '../../client/Channels/services/channels.service';
import { UploadService } from '../../shared/Common/upload.service';
import { TestHelpers } from '../../../testing/test-helpers';

describe('RealtimeChatComponent', () => {
    let component: RealtimeChatComponent;
    let fixture: ComponentFixture<RealtimeChatComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let socketService: jasmine.SpyObj<SocketService>;
    let groupsService: jasmine.SpyObj<GroupsInterestService>;
    let channelsService: jasmine.SpyObj<ChannelsService>;
    let uploadService: jasmine.SpyObj<UploadService>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
        const socketSpy = jasmine.createSpyObj('SocketService', [
            'connect', 'disconnect', 'joinChannel', 'leaveChannel', 'sendMessage', 'sendTyping', 'isSocketConnected'
        ]);
        const groupsSpy = jasmine.createSpyObj('GroupsInterestService', ['getUserGroups']);
        const channelsSpy = jasmine.createSpyObj('ChannelsService', ['getChannelsByGroup']);
        const uploadSpy = jasmine.createSpyObj('UploadService', ['uploadImage']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [RealtimeChatComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: SocketService, useValue: socketSpy },
                { provide: GroupsInterestService, useValue: groupsSpy },
                { provide: ChannelsService, useValue: channelsSpy },
                { provide: UploadService, useValue: uploadSpy },
                { provide: MatSnackBar, useValue: snackBarSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RealtimeChatComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        groupsService = TestBed.inject(GroupsInterestService) as jasmine.SpyObj<GroupsInterestService>;
        channelsService = TestBed.inject(ChannelsService) as jasmine.SpyObj<ChannelsService>;
        uploadService = TestBed.inject(UploadService) as jasmine.SpyObj<UploadService>;
        snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send message via socket', () => {
        const mockChannel = TestHelpers.createMockChannel();
        component.selectedChannel = mockChannel;
        component.newMessage = 'Hello world';
        socketService.isSocketConnected.and.returnValue(true);

        component.sendMessage();

        expect(socketService.sendMessage).toHaveBeenCalledWith({
            channelId: mockChannel._id,
            text: 'Hello world',
            type: 'text'
        });
        expect(component.newMessage).toBe('');
    });

    it('should not send empty message', () => {
        component.newMessage = '';
        spyOn(component, 'sendMessage');

        component.sendMessage();

        expect(socketService.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle typing indicator', () => {
        const mockChannel = TestHelpers.createMockChannel();
        component.selectedChannel = mockChannel;
        socketService.isSocketConnected.and.returnValue(true);

        component.onTyping();

        expect(socketService.sendTyping).toHaveBeenCalledWith(mockChannel._id, true);
    });

    it('should handle upload error', () => {
        const errorMessage = 'Upload failed';
        component.onUploadError(errorMessage);

        expect(snackBar.open).toHaveBeenCalledWith(errorMessage, 'Close', { duration: 3000 });
    });

    it('should track messages by ID', () => {
        const mockMessage = TestHelpers.createMockMessage();
        const trackByResult = component.trackByMessageId(0, mockMessage);

        expect(trackByResult).toBe(mockMessage._id);
    });

    it('should format time correctly', () => {
        const timestamp = new Date('2023-01-01T10:30:00Z').getTime();
        const formattedTime = component.formatTime(timestamp);

        expect(formattedTime).toContain('10:30');
    });

    it('should disconnect socket on destroy', () => {
        spyOn(component, 'ngOnDestroy');
        component.ngOnDestroy();

        expect(socketService.disconnect).toHaveBeenCalled();
    });
});
