import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-channels-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <div class="header-actions">
      <button mat-stroked-button routerLink="/groups" class="back-button" matTooltip="Back to Groups">
        <mat-icon>arrow_back</mat-icon>
        Back to Groups
      </button>
      
      <!-- Debug button (remove in production) -->
      <button mat-stroked-button color="warn" (click)="onResetData()" matTooltip="Reset data for testing">
        <mat-icon>refresh</mat-icon>
        Reset Data
      </button>
    </div>
  `,
    styles: [`
    .header-actions {
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-start;
    }

    .back-button {
      color: #667eea;
      border-color: #667eea;
    }
  `]
})
export class ChannelsHeaderComponent {
    @Output() resetData = new EventEmitter<void>();

    onResetData(): void {
        this.resetData.emit();
    }
}
