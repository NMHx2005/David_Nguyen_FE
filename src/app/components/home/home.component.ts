import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientLayoutComponent } from '../layouts/client-layout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    ClientLayoutComponent
  ],
  template: `
    <app-client-layout 
      pageTitle="Welcome to ChatSystem" 
      pageDescription="Connect, collaborate, and communicate with your team in real-time">
      
      <!-- Hero Section -->
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

      <!-- Features Section -->
      <section class="features-section">
        <h2>Why Choose ChatSystem?</h2>
        <mat-divider></mat-divider>
        <div class="features-grid">
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="feature-icon">chat_bubble</mat-icon>
              <mat-card-title>Real-time Chat</mat-card-title>
              <mat-card-subtitle>Instant messaging with your team</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Send messages instantly and see responses in real-time. Support for text, emojis, and file sharing.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="feature-icon">forum</mat-icon>
              <mat-card-title>Channels</mat-card-title>
              <mat-card-subtitle>Organized communication spaces</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Create dedicated channels for different topics, projects, or teams to keep conversations organized.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="feature-icon">groups</mat-icon>
              <mat-card-title>Groups</mat-card-title>
              <mat-card-subtitle>Team collaboration hubs</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Form groups around common interests, projects, or departments for focused collaboration.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="feature-icon">security</mat-icon>
              <mat-card-title>Secure & Private</mat-card-title>
              <mat-card-subtitle>Your data is protected</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>End-to-end encryption and role-based access control ensure your conversations remain private and secure.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="feature-icon">devices</mat-icon>
              <mat-card-title>Cross-platform</mat-card-title>
              <mat-card-subtitle>Access from anywhere</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Use ChatSystem on any device - desktop, tablet, or mobile - with a consistent experience across platforms.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="feature-icon">analytics</mat-icon>
              <mat-card-title>Analytics</mat-card-title>
              <mat-card-subtitle>Track engagement & insights</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Monitor team activity, message volume, and engagement patterns to optimize your communication strategy.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <h2>How It Works</h2>
        <mat-divider></mat-divider>
        <div class="steps-container">
          <mat-card class="step">
            <div class="step-number">1</div>
            <mat-icon class="step-icon">person_add</mat-icon>
            <h3>Create Account</h3>
            <p>Sign up with your email and create your profile to get started.</p>
          </mat-card>
          
          <mat-icon class="step-arrow">arrow_forward</mat-icon>
          
          <mat-card class="step">
            <div class="step-number">2</div>
            <mat-icon class="step-icon">group_add</mat-icon>
            <h3>Join Groups</h3>
            <p>Discover and join groups that match your interests or team structure.</p>
          </mat-card>
          
          <mat-icon class="step-arrow">arrow_forward</mat-icon>
          
          <mat-card class="step">
            <div class="step-number">3</div>
            <mat-icon class="step-icon">chat</mat-icon>
            <h3>Start Chatting</h3>
            <p>Begin conversations in channels or start direct messages with team members.</p>
          </mat-card>
        </div>
      </section>

      <!-- CTA Section -->
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
    </app-client-layout>
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

    .features-section {
      margin-bottom: 64px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    }

    .features-section h2 {
      text-align: center;
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0 24px 0;
      color: #333;
    }

    .features-grid {
      display: grid;
      padding: 20px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .feature-card {
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 12px;
      background: white;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
      font-size: 36px;
      color: #667eea;
    }

    .how-it-works-section {
      margin-bottom: 64px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    .how-it-works-section h2 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0 24px 0;
      color: #333;
    }

    .steps-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
    }

    .step {
      text-align: center;
      max-width: 250px;
      border-radius: 12px;
      padding: 16px;
      background: white;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .step:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .step-number {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 auto 16px;
    }

    .step-icon {
      font-size: 36px;
      color: #667eea;
      margin-bottom: 12px;
    }

    .step h3 {
      font-size: 1.2rem;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #333;
    }

    .step p {
      color: #666;
      line-height: 1.5;
      margin: 0;
      font-size: 0.9rem;
    }

    .step-arrow {
      color: #667eea;
      font-size: 24px;
    }

    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 64px 24px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .cta-content h2 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0 16px 0;
    }

    .cta-content p {
      font-size: 1.1rem;
      margin: 0 0 24px 0;
      opacity: 0.9;
    }

    .cta-button-large {
      padding: 12px 32px;
      font-size: 1.1rem;
      height: 48px;
      background: white;
      color: #667eea;
    }

    .cta-button-large:hover {
      background: #f5f5f5;
      transform: translateY(-2px);
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

      .features-grid {
        grid-template-columns: 1fr;
      }

      .steps-container {
        flex-direction: column;
        gap: 24px;
      }

      .step-arrow {
        transform: rotate(90deg);
      }

      .cta-content h2 {
        font-size: 1.8rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    // Placeholder for initialization logic, e.g., fetching featured groups or analytics data
  }
}