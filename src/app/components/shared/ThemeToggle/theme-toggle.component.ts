import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService, Theme } from '../../../services/theme.service';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
    ],
    template: `
    <button mat-icon-button 
            [matMenuTriggerFor]="themeMenu" 
            matTooltip="Change Theme"
            class="theme-toggle-button">
      <mat-icon>{{ themeService.getThemeIcon() }}</mat-icon>
    </button>

    <mat-menu #themeMenu="matMenu" class="theme-menu">
      <button mat-menu-item (click)="setTheme('light')" [class.active]="themeService.getCurrentTheme() === 'light'">
        <mat-icon>light_mode</mat-icon>
        <span>Light</span>
        <mat-icon *ngIf="themeService.getCurrentTheme() === 'light'" class="check-icon">check</mat-icon>
      </button>
      
      <button mat-menu-item (click)="setTheme('dark')" [class.active]="themeService.getCurrentTheme() === 'dark'">
        <mat-icon>dark_mode</mat-icon>
        <span>Dark</span>
        <mat-icon *ngIf="themeService.getCurrentTheme() === 'dark'" class="check-icon">check</mat-icon>
      </button>
      
      <button mat-menu-item (click)="setTheme('auto')" [class.active]="themeService.getCurrentTheme() === 'auto'">
        <mat-icon>brightness_auto</mat-icon>
        <span>Auto</span>
        <mat-icon *ngIf="themeService.getCurrentTheme() === 'auto'" class="check-icon">check</mat-icon>
      </button>
    </mat-menu>
  `,
    styles: [`
    .theme-toggle-button {
      transition: all 0.3s ease;
    }

    .theme-toggle-button:hover {
      transform: scale(1.1);
    }

    .theme-menu {
      min-width: 150px;
    }

    .theme-menu button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      width: 100%;
      text-align: left;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .theme-menu button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .theme-menu button.active {
      background-color: rgba(25, 118, 210, 0.12);
      color: #1976d2;
    }

    .theme-menu button.active mat-icon:first-child {
      color: #1976d2;
    }

    .check-icon {
      margin-left: auto;
      color: #1976d2;
    }

    /* Dark theme styles */
    .dark-theme .theme-menu button:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }

    .dark-theme .theme-menu button.active {
      background-color: rgba(144, 202, 249, 0.12);
      color: #90caf9;
    }

    .dark-theme .theme-menu button.active mat-icon:first-child {
      color: #90caf9;
    }

    .dark-theme .check-icon {
      color: #90caf9;
    }
  `]
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Services
    themeService = inject(ThemeService);

    ngOnInit(): void {
        // Component initialization
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Set theme
     */
    setTheme(theme: Theme): void {
        this.themeService.setTheme(theme);
    }
}
