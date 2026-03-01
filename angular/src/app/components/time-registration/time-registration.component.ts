import { Component, OnInit, signal, computed } from '@angular/core';
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
  projects = signal<Project[]>([]);
  employees = signal<Employee[]>([]);
  hoursOptions = signal<{value: number, label: string}[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  // Form data
  selectedProjectId = signal<number | null>(null);
  selectedEmployeeId = signal<number | null>(null);
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

  constructor(
    private timeRegistrationService: TimeRegistrationService,
    private translationService: TranslationService
  ) {
    this.generateHoursOptions();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private generateHoursOptions(): void {
    const options: {value: number, label: string}[] = [];

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
    this.selectedProjectId.set(value ? parseInt(value, 10) : null);
  }

  onEmployeeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedEmployeeId.set(value ? parseInt(value, 10) : null);
  }

  onHoursChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedHours.set(value ? parseFloat(value) : null);
  }

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedDate.set(target.value);
  }

  isFormValid(): boolean {
    return this.selectedProjectId() !== null &&
           this.selectedEmployeeId() !== null &&
           this.selectedHours() !== null &&
           this.selectedDate() !== '';
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
    return this.employees().find(emp => this.getEmployeeId(emp) === employeeId) || null;
  }

  private getSelectedProject(): Project | null {
    const projectId = this.selectedProjectId();
    if (projectId === null) return null;
    return this.projects().find(proj => this.getProjectId(proj) === projectId) || null;
  }

  getProjectDisplayValue(project: Project): string {
    // Assume the project has a name or title field, adjust based on actual structure
    return project['name'] || project['title'] || project['project_name'] || JSON.stringify(project);
  }

  getProjectId(project: Project): number {
    // Assume the project has an id field, adjust based on actual structure
    return project['id'] || project['project_id'] || 0;
  }

  getEmployeeDisplayValue(employee: Employee): string {
    // Assume the employee has a name field, adjust based on actual structure
    return employee['name'] || employee['full_name'] || employee['employee_name'] || JSON.stringify(employee);
  }

  getEmployeeId(employee: Employee): number {
    // Assume the employee has an id field, adjust based on actual structure
    return employee['id'] || employee['employee_id'] || 0;
  }
}
