import { Component, OnInit, signal } from '@angular/core';
import { ProjectsService, Project } from '../../services/projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  columnHeaders = signal<string[]>([]);

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectsService.getProjects().subscribe({
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
        this.error.set('Failed to load projects. Please try again.');
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
}
