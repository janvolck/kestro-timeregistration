import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = `${environment.apiUrl}/api/kestro/timeregistration/projects`;

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }
}
