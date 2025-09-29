import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-client-footer',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <footer class="client-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>ChatSystem</h3>
          <p>Connect, collaborate, and communicate with your team in real-time.</p>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/chat" matTooltip="Go to chat">Chat</a></li>
            <li><a routerLink="/channels" matTooltip="View channels">Channels</a></li>
            <li><a routerLink="/groups" matTooltip="Browse groups">Groups</a></li>
            <li><a routerLink="/help" matTooltip="Get help">Help</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a routerLink="/contact" matTooltip="Contact support">Contact Us</a></li>
            <li><a routerLink="/faq" matTooltip="Frequently asked questions">FAQ</a></li>
            <li><a routerLink="/privacy" matTooltip="Privacy policy">Privacy Policy</a></li>
            <li><a routerLink="/terms" matTooltip="Terms of service">Terms of Service</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Connect</h4>
          <div class="social-links">
            <a href="https://facebook.com" class="social-link" matTooltip="Follow us on Facebook">
              <mat-icon>facebook</mat-icon>
            </a>
            <a href="https://twitter.com" class="social-link" matTooltip="Follow us on Twitter">
              <mat-icon>twitter</mat-icon>
            </a>
            <a href="https://linkedin.com" class="social-link" matTooltip="Connect on LinkedIn">
              <mat-icon>linkedin</mat-icon>
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 ChatSystem. All rights reserved.</p>
      </div>
    </footer>
  `,
    styles: [`
    .client-footer {
      background: #2c3e50;
      color: white;
      padding: 48px 0 24px;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 32px;
    }

    .footer-section h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #ecf0f1;
    }

    .footer-section h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #ecf0f1;
    }

    .footer-section p {
      color: #bdc3c7;
      line-height: 1.6;
      margin: 0;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 8px;
    }

    .footer-section ul li a {
      color: #bdc3c7;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section ul li a:hover {
      color: white;
    }

    .social-links {
      display: flex;
      gap: 12px;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 32px;
      padding-top: 24px;
      text-align: center;
    }

    .footer-bottom p {
      color: #bdc3c7;
      margin: 0;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 24px;
        text-align: center;
      }

      .social-links {
        justify-content: center;
      }
    }
  `]
})
export class ClientFooterComponent {
}
