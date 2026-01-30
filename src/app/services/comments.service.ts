import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Comment } from '../models/types.model';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  currentComments = signal<Comment[]>([]); 

  loadComments(taskId: string) {
    this.currentComments.set([]); 
    this.http.get<Comment[]>(`${this.apiUrl}?taskId=${taskId}`).subscribe({
      next: (data) => {
        this.currentComments.set(data); 
      },
      error: (err) => console.error('שגיאה בטעינת תגובות', err)
    });
  }

  addComment(taskId: string, body: string) {
    const payload = { taskId, body };

    return this.http.post<Comment>(this.apiUrl, payload).pipe(
      tap((newComment) => {
        this.currentComments.update(list => [...list, newComment]);
      })
    );
  }
}