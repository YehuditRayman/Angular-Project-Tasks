import { Component, OnInit, computed, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { ProjectsService } from '../../services/projects.service';
import { TeamsService } from '../../services/teams.service'; // <--- הוספה

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; 
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe,
    MatCardModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatSelectModule, MatOptionModule
  ],
  templateUrl: './all-tasks.html',
  styleUrl: './all-tasks.css',
})
export class AllTasks implements OnInit {
  tasksService = inject(TasksService);
  projectsService = inject(ProjectsService);
  teamsService = inject(TeamsService); 
  selectedTeamId = signal<string | null>(null);
  selectedProjectId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const projects = this.projectsService.myProjects();
      const teams = this.teamsService.myTeams();

      if (projects.length > 0 && teams.length > 0) {
        untracked(() => {
          this.tasksService.loadAllTasksFromProjects(projects, teams);
        });
      }
    });
  }

  ngOnInit() {
    this.projectsService.loadProjects();
    this.teamsService.loadTeams(); 
  }

  availableTeams = computed(() => {
    return this.teamsService.myTeams();
  });

  availableProjects = computed(() => {
    const allProjects = this.projectsService.myProjects();
    const teamId = this.selectedTeamId();

    if (!teamId) return allProjects;
    return allProjects.filter(p => String(p.team_id) === String(teamId));
  });

  filteredTasks = computed(() => {
    let tasks = this.tasksService.myTasks();
    const teamId = this.selectedTeamId();
    const projectId = this.selectedProjectId();

    if (teamId) {
      tasks = tasks.filter(t => String(t.team_id) === String(teamId));
    }

    if (projectId) {
      tasks = tasks.filter(t => t.projectId === projectId);
    }

    return tasks;
  });

  onTeamChange(teamId: string | null) {
    this.selectedTeamId.set(teamId);
    this.selectedProjectId.set(null); 
  }
  getStatusInfo(status: string) {
    switch (status) {
      case 'todo': return { label: 'To Be performed', class: 'status-todo' };
      case 'in_progress': return { label: 'In progress', class: 'status-progress' };
      case 'done': return { label: 'Done', class: 'status-done' };
      default: return { label: status, class: '' };
    }
  }
}