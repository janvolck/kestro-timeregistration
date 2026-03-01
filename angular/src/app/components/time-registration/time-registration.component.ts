import { Component, OnInit, signal, computed, Output, EventEmitter, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeRegistrationService, Project, Employee, TimeRegistrationRequest } from '../../services/time-registration.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-time-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-registration.component.html',
  styleUrls: ['./time-registration.component.css']
})
export class TimeRegistrationComponent implements OnInit {
  @Output() registrationSuccess = new EventEmitter<void>();
  @Input() preSelectedProject: Project | null = null;

  projects = signal<Project[]>([]);
  employees = signal<Employee[]>([]);
  hoursOptions = signal<{ value: number, label: string }[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  // Form data
  selectedProjectId = signal<string | number | null>(null);
  selectedEmployeeId = signal<string | number | null>(null);
  selectedHours = signal<number | null>(null);
  selectedDate = signal<string>(this.getCurrentDate());

  // Computed translations
  timeRegistrationTitle = computed(() => this.translationService.translate('timeRegistration.title', 'Time Registration'));
  projectLabel = computed(() => this.translationService.translate('timeRegistration.project', 'Project'));
  employeeLabel = computed(() => this.translationService.translate('timeRegistration.employee', 'Employee'));
  hoursLabel = computed(() => this.translationService.translate('timeRegistration.hours', 'Hours'));
  dateLabel = computed(() => this.translationService.translate('timeRegistration.date', 'Date'));
  submitLabel = computed(() => this.translationService.translate('timeRegistration.submit', 'Register Time'));
  loadingLabel = computed(() => this.translationService.translate('timeRegistration.loading', 'Loading...'));
  submittingLabel = computed(() => this.translationService.translate('timeRegistration.submitting', 'Submitting...'));
  successMessage = computed(() => this.translationService.translate('timeRegistration.success', 'Time registration successful!'));
  errorMessage = computed(() => this.translationService.translate('timeRegistration.error', 'Failed to register time. Please try again.'));
  selectProjectPlaceholder = computed(() => this.translationService.translate('timeRegistration.selectProject', 'Select a project'));
  selectEmployeePlaceholder = computed(() => this.translationService.translate('timeRegistration.selectEmployee', 'Select employee'));
  selectHoursPlaceholder = computed(() => this.translationService.translate('timeRegistration.selectHours', 'Select hours'));

  // Debug computed property
  debugSelectedProjectId = computed(() => {
    const id = this.selectedProjectId();
    console.log('Template reading selectedProjectId:', id, 'Type:', typeof id);
    return id;
  });

  constructor(
    private timeRegistrationService: TimeRegistrationService,
    private translationService: TranslationService
  ) {
    this.generateHoursOptions();

    // Effect to handle preSelectedProject changes when projects are loaded
    effect(() => {
      const preSelected = this.preSelectedProject;
      const projectsList = this.projects();

      if (preSelected && projectsList.length > 0) {
        console.log('Setting preselected project:', preSelected);
        const projectId = this.getProjectId(preSelected);
        console.log('Project ID to select:', projectId, 'Type:', typeof projectId);

        // Log all available project IDs for comparison
        console.log('Available project IDs:', projectsList.map(p => {
          const id = this.getProjectId(p);
          return { id, type: typeof id, display: this.getProjectDisplayValue(p) };
        }));

        this.selectedProjectId.set(projectId);
        console.log('selectedProjectId after set:', this.selectedProjectId());
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private generateHoursOptions(): void {
    const options: { value: number, label: string }[] = [];

    // Start from 0.25 (15 minutes) and increment by 0.25 (15 minutes) until 8.00
    for (let i = 0.25; i <= 8.0; i += 0.25) {
      const hours = Math.floor(i);
      const minutes = (i % 1) * 60;
      const label = `${hours}:${minutes.toString().padStart(2, '0')}`;
      options.push({ value: i, label });
    }

    this.hoursOptions.set(options);
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load projects and employees
    const projectsPromise = this.timeRegistrationService.getProjects().toPromise();
    const employeesPromise = this.timeRegistrationService.getEmployees().toPromise();

    Promise.all([projectsPromise, employeesPromise])
      .then(([projects, employees]) => {
        this.projects.set(projects || []);
        this.employees.set(employees || []);
        this.loading.set(false);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        this.error.set('Failed to load data');
        this.loading.set(false);
      });
  }

  onProjectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedProjectId.set(value || null);
  }

  onEmployeeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedEmployeeId.set(value || null);
  }

  onHoursChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedHours.set(value ? parseFloat(value) : null);
  }

  isFormValid(): boolean {
    return this.selectedProjectId() !== null &&
      this.selectedEmployeeId() !== null &&
      this.selectedHours() !== null;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const selectedEmployee = this.getSelectedEmployee();
    const selectedProject = this.getSelectedProject();

    if (!selectedEmployee || !selectedProject) {
      return;
    }

    const timeRegistration: TimeRegistrationRequest = {
      employee: selectedEmployee,
      project: selectedProject,
      hours: this.selectedHours()!,
      date: this.selectedDate()
    };

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    this.timeRegistrationService.registerTime(timeRegistration).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        // Reset form
        this.selectedProjectId.set(null);
        this.selectedEmployeeId.set(null);
        this.selectedHours.set(null);
        this.selectedDate.set(this.getCurrentDate());
        // Hide success message after 3 seconds
        setTimeout(() => this.success.set(false), 3000);

        // Emit success event to parent component
        this.registrationSuccess.emit();
      },
      error: (error) => {
        console.error('Error registering time:', error);
        this.submitting.set(false);
        this.error.set('Failed to register time');
      }
    });
  }

  private getSelectedEmployee(): Employee | null {
    const employeeId = this.selectedEmployeeId();
    if (employeeId === null) return null;
    return this.employees().find(emp => String(this.getEmployeeId(emp)) === String(employeeId)) || null;
  }

  private getSelectedProject(): Project | null {
    const projectId = this.selectedProjectId();
    if (projectId === null) return null;
    return this.projects().find(proj => String(this.getProjectId(proj)) === String(projectId)) || null;
  }

  getProjectDisplayValue(project: Project): string {
    // Iterate over all project properties and collect all values
    const values = Object.values(project)
      .filter(value => value != null && typeof value !== 'object' && typeof value !== 'function')
      .map(value => String(value).trim())
      .filter(value => value.length > 0);

    return values.length > 0 ? values.join(' - ') : JSON.stringify(project);
  }

  getProjectId(project: Project): string | number {
    // The first column is always the ID
    const firstValue = Object.values(project)[0];
    return firstValue != null ? firstValue : 0;
  }

  getEmployeeDisplayValue(employee: Employee): string {
    // Iterate over all employee properties and collect all values
    const values = Object.values(employee)
      .filter(value => value != null && typeof value !== 'object' && typeof value !== 'function')
      .map(value => String(value).trim())
      .filter(value => value.length > 0);

    return values.length > 0 ? values.join(' - ') : JSON.stringify(employee);
  }

  getEmployeeId(employee: Employee): string | number {
    // The first column is always the ID
    const firstValue = Object.values(employee)[0];
    return firstValue != null ? firstValue : 0;
  }

  // Helper method to convert values to strings for template use
  toString(value: any): string {
    return value != null ? String(value) : '';
  }
}
