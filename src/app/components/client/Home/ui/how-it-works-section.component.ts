import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface Step {
    number: string;
    icon: string;
    title: string;
    description: string;
}

@Component({
    selector: 'app-how-it-works-section',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule
    ],
    template: `
    <section class="how-it-works-section">
      <h2>How It Works</h2>
      <mat-divider></mat-divider>
      <div class="steps-container">
        <ng-container *ngFor="let step of steps; let i = index">
          <mat-card class="step">
            <div class="step-number">{{ step.number }}</div>
            <mat-icon class="step-icon">{{ step.icon }}</mat-icon>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </mat-card>
          
          <mat-icon *ngIf="i < steps.length - 1" class="step-arrow">arrow_forward</mat-icon>
        </ng-container>
      </div>
    </section>
  `,
    styles: [`
    .how-it-works-section {
      margin-bottom: 64px;
      padding: 24px;
      background: #f8f9fa;
    }

    .how-it-works-section h2 {
      font-size: 2.2rem;
      font-weight: 600;
      text-align: center;
      margin: 0 0 24px 0;
      color: #333;
    }

    .steps-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      margin-top: 32px;
      flex-wrap: wrap;
    }

    .step {
      flex: 1;
      min-width: 200px;
      max-width: 280px;
      text-align: center;
      padding: 24px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
    }

    .step:hover {
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
      transform: translateY(-4px);
    }

    .step-number {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .step-icon {
      font-size: 48px;
      color: #667eea;
      margin: 16px 0;
    }

    .step h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
    }

    .step p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .step-arrow {
      font-size: 32px;
      color: #667eea;
      margin: 0 8px;
    }

    @media (max-width: 768px) {
      .steps-container {
        flex-direction: column;
        gap: 24px;
      }

      .step-arrow {
        transform: rotate(90deg);
      }
    }
  `]
})
export class HowItWorksSectionComponent {
    steps: Step[] = [
        {
            number: '1',
            icon: 'person_add',
            title: 'Create Account',
            description: 'Sign up with your email and create your profile to get started.'
        },
        {
            number: '2',
            icon: 'group_add',
            title: 'Join Groups',
            description: 'Discover and join groups that match your interests or team structure.'
        },
        {
            number: '3',
            icon: 'chat',
            title: 'Start Chatting',
            description: 'Begin conversations in channels or start direct messages with team members.'
        }
    ];
}
