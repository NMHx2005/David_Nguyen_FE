import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface Feature {
    icon: string;
    title: string;
    subtitle: string;
    description: string;
}

@Component({
    selector: 'app-features-section',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule
    ],
    template: `
    <section class="features-section">
      <h2>Why Choose ChatSystem?</h2>
      <mat-divider></mat-divider>
      <div class="features-grid">
        <mat-card *ngFor="let feature of features" class="feature-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="feature-icon">{{ feature.icon }}</mat-icon>
            <mat-card-title>{{ feature.title }}</mat-card-title>
            <mat-card-subtitle>{{ feature.subtitle }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ feature.description }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
    styles: [`
    .features-section {
      margin-bottom: 64px;
      padding: 24px;
    }

    .features-section h2 {
      font-size: 2.2rem;
      font-weight: 600;
      text-align: center;
      margin: 0 0 24px 0;
      color: #333;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }

    .feature-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      background: white;
    }

    .feature-card:hover {
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
      transform: translateY(-4px);
    }

    .feature-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .feature-card mat-card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .feature-card mat-card-subtitle {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FeaturesSectionComponent {
    features: Feature[] = [
        {
            icon: 'chat_bubble',
            title: 'Real-time Chat',
            subtitle: 'Instant messaging with your team',
            description: 'Send messages instantly and see responses in real-time. Support for text, emojis, and file sharing.'
        },
        {
            icon: 'forum',
            title: 'Channels',
            subtitle: 'Organized communication spaces',
            description: 'Create dedicated channels for different topics, projects, or teams to keep conversations organized.'
        },
        {
            icon: 'groups',
            title: 'Groups',
            subtitle: 'Team collaboration hubs',
            description: 'Form groups around common interests, projects, or departments for focused collaboration.'
        },
        {
            icon: 'security',
            title: 'Secure & Private',
            subtitle: 'Your data is protected',
            description: 'End-to-end encryption and role-based access control ensure your conversations remain private and secure.'
        },
        {
            icon: 'devices',
            title: 'Cross-platform',
            subtitle: 'Access from anywhere',
            description: 'Use ChatSystem on any device - desktop, tablet, or mobile - with a consistent experience across platforms.'
        },
        {
            icon: 'analytics',
            title: 'Analytics',
            subtitle: 'Track engagement & insights',
            description: 'Monitor team activity, message volume, and engagement patterns to optimize your communication strategy.'
        }
    ];
}
