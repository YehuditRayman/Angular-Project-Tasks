import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList implements OnInit {
  projectsService = inject(ProjectsService);
  route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  currentTeamId = signal<string>('');
  isCreateOpen = signal(false);

  projectForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

  teamProjects = computed(() => {
    const allProjects = this.projectsService.myProjects();
    const teamId = this.currentTeamId();
    return allProjects.filter(p => String(p.team_id) === String(teamId));
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('team_id');
    if (id) {
      this.currentTeamId.set(id);
    }
    this.projectsService.loadProjects();
  }

  toggleCreate() {
    this.isCreateOpen.update(v => !v);
  }

  createProject() {
    if (this.projectForm.invalid) return;

    const { name, description } = this.projectForm.value;
    const teamId = this.currentTeamId();

    this.projectsService.addProject(teamId, name!, description!).subscribe({
      next: () => {
        this.projectForm.reset();
        this.isCreateOpen.set(false);
        this.toast.show('The project was created successfully.', 'success');
      },
      error: () => this.toast.show('Error creating project', 'error')
    });
  }
}