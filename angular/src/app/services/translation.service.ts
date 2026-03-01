import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations = signal<Translations>({});
  private currentLanguage = signal<string>('en');

  constructor(private http: HttpClient) {
    this.loadTranslations('en'); // Default language
  }

  loadTranslations(language: string): Observable<Translations> {
    return new Observable(observer => {
      this.http.get<Translations>(`/assets/i18n/${language}.json`).subscribe({
        next: (translations) => {
          this.translations.set(translations);
          this.currentLanguage.set(language);
          observer.next(translations);
          observer.complete();
        },
        error: (err) => {
          console.warn(`Failed to load translations for ${language}, falling back to English`);
          if (language !== 'en') {
            this.loadTranslations('en').subscribe(observer);
          } else {
            observer.error(err);
          }
        }
      });
    });
  }

  translate(key: string, defaultValue?: string): string {
    return this.translations()[key] || defaultValue || key;
  }

  getTranslations() {
    return this.translations;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setLanguage(language: string) {
    this.loadTranslations(language);
  }
}
