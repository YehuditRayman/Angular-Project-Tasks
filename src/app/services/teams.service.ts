import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Member, Team } from '../models/types.model';
import { tap } from 'rxjs'; // <--- חובה לייבא את זה

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teams`;

  myTeams = signal<Team[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadTeams() {
    this.isLoading.set(true);
    this.http.get<Team[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.myTeams.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('שגיאה בטעינה');
        this.isLoading.set(false);
      }
    });
  }
  
  addTeam(name: string) {
    return this.http.post<Team>(this.apiUrl, { name }).pipe(
      tap((newTeam) => {
        this.myTeams.update(currentTeams => [...currentTeams, newTeam]);
      })
    );
  }

  addMember(userId: number, teamId: string) {
    return this.http.post<Member>(`${this.apiUrl}/${teamId}/members`, { userId }).pipe(
      tap(() => {
        // עדכון הרשימה המקומית (Client Side Update)
        this.myTeams.update(teams => 
          teams.map(team => {
            // כעת ההשוואה תקינה: string === string
            if (team.id === teamId) {
              // מחזירים עותק מעודכן של הצוות עם מונה + 1
              return { ...team, members_count: (team.members_count || 0) + 1 };
            }
            return team; 
          })
        );
      })
    );
  }
}