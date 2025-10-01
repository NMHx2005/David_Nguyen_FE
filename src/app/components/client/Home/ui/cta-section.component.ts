import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-cta-section',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section class="cta-section">
      <div class="cta-content">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of teams already using ChatSystem to improve their communication and collaboration.</p>
        <button mat-raised-button color="primary" routerLink="/chat" class="cta-button-large" matTooltip="Get started with ChatSystem">
          <mat-icon>rocket_launch</mat-icon>
          Get Started Now
        </button>
      </div>
    </section>
  `,
    styles: [`
    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 64px 24px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .cta-content h2 {
      font-size: 2.2rem;
      font-weight: 600;
      margin: 0 0 16px 0;
    }

    .cta-content p {
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 0 0 32px 0;
      opacity: 0.9;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-button-large {
      padding: 16px 32px;
      font-size: 1.1rem;
      height: 56px;
      background: white;
      color: #667eea;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .cta-button-large:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .cta-button-large mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .cta-content h2 {
        font-size: 1.8rem;
      }

      .cta-button-large {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class CtaSectionComponent {
}
