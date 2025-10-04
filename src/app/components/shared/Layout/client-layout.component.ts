import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../components/auth/auth.service';
import { User } from '../../../models/user.model';
import { ClientHeaderComponent } from './ui/client-header.component';
import { ClientFooterComponent } from './ui/client-footer.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ClientHeaderComponent,
    ClientFooterComponent
  ],
  template: `
    <div class="client-layout">
      <!-- Header -->
      <app-client-header
        [notificationCount]="notificationCount"
        [notifications]="notifications"
        [currentUser]="currentUser"
        (logout)="onLogout()">
      </app-client-header>

      <!-- Page Header -->
      <div class="page-header" *ngIf="pageTitle">
        <div class="page-header-content">
          <h1>{{ pageTitle }}</h1>
          <p *ngIf="pageDescription">{{ pageDescription }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <ng-content></ng-content>
      </main>

      <!-- Footer -->
      <app-client-footer></app-client-footer>
    </div>
  `,
  styles: [`
    .client-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 48px 0;
    }

    .page-header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      text-align: center;
    }

    .page-header-content h1 {
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .page-header-content p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .main-content {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .page-header-content {
        padding: 0 16px;
      }

      .page-header-content h1 {
        font-size: 2rem;
      }

      .main-content {
        padding: 16px;
      }
    }
  `]
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  @Input() pageTitle?: string;
  @Input() pageDescription?: string;
  @Input() notificationCount: number = 0;

  private destroy$ = new Subject<void>();
  currentUser: User | null = null;

  // Mock notifications for demonstration
  notifications: { icon: string; text: string }[] = [
    { icon: 'chat', text: 'New message received' },
    { icon: 'group_add', text: 'Added to new group' }
  ];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user ? this.convertAuthUserToModelUser(user) : null;
      });
  }

  private convertAuthUserToModelUser(authUser: any): User {
    return {
      id: authUser._id || authUser.id,
      username: authUser.username,
      email: authUser.email,
      roles: authUser.roles || [],
      role: authUser.role,
      groups: authUser.groups || [],
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt,
      avatarUrl: authUser.avatar || authUser.avatarUrl,
      isActive: authUser.isActive
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Logout successful');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Navigate to login even if logout request fails
      this.router.navigate(['/login']);
    }
  }
}