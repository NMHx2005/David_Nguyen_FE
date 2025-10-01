import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-video-call-button',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <button 
      mat-icon-button 
      [color]="buttonColor"
      [disabled]="disabled"
      (click)="onVideoCallClick()"
      [matTooltip]="tooltipText">
      <mat-icon>{{ iconName }}</mat-icon>
    </button>
  `,
    styles: [`
    button {
      transition: all 0.3s ease;
    }
    
    button:hover:not(:disabled) {
      transform: scale(1.1);
    }
    
    button:disabled {
      opacity: 0.5;
    }
  `]
})
export class VideoCallButtonComponent {
    @Input() userId: string = '';
    @Input() username: string = '';
    @Input() channelId: string = '';
    @Input() disabled: boolean = false;
    @Input() isOnline: boolean = false;
    @Input() buttonType: 'initiate' | 'incoming' = 'initiate';

    @Output() videoCallInitiated = new EventEmitter<{
        userId: string;
        username: string;
        channelId: string;
    }>();

    get iconName(): string {
        return this.buttonType === 'initiate' ? 'videocam' : 'call';
    }

    get buttonColor(): string {
        if (this.disabled) return 'default';
        return this.buttonType === 'initiate' ? 'primary' : 'accent';
    }

    get tooltipText(): string {
        if (this.disabled) {
            return this.isOnline ? 'User is not available for video calls' : 'User is offline';
        }
        return this.buttonType === 'initiate'
            ? `Start video call with ${this.username}`
            : `Answer video call from ${this.username}`;
    }

    onVideoCallClick(): void {
        if (!this.disabled && this.userId && this.channelId) {
            this.videoCallInitiated.emit({
                userId: this.userId,
                username: this.username,
                channelId: this.channelId
            });
        }
    }
}
