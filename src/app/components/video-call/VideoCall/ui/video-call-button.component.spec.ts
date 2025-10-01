import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VideoCallButtonComponent } from './video-call-button.component';

describe('VideoCallButtonComponent', () => {
    let component: VideoCallButtonComponent;
    let fixture: ComponentFixture<VideoCallButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                VideoCallButtonComponent,
                MatButtonModule,
                MatIconModule,
                MatTooltipModule,
                NoopAnimationsModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(VideoCallButtonComponent);
        component = fixture.componentInstance;
    });

    beforeEach(() => {
        component.userId = 'user123';
        component.username = 'testuser';
        component.channelId = 'channel123';
        component.isOnline = true;
        component.buttonType = 'initiate';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display correct icon for initiate button', () => {
        component.buttonType = 'initiate';
        fixture.detectChanges();

        const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
        expect(iconElement.textContent.trim()).toBe('videocam');
    });

    it('should display correct icon for incoming button', () => {
        component.buttonType = 'incoming';
        fixture.detectChanges();

        const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
        expect(iconElement.textContent.trim()).toBe('call');
    });

    it('should be disabled when user is offline', () => {
        component.isOnline = false;
        component.disabled = false;
        fixture.detectChanges();

        const buttonElement = fixture.debugElement.nativeElement.querySelector('button');
        expect(buttonElement.disabled).toBe(true);
    });

    it('should be disabled when explicitly disabled', () => {
        component.disabled = true;
        component.isOnline = true;
        fixture.detectChanges();

        const buttonElement = fixture.debugElement.nativeElement.querySelector('button');
        expect(buttonElement.disabled).toBe(true);
    });

    it('should emit videoCallInitiated event when clicked', () => {
        spyOn(component.videoCallInitiated, 'emit');

        component.onVideoCallClick();

        expect(component.videoCallInitiated.emit).toHaveBeenCalledWith({
            userId: 'user123',
            username: 'testuser',
            channelId: 'channel123'
        });
    });

    it('should not emit event when disabled', () => {
        component.disabled = true;
        spyOn(component.videoCallInitiated, 'emit');

        component.onVideoCallClick();

        expect(component.videoCallInitiated.emit).not.toHaveBeenCalled();
    });

    it('should return correct tooltip text for initiate button', () => {
        component.buttonType = 'initiate';
        component.disabled = false;
        component.isOnline = true;

        expect(component.tooltipText).toBe('Start video call with testuser');
    });

    it('should return correct tooltip text for incoming button', () => {
        component.buttonType = 'incoming';
        component.disabled = false;
        component.isOnline = true;

        expect(component.tooltipText).toBe('Answer video call from testuser');
    });

    it('should return offline tooltip when user is offline', () => {
        component.isOnline = false;
        component.disabled = false;

        expect(component.tooltipText).toBe('User is offline');
    });

    it('should return unavailable tooltip when disabled but online', () => {
        component.isOnline = true;
        component.disabled = true;

        expect(component.tooltipText).toBe('User is not available for video calls');
    });

    it('should return correct button color for initiate button', () => {
        component.buttonType = 'initiate';
        component.disabled = false;

        expect(component.buttonColor).toBe('primary');
    });

    it('should return correct button color for incoming button', () => {
        component.buttonType = 'incoming';
        component.disabled = false;

        expect(component.buttonColor).toBe('accent');
    });

    it('should return default color when disabled', () => {
        component.disabled = true;

        expect(component.buttonColor).toBe('default');
    });
});
