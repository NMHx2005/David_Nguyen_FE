import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientLayoutComponent } from '../../shared/Layout/client-layout.component';
import { HeroSectionComponent } from './ui/hero-section.component';
import { FeaturesSectionComponent } from './ui/features-section.component';
import { HowItWorksSectionComponent } from './ui/how-it-works-section.component';
import { CtaSectionComponent } from './ui/cta-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ClientLayoutComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    HowItWorksSectionComponent,
    CtaSectionComponent
  ],
  template: `
    <app-client-layout 
      pageTitle="Welcome to ChatSystem" 
      pageDescription="Connect, collaborate, and communicate with your team in real-time">
      
      <!-- Hero Section -->
      <app-hero-section></app-hero-section>

      <!-- Features Section -->
      <app-features-section></app-features-section>

      <!-- How It Works Section -->
      <app-how-it-works-section></app-how-it-works-section>

      <!-- CTA Section -->
      <app-cta-section></app-cta-section>
    </app-client-layout>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    // Placeholder for initialization logic, e.g., fetching featured groups or analytics data
  }
}