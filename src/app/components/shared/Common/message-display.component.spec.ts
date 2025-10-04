import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageDisplayComponent } from './message-display.component';
import { AvatarService } from '../../services/avatar.service';
import { TestHelpers } from '../../testing/test-helpers';

describe('MessageDisplayComponent', () => {
    let component: MessageDisplayComponent;
    let fixture: ComponentFixture<MessageDisplayComponent>;
    let avatarService: jasmine.SpyObj<AvatarService>;

    beforeEach(async () => {
        const avatarSpy = jasmine.createSpyObj('AvatarService', ['getAvatarInfo', 'getDefaultAvatarColor']);

        await TestBed.configureTestingModule({
            imports: [MessageDisplayComponent],
            providers: [
                { provide: AvatarService, useValue: avatarSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MessageDisplayComponent);
        component = fixture.componentInstance;
        avatarService = TestBed.inject(AvatarService) as jasmine.SpyObj<AvatarService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display text message', () => {
        const mockMessage = TestHelpers.createMockMessage({
            type: 'text',
            text: 'Hello world'
        });
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        fixture.detectChanges();

        const messageElement = fixture.nativeElement.querySelector('.message-text');
        expect(messageElement.textContent.trim()).toBe('Hello world');
    });

    it('should display image message', () => {
        const mockMessage = TestHelpers.createMockMessage({
            type: 'image',
            text: 'Image caption',
            imageUrl: 'test-image.jpg'
        });
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        fixture.detectChanges();

        const imageElement = fixture.nativeElement.querySelector('.message-image img');
        expect(imageElement.src).toContain('test-image.jpg');
        expect(imageElement.alt).toBe('Image caption');
    });

    it('should display file message', () => {
        const mockMessage = TestHelpers.createMockMessage({
            type: 'file',
            text: 'document.pdf',
            fileUrl: 'test-file.pdf'
        });
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        fixture.detectChanges();

        const fileElement = fixture.nativeElement.querySelector('.message-file a');
        expect(fileElement.href).toContain('test-file.pdf');
        expect(fileElement.textContent.trim()).toBe('document.pdf');
    });

    it('should identify own messages', () => {
        const mockMessage = TestHelpers.createMockMessage({
            userId: '507f1f77bcf86cd799439011'
        });
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        expect(component.isOwnMessage).toBe(true);
    });

    it('should identify other users messages', () => {
        const mockMessage = TestHelpers.createMockMessage({
            userId: '507f1f77bcf86cd799439012'
        });
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        expect(component.isOwnMessage).toBe(false);
    });

    it('should format time correctly', () => {
        const timestamp = new Date('2023-01-01T10:30:00Z').getTime();
        const formattedTime = component.formatTime(timestamp);

        expect(formattedTime).toContain('10:30');
    });

    it('should handle avatar loading', () => {
        const mockMessage = TestHelpers.createMockMessage();
        component.message = mockMessage;
        avatarService.getAvatarInfo.and.returnValue({
            url: 'avatar.jpg',
            isDefault: false
        });

        component.ngOnInit();

        expect(avatarService.getAvatarInfo).toHaveBeenCalledWith(
            mockMessage.userId,
            mockMessage.username
        );
    });

    it('should handle avatar error', () => {
        component.onAvatarError();

        expect(component.avatarError).toBe(true);
        expect(component.avatarLoading).toBe(false);
    });

    it('should open image in new tab', () => {
        spyOn(window, 'open');
        const imageUrl = 'test-image.jpg';

        component.openImageInNewTab(imageUrl);

        expect(window.open).toHaveBeenCalledWith(imageUrl, '_blank');
    });

    it('should handle reply action', () => {
        spyOn(console, 'log');
        const mockMessage = TestHelpers.createMockMessage();
        component.message = mockMessage;

        component.onReply();

        expect(console.log).toHaveBeenCalledWith('Reply to message:', mockMessage._id);
    });

    it('should handle react action', () => {
        spyOn(console, 'log');
        const mockMessage = TestHelpers.createMockMessage();
        component.message = mockMessage;

        component.onReact();

        expect(console.log).toHaveBeenCalledWith('React to message:', mockMessage._id);
    });

    it('should handle more options action', () => {
        spyOn(console, 'log');
        const mockMessage = TestHelpers.createMockMessage();
        component.message = mockMessage;

        component.onMoreOptions();

        expect(console.log).toHaveBeenCalledWith('More options for message:', mockMessage._id);
    });

    it('should show actions when enabled', () => {
        component.showActions = true;
        const mockMessage = TestHelpers.createMockMessage();
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        fixture.detectChanges();

        const actionsElement = fixture.nativeElement.querySelector('.message-actions');
        expect(actionsElement).toBeTruthy();
    });

    it('should not show actions when disabled', () => {
        component.showActions = false;
        const mockMessage = TestHelpers.createMockMessage();
        component.message = mockMessage;
        component.currentUserId = '507f1f77bcf86cd799439011';

        fixture.detectChanges();

        const actionsElement = fixture.nativeElement.querySelector('.message-actions');
        expect(actionsElement).toBeFalsy();
    });
});
