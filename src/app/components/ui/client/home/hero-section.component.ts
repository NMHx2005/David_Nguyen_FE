import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-hero-section',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section class="hero-section">
      <div class="hero-content">
        <h1>Transform Your Team Communication</h1>
        <p>Experience seamless real-time chat, voice, and video communication with our advanced collaboration platform.</p>
        <div class="hero-buttons">
          <button mat-raised-button color="primary" routerLink="/chat" class="cta-button" matTooltip="Start chatting now">
            <mat-icon>chat</mat-icon>
            Start Chatting
          </button>
          <button mat-stroked-button color="primary" routerLink="/groups" class="secondary-button" matTooltip="Explore and join groups">
            <mat-icon>groups</mat-icon>
            Join Groups
          </button>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-visual">
          <mat-icon class="hero-icon">chat_bubble</mat-icon>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
      margin-bottom: 64px;
      padding: 24px;
      background: #f8f9fa;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .hero-content p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #666;
      margin: 0 0 24px 0;
    }

    .hero-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cta-button {
      padding: 12px 24px;
      font-size: 1rem;
      height: 44px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .cta-button:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6b3e8e 100%);
      transform: translateY(-2px);
    }

    .secondary-button {
      padding: 12px 24px;
      font-size: 1rem;
      height: 44px;
      border-color: #667eea;
      color: #667eea;
    }

    .secondary-button:hover {
      background: #e3f2fd;
      transform: translateY(-2px);
    }

    .hero-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-visual {
      width: 250px;
      height: 250px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 32px rgba(102, 126, 234, 0.2);
    }

    .hero-icon {
      font-size: 100px;
      color: white;
    }

    @media (max-width: 768px) {
      .hero-section {
        grid-template-columns: 1fr;
        gap: 32px;
        text-align: center;
      }

      .hero-content h1 {
        font-size: 2rem;
      }

      .hero-buttons {
        justify-content: center;
      }

      .hero-visual {
        width: 200px;
        height: 200px;
      }

      .hero-icon {
        font-size: 80px;
      }
    }
  `]
})
export class HeroSectionComponent {
}
