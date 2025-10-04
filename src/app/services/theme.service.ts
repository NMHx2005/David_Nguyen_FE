import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSubject = new BehaviorSubject<Theme>('light');
    public theme$ = this.themeSubject.asObservable();

    constructor() {
        this.initializeTheme();
    }

    /**
     * Initialize theme from localStorage or system preference
     */
    private initializeTheme(): void {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('light');
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme(): Theme {
        return this.themeSubject.value;
    }

    /**
     * Set theme
     */
    setTheme(theme: Theme): void {
        this.themeSubject.next(theme);
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
    }

    /**
     * Apply theme to the application
     */
    private applyTheme(theme: Theme): void {
        const body = document.body;
        const html = document.documentElement;

        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme', 'auto-theme');
        html.classList.remove('light-theme', 'dark-theme', 'auto-theme');

        // Apply new theme
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            html.classList.add('dark-theme');
        } else if (theme === 'light') {
            body.classList.add('light-theme');
            html.classList.add('light-theme');
        } else if (theme === 'auto') {
            // Auto theme - use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-theme');
                html.classList.add('dark-theme');
            } else {
                body.classList.add('light-theme');
                html.classList.add('light-theme');
            }
        }
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme(): void {
        const currentTheme = this.getCurrentTheme();
        if (currentTheme === 'light') {
            this.setTheme('dark');
        } else if (currentTheme === 'dark') {
            this.setTheme('light');
        } else {
            // If auto, toggle to light
            this.setTheme('light');
        }
    }

    /**
     * Check if current theme is dark
     */
    isDarkTheme(): boolean {
        const theme = this.getCurrentTheme();
        if (theme === 'dark') return true;
        if (theme === 'light') return false;
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }

    /**
     * Get theme icon
     */
    getThemeIcon(): string {
        const theme = this.getCurrentTheme();
        switch (theme) {
            case 'light': return 'light_mode';
            case 'dark': return 'dark_mode';
            case 'auto': return 'brightness_auto';
            default: return 'light_mode';
        }
    }

    /**
     * Get theme label
     */
    getThemeLabel(): string {
        const theme = this.getCurrentTheme();
        switch (theme) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'auto': return 'Auto';
            default: return 'Light';
        }
    }
}
