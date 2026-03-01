import { Component, signal, OnInit, computed, Inject } from '@angular/core';
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
export class App implements OnInit {
  protected readonly title = signal('angular');

  // App title comes from environment for customer-specific branding
  appTitle = signal(environment.appTitle);

  // Navigation labels still use translations for language support
  projectsLabel = computed(() => this.translationService.translate('nav.projects', 'Projects'));

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
}
