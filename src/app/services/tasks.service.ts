import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Project, Task, Team } from '../models/types.model';
import { AuthService } from './auth.service';
import { tap, catchError, throwError, forkJoin, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/tasks`;

  myTasks = signal<Task[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private formatDate(date: any): string | null {
    if (!date) return null;

    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  private normalizeTask(task: Task): Task {
  if (!task.due_date) {
    return { ...task, due_date: null };
  }

  const d = new Date(task.due_date);
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  console.log(task.due_date);
  return {
    ...task,
    due_date: dateOnly
  };
}

  loadTasks(projectId: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<Task[]>(this.apiUrl, {
      params: { projectId }
    }).subscribe({
      next: (data) => {
        const normalized = data.map(t => this.normalizeTask(t));
        this.myTasks.set(normalized);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('לא הצלחנו לטעון את המשימות.');
        this.isLoading.set(false);
      }
    });
  }

  loadAllTasksFromProjects(projects: Project[], teams: Team[]) {
    this.isLoading.set(true);
    this.error.set(null);
    this.myTasks.set([]);

    if (!projects || projects.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const requests = projects.map(proj =>
      this.http.get<Task[]>(this.apiUrl, { params: { projectId: proj.id } }).pipe(
        map(tasks => tasks.map(t => {
          const team = teams.find(team => String(team.id) === String(proj.team_id));
          return {
            ...t,
            project_name: proj.name,
            projectId: proj.id,
            team_id: proj.team_id,
            team_name: team ? team.name : 'צוות לא ידוע'
          };
        })),
        catchError(() => of([]))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const allTasks = results
          .flat()
          .map(t => this.normalizeTask(t));

        this.myTasks.set(allTasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('שגיאה בטעינת הנתונים');
        this.isLoading.set(false);
      }
    });
  }

  addTask(
    projectId: string,
    title: string,
    description: string,
    due_date?: Date | null,
    priority: 'low' | 'normal' | 'high' = 'normal',
    status: 'todo' | 'in_progress' | 'done' = 'todo'
  ) {
    const currentUserId = this.authService.currentUser()?.id;
    const finalDate = this.formatDate(due_date);
    const body = {
      projectId,
      title,
      description,
      due_date: finalDate,
      priority,
      status,
      assigneeId: currentUserId,
      orderIndex: 0
    };
    return this.http.post<Task>(this.apiUrl, body).pipe(
      tap((newTask) => {
        const normalizedTask = this.normalizeTask(newTask);
        

        this.myTasks.update(list => [...list, normalizedTask]);
        this.error.set(null);
      }),
      catchError((err) => {
        this.error.set('שגיאה ביצירת המשימה');
        return throwError(() => err);
      })
    );
  }

  deleteTask(taskId: string) {
    return this.http.delete(`${this.apiUrl}/${taskId}`).pipe(
      tap(() => {
        this.myTasks.update(tasks => tasks.filter(t => t.id !== taskId));
      }),
      catchError((err) => {
        this.error.set('שגיאה במחיקת המשימה');
        return throwError(() => err);
      })
    );
  }

  updateTask(taskId: string, changes: any) {
    if ('due_date' in changes) {
      changes.due_date = this.formatDate(changes.due_date);
    }

    return this.http.patch<Task>(`${this.apiUrl}/${taskId}`, changes).pipe(
      tap((updatedTask) => {
        this.myTasks.update(tasks =>
          tasks.map(t => t.id === taskId ? updatedTask : t)
        );
      }),
      catchError((err) => {
        this.error.set('שגיאה בעדכון המשימה');
        return throwError(() => err);
      })
    );
  }
}