import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  [key: string]: any;
}

export interface Employee {
  [key: string]: any;
}

export interface TimeRegistration {
  employee: Employee;
  project: Project;
  hours: number;
  date: string;
}

export interface TimeRegistrationRequest {
  employee: Employee;
  project: Project;
  hours: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeRegistrationService {
  private apiUrl = `${environment.apiUrl}/api/kestro/timeregistration`;

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  getRegistrations(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/registrations?date=${date}`);
  }

  registerTime(timeRegistration: TimeRegistrationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, timeRegistration);
  }
}
