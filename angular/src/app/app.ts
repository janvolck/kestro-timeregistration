import { Component, signal, OnInit, OnDestroy, computed, Inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { TranslationService } from './services/translation.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('angular');
  private timeInterval?: number;

  // App title comes from environment for customer-specific branding
  appTitle = signal(environment.appTitle);

  // Current date and time, updated every 600ms
  currentDateTime = signal(new Date());

  // Navigation labels still use translations for language support
  projectsLabel = computed(() => this.translationService.translate('nav.projects', 'Projects'));
  timeRegistrationLabel = computed(() => this.translationService.translate('nav.timeRegistration', 'Time Registration'));
  registrationsLabel = computed(() => this.translationService.translate('nav.registrations', 'View Registrations'));

  constructor(
    private translationService: TranslationService,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // Load language from environment configuration
    this.translationService.setLanguage(environment.defaultLanguage);

    // Set document title from environment
    this.titleService.setTitle(environment.documentTitle);

    // Set favicon from environment
    this.setFavicon(environment.faviconPath);

    // Start the time update interval (600ms)
    this.startTimeUpdate();
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private setFavicon(faviconPath: string): void {
    // Remove existing favicon
    const existingFavicon = this.document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Create and add new favicon
    const link = this.document.createElement('link');
    link.rel = 'icon';
    link.type = faviconPath.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    link.href = faviconPath;

    const head = this.document.getElementsByTagName('head')[0];
    head.appendChild(link);
  }

  private startTimeUpdate(): void {
    // Update time immediately
    this.currentDateTime.set(new Date());

    // Set up interval to update every 600ms
    this.timeInterval = window.setInterval(() => {
      this.currentDateTime.set(new Date());
    }, 600);
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }
}
