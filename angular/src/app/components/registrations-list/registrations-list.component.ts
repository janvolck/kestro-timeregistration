import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeRegistrationService } from '../../services/time-registration.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-registrations-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registrations-list.component.html',
  styleUrls: ['./registrations-list.component.css']
})
export class RegistrationsListComponent implements OnInit {
  selectedDate: string = '';
  registrations = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  columnHeaders = signal<string[]>([]);

  // Computed translations
  titleLabel = computed(() => this.translationService.translate('registrations.title', 'Time Registrations'));
  selectDateLabel = computed(() => this.translationService.translate('registrations.selectDate', 'Select Date:'));
  loadingLabel = computed(() => this.translationService.translate('registrations.loading', 'Loading registrations...'));
  noDataLabel = computed(() => this.translationService.translate('registrations.noData', 'No time registrations found for'));
  totalHoursLabel = computed(() => this.translationService.translate('registrations.totalHours', 'Total Hours:'));

  constructor(
    private timeRegistrationService: TimeRegistrationService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    this.fetchRegistrations();
  }

  onDateChange() {
    if (this.selectedDate) {
      this.fetchRegistrations();
    }
  }

  fetchRegistrations() {
    this.isLoading.set(true);
    this.error.set('');

    this.timeRegistrationService.getRegistrations(this.selectedDate).subscribe({
      next: (data) => {
        console.log('Registrations received:', data);
        this.registrations.set(data);

        // Extract column headers from the first registration
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          console.log('Column headers:', headers);
          this.columnHeaders.set(headers);
        } else {
          this.columnHeaders.set([]);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to fetch registrations');
        console.error('Error fetching registrations:', err);
        this.isLoading.set(false);
      }
    });
  }

  getTotalHours(): number {
    return this.registrations().reduce((total, registration) => {
      return total + (registration.Hours || 0);
    }, 0);
  }

  trackByRegistrationId(index: number, registration: any): string {
    // Always create a unique composite key that includes the index
    // This ensures absolute uniqueness even when Id values are duplicated
    const id = registration.Id || '';
    const date = registration.Date || '';
    const customer = registration.Customer || '';
    const employee = registration.Employee || '';
    const hours = registration.Hours || 0;

    // Create a composite key that includes index to guarantee uniqueness
    const compositeKey = `${id}_${date}_${customer}_${employee}_${hours}_${index}`;
    return compositeKey;
  }

  getRegistrationValue(registration: any, key: string): string {
    const value = registration[key];
    return value != null ? String(value) : '-';
  }
}
