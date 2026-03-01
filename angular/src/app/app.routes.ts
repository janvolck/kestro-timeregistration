import { Routes } from '@angular/router';
import { ProjectsComponent } from './components/projects/projects.component';
import { TimeRegistrationComponent } from './components/time-registration/time-registration.component';

export const routes: Routes = [
  { path: '', redirectTo: '/time-registration', pathMatch: 'full' },
  { path: 'projects', component: ProjectsComponent },
  { path: 'time-registration', component: TimeRegistrationComponent },
  { path: '**', redirectTo: '/time-registration' } // Wildcard route for unknown paths
];
