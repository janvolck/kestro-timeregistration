import { Component, OnInit, signal, computed } from '@angular/core';
import { TimeRegistrationService, Project } from '../../services/time-registration.service';
import { TranslationService } from '../../services/translation.service';
import { TimeRegistrationComponent } from '../time-registration/time-registration.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [TimeRegistrationComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  columnHeaders = signal<string[]>([]);
  showPopup = signal<boolean>(false);
  selectedProject = signal<Project | null>(null);

  // Computed translations
  projectsTitle = computed(() => this.translationService.translate('projects.title', 'Projects'));
  refreshLabel = computed(() => this.translationService.translate('projects.refresh', 'Refresh'));
  loadingLabel = computed(() => this.translationService.translate('projects.loading', 'Loading...'));
  noProjectsLabel = computed(() => this.translationService.translate('projects.noProjects', 'No projects found.'));
  errorLabel = computed(() => this.translationService.translate('projects.error', 'Failed to load projects. Please try again.'));
  tryAgainLabel = computed(() => this.translationService.translate('projects.tryAgain', 'Try Again'));

  constructor(
    private timeRegistrationService: TimeRegistrationService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.timeRegistrationService.getProjects().subscribe({
      next: (projects) => {
        console.log('Projects received:', projects);
        console.log('Number of projects:', projects.length);

        this.projects.set(projects);

        // Extract column headers from the first project
        if (projects.length > 0) {
          const headers = Object.keys(projects[0]);
          console.log('Column headers:', headers);
          this.columnHeaders.set(headers);
        } else {
          console.log('No projects found');
          this.columnHeaders.set([]);
        }

        this.loading.set(false);
        console.log('Loading completed, projects count:', this.projects().length);
        console.log('Column headers count:', this.columnHeaders().length);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.error.set(this.errorLabel());
        this.loading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadProjects();
  }

  trackByProjectId(index: number, project: Project): any {
    // Use the first property value as ID, or fallback to index
    const firstKey = Object.keys(project)[0];
    return firstKey ? project[firstKey] : index;
  }

  getProjectValue(project: Project, key: string): string {
    const value = project[key];
    return value != null ? String(value) : '-';
  }

  onRowClick(project: Project): void {
    console.log('Row clicked, project:', project);
    this.selectedProject.set(project);
    this.showPopup.set(true);
  }

  closePopup(): void {
    this.showPopup.set(false);
    this.selectedProject.set(null);
  }

  onPopupBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }
}
