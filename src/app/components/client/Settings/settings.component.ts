import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../../services/client.service';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';

interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        desktop: boolean;
        mentions: boolean;
        messages: boolean;
        invites: boolean;
        system: boolean;
    };
    privacy: {
        showOnlineStatus: boolean;
        showLastSeen: boolean;
        showEmail: boolean;
        allowDirectMessages: boolean;
        showInSearch: boolean;
    };
    chat: {
        showTypingIndicators: boolean;
        showReadReceipts: boolean;
        autoDownloadImages: boolean;
        compactMode: boolean;
        fontSize: 'small' | 'medium' | 'large';
    };
    security: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
        loginNotifications: boolean;
    };
}

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatDividerModule,
        MatTooltipModule,
        MatExpansionModule,
        MatRadioModule,
        ClientLayoutComponent,
    ],
    template: `
    <app-client-layout 
      pageTitle="Settings & Preferences" 
      pageDescription="Customize your experience and manage your preferences">
      
      <div class="settings-container">
        <!-- Header Section -->
        <div class="settings-header">
          <div class="header-content">
            <h1>Settings & Preferences</h1>
            <p>Customize your experience and manage your account preferences</p>
          </div>
          <div class="header-actions">
            <button mat-icon-button (click)="resetToDefaults()" matTooltip="Reset to Defaults">
              <mat-icon>restore</mat-icon>
            </button>
            <button mat-raised-button color="primary" 
                    (click)="saveSettings()" 
                    [disabled]="!settingsForm.dirty || isSaving">
              <mat-icon *ngIf="!isSaving">save</mat-icon>
              <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading settings...</p>
        </div>

        <!-- Settings Content -->
        <div *ngIf="!isLoading" class="settings-content">
          <form [formGroup]="settingsForm">
            <mat-tab-group class="settings-tabs">
              <!-- Appearance Tab -->
              <mat-tab label="Appearance">
                <div class="tab-content">
                  <mat-card class="settings-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>palette</mat-icon>
                        Theme & Display
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-section">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Theme</mat-label>
                          <mat-select formControlName="theme">
                            <mat-option value="light">
                              <mat-icon>light_mode</mat-icon>
                              Light
                            </mat-option>
                            <mat-option value="dark">
                              <mat-icon>dark_mode</mat-icon>
                              Dark
                            </mat-option>
                            <mat-option value="auto">
                              <mat-icon>brightness_auto</mat-icon>
                              Auto (System)
                            </mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Language</mat-label>
                          <mat-select formControlName="language">
                            <mat-option value="en">English</mat-option>
                            <mat-option value="vi">Tiếng Việt</mat-option>
                            <mat-option value="es">Español</mat-option>
                            <mat-option value="fr">Français</mat-option>
                            <mat-option value="de">Deutsch</mat-option>
                            <mat-option value="ja">日本語</mat-option>
                            <mat-option value="ko">한국어</mat-option>
                            <mat-option value="zh">中文</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Font Size</mat-label>
                          <mat-select formControlName="fontSize">
                            <mat-option value="small">Small</mat-option>
                            <mat-option value="medium">Medium</mat-option>
                            <mat-option value="large">Large</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="compactMode">
                            Compact Mode
                            <mat-icon matTooltip="Reduce spacing and padding for a more compact interface">info</mat-icon>
                          </mat-slide-toggle>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- Notifications Tab -->
              <mat-tab label="Notifications">
                <div class="tab-content">
                  <mat-card class="settings-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>notifications</mat-icon>
                        Notification Preferences
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-section">
                        <h3>General Notifications</h3>
                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="emailNotifications">
                            Email Notifications
                            <mat-icon matTooltip="Receive notifications via email">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="pushNotifications">
                            Push Notifications
                            <mat-icon matTooltip="Receive browser push notifications">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="desktopNotifications">
                            Desktop Notifications
                            <mat-icon matTooltip="Show desktop notifications">info</mat-icon>
                          </mat-slide-toggle>
                        </div>

                        <mat-divider></mat-divider>

                        <h3>Specific Notification Types</h3>
                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="mentionNotifications">
                            Mentions
                            <mat-icon matTooltip="Get notified when someone mentions you">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="messageNotifications">
                            Direct Messages
                            <mat-icon matTooltip="Get notified of new direct messages">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="inviteNotifications">
                            Group Invites
                            <mat-icon matTooltip="Get notified of group invitations">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="systemNotifications">
                            System Updates
                            <mat-icon matTooltip="Get notified of system updates and maintenance">info</mat-icon>
                          </mat-slide-toggle>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- Privacy Tab -->
              <mat-tab label="Privacy">
                <div class="tab-content">
                  <mat-card class="settings-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>privacy_tip</mat-icon>
                        Privacy Settings
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-section">
                        <h3>Profile Visibility</h3>
                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="showOnlineStatus">
                            Show Online Status
                            <mat-icon matTooltip="Let others see when you're online">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="showLastSeen">
                            Show Last Seen
                            <mat-icon matTooltip="Let others see when you were last active">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="showEmail">
                            Show Email Address
                            <mat-icon matTooltip="Make your email address visible to other users">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="showInSearch">
                            Show in Search Results
                            <mat-icon matTooltip="Allow others to find you in search results">info</mat-icon>
                          </mat-slide-toggle>
                        </div>

                        <mat-divider></mat-divider>

                        <h3>Communication</h3>
                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="allowDirectMessages">
                            Allow Direct Messages
                            <mat-icon matTooltip="Allow other users to send you direct messages">info</mat-icon>
                          </mat-slide-toggle>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- Chat Tab -->
              <mat-tab label="Chat">
                <div class="tab-content">
                  <mat-card class="settings-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>chat</mat-icon>
                        Chat Preferences
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-section">
                        <h3>Chat Behavior</h3>
                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="showTypingIndicators">
                            Show Typing Indicators
                            <mat-icon matTooltip="Show when others are typing">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="showReadReceipts">
                            Show Read Receipts
                            <mat-icon matTooltip="Show when messages have been read">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="autoDownloadImages">
                            Auto-download Images
                            <mat-icon matTooltip="Automatically download images in messages">info</mat-icon>
                          </mat-slide-toggle>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>

              <!-- Security Tab -->
              <mat-tab label="Security">
                <div class="tab-content">
                  <mat-card class="settings-card">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>security</mat-icon>
                        Security Settings
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="form-section">
                        <h3>Account Security</h3>
                        <div class="toggle-section">
                          <mat-slide-toggle formControlName="twoFactorAuth">
                            Two-Factor Authentication
                            <mat-icon matTooltip="Add an extra layer of security to your account">info</mat-icon>
                          </mat-slide-toggle>
                          
                          <mat-slide-toggle formControlName="loginNotifications">
                            Login Notifications
                            <mat-icon matTooltip="Get notified of new login attempts">info</mat-icon>
                          </mat-slide-toggle>
                        </div>

                        <mat-divider></mat-divider>

                        <h3>Session Management</h3>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Session Timeout (minutes)</mat-label>
                          <mat-select formControlName="sessionTimeout">
                            <mat-option value="15">15 minutes</mat-option>
                            <mat-option value="30">30 minutes</mat-option>
                            <mat-option value="60">1 hour</mat-option>
                            <mat-option value="240">4 hours</mat-option>
                            <mat-option value="480">8 hours</mat-option>
                            <mat-option value="1440">24 hours</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-tab>
            </mat-tab-group>
          </form>
        </div>
      </div>
    </app-client-layout>
  `,
    styles: [`
    .settings-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      color: #666;
      font-size: 16px;
    }

    .settings-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .settings-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    .settings-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .settings-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .full-width {
      width: 100%;
    }

    .toggle-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-section mat-slide-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-section mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
    }

    mat-divider {
      margin: 24px 0;
    }

    /* Theme-specific styles */
    .dark-theme {
      background-color: #121212;
      color: #ffffff;
    }

    .dark-theme .settings-container {
      background-color: #121212;
    }

    .dark-theme .settings-header,
    .dark-theme .settings-tabs,
    .dark-theme .settings-card {
      background-color: #1e1e1e;
      color: #ffffff;
    }

    .dark-theme .header-content h1,
    .dark-theme .form-section h3 {
      color: #ffffff;
    }

    .dark-theme .header-content p {
      color: #b0b0b0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .settings-container {
        padding: 10px;
      }

      .settings-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
      }

      .tab-content {
        padding: 16px;
      }
    }
  `]
})
export class SettingsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Services
    clientService = inject(ClientService);
    snackBar = inject(MatSnackBar);
    fb = inject(FormBuilder);

    // Component state
    isLoading = false;
    isSaving = false;
    currentPreferences: UserPreferences | null = null;

    // Form
    settingsForm: FormGroup;

    constructor() {
        this.settingsForm = this.createSettingsForm();
    }

    ngOnInit(): void {
        this.loadUserPreferences();
        this.setupThemeChangeListener();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Create the settings form
     */
    private createSettingsForm(): FormGroup {
        return this.fb.group({
            // Appearance
            theme: ['light', Validators.required],
            language: ['en', Validators.required],
            fontSize: ['medium', Validators.required],
            compactMode: [false],

            // Notifications
            emailNotifications: [true],
            pushNotifications: [true],
            desktopNotifications: [true],
            mentionNotifications: [true],
            messageNotifications: [true],
            inviteNotifications: [true],
            systemNotifications: [true],

            // Privacy
            showOnlineStatus: [true],
            showLastSeen: [true],
            showEmail: [false],
            showInSearch: [true],
            allowDirectMessages: [true],

            // Chat
            showTypingIndicators: [true],
            showReadReceipts: [true],
            autoDownloadImages: [true],

            // Security
            twoFactorAuth: [false],
            sessionTimeout: [240],
            loginNotifications: [true]
        });
    }

    /**
     * Load user preferences
     */
    private loadUserPreferences(): void {
        this.isLoading = true;

        this.clientService.getPreferences()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.currentPreferences = response.data;
                        this.populateForm(response.data);
                        this.applyTheme(response.data.theme);
                    } else {
                        this.snackBar.open('Failed to load preferences', 'Close', { duration: 3000 });
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading preferences:', error);
                    this.snackBar.open('Failed to load preferences', 'Close', { duration: 3000 });
                    this.isLoading = false;
                }
            });
    }

    /**
     * Populate form with user preferences
     */
    private populateForm(preferences: any): void {
        this.settingsForm.patchValue({
            // Appearance
            theme: preferences.theme || 'light',
            language: preferences.language || 'en',
            fontSize: preferences.chat?.fontSize || 'medium',
            compactMode: preferences.chat?.compactMode || false,

            // Notifications
            emailNotifications: preferences.notifications?.email || true,
            pushNotifications: preferences.notifications?.push || true,
            desktopNotifications: preferences.notifications?.desktop || true,
            mentionNotifications: preferences.notifications?.mentions || true,
            messageNotifications: preferences.notifications?.messages || true,
            inviteNotifications: preferences.notifications?.invites || true,
            systemNotifications: preferences.notifications?.system || true,

            // Privacy
            showOnlineStatus: preferences.privacy?.showOnlineStatus || true,
            showLastSeen: preferences.privacy?.showLastSeen || true,
            showEmail: preferences.privacy?.showEmail || false,
            showInSearch: preferences.privacy?.showInSearch || true,
            allowDirectMessages: preferences.privacy?.allowDirectMessages || true,

            // Chat
            showTypingIndicators: preferences.chat?.showTypingIndicators || true,
            showReadReceipts: preferences.chat?.showReadReceipts || true,
            autoDownloadImages: preferences.chat?.autoDownloadImages || true,

            // Security
            twoFactorAuth: preferences.security?.twoFactorAuth || false,
            sessionTimeout: preferences.security?.sessionTimeout || 240,
            loginNotifications: preferences.security?.loginNotifications || true
        });
    }

    /**
     * Save settings
     */
    saveSettings(): void {
        if (!this.settingsForm.valid) {
            this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isSaving = true;
        const formValue = this.settingsForm.value;

        const preferences = {
            theme: formValue.theme,
            language: formValue.language,
            notifications: {
                email: formValue.emailNotifications,
                push: formValue.pushNotifications,
                desktop: formValue.desktopNotifications,
                mentions: formValue.mentionNotifications,
                messages: formValue.messageNotifications,
                invites: formValue.inviteNotifications,
                system: formValue.systemNotifications
            },
            privacy: {
                showOnlineStatus: formValue.showOnlineStatus,
                showLastSeen: formValue.showLastSeen,
                showEmail: formValue.showEmail,
                showInSearch: formValue.showInSearch,
                allowDirectMessages: formValue.allowDirectMessages
            },
            chat: {
                showTypingIndicators: formValue.showTypingIndicators,
                showReadReceipts: formValue.showReadReceipts,
                autoDownloadImages: formValue.autoDownloadImages,
                compactMode: formValue.compactMode,
                fontSize: formValue.fontSize
            },
            security: {
                twoFactorAuth: formValue.twoFactorAuth,
                sessionTimeout: formValue.sessionTimeout,
                loginNotifications: formValue.loginNotifications
            }
        };

        this.clientService.updatePreferences(preferences)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.currentPreferences = preferences;
                        this.applyTheme(preferences.theme);
                        this.settingsForm.markAsPristine();
                        this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
                    } else {
                        this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 });
                    }
                    this.isSaving = false;
                },
                error: (error) => {
                    console.error('Error saving settings:', error);
                    this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 });
                    this.isSaving = false;
                }
            });
    }

    /**
     * Reset to default settings
     */
    resetToDefaults(): void {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            this.populateForm(this.getDefaultPreferences());
            this.settingsForm.markAsDirty();
            this.snackBar.open('Settings reset to defaults', 'Close', { duration: 2000 });
        }
    }

    /**
     * Get default preferences
     */
    private getDefaultPreferences(): any {
        return {
            theme: 'light',
            language: 'en',
            fontSize: 'medium',
            compactMode: false,
            notifications: {
                email: true,
                push: true,
                desktop: true,
                mentions: true,
                messages: true,
                invites: true,
                system: true
            },
            privacy: {
                showOnlineStatus: true,
                showLastSeen: true,
                showEmail: false,
                showInSearch: true,
                allowDirectMessages: true
            },
            chat: {
                showTypingIndicators: true,
                showReadReceipts: true,
                autoDownloadImages: true,
                compactMode: false,
                fontSize: 'medium'
            },
            security: {
                twoFactorAuth: false,
                sessionTimeout: 240,
                loginNotifications: true
            }
        };
    }

    /**
     * Apply theme to the application
     */
    private applyTheme(theme: string): void {
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

        // Store theme preference in localStorage for persistence
        localStorage.setItem('theme', theme);
    }

    /**
     * Setup theme change listener for auto theme
     */
    private setupThemeChangeListener(): void {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            if (this.currentPreferences?.theme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }
}
