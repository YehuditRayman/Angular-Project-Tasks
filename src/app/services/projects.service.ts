import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Project, User } from '../models/types.model';
import { tap } from 'rxjs';
import { TeamsService } from './teams.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;
  teamService=inject(TeamsService)
  
  myProjects = signal<Project[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadProjects() {
    this.isLoading.set(true);
    this.error.set(null); 

    this.http.get<Project[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.myProjects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err); 
        this.error.set('שגיאה בטעינת פרויקטים');
        this.isLoading.set(false);
      }
    });
  }

  addProject(teamId: string, name: string, description: string) {
    const body = { teamId, name, description };
    
    return this.http.post<Project>(this.apiUrl, body).pipe(
      tap((newProject) => {
        this.myProjects.update(list => [...list, newProject]);
      })
    );
  }

  
}