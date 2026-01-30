import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { ToastService } from '../../services/toast.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TeamsService } from '../../services/teams.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-all-projects',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,MatSelectModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule], 
  templateUrl: './all-projects.html',
  styleUrl: './all-projects.css'
})
export class AllProjects implements OnInit {
  projectsService = inject(ProjectsService);
  teamService=inject(TeamsService)
  private toast = inject(ToastService);
  
  searchQuery = signal<string>('');
  searchControl = new FormControl('');
  isCreateOpen = signal(false);

  projectForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    team_id:new FormControl('', [Validators.required])
  });
  constructor() {
    effect(() => {
      const errorMsg = this.projectsService.error();
      if (errorMsg) {
        this.toast.show(errorMsg, 'error');
      }
    });
  }
  allTeams=computed(()=>{
    return this.teamService.myTeams()
  })
  filteredProjects = computed(() => {
    const all = this.projectsService.myProjects();
    const text = this.searchQuery().toLowerCase();
    return all.filter(p => p.name.toLowerCase().includes(text));
  });

  ngOnInit() {
    this.projectsService.loadProjects();
    this.teamService.loadTeams();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  toggleCreate() {
    this.isCreateOpen.update(v => !v);
  }

  createProject() {
    if (this.projectForm.invalid) return;

    const { name, description,team_id } = this.projectForm.value;
    this.projectsService.addProject(team_id!, name!, description!).subscribe({
      next: () => {
        this.projectForm.reset();
        this.isCreateOpen.set(false);
        this.toast.show('The project was created successfully.', 'success');
      },
      error: () => this.toast.show('Error creating project', 'error')
    });
  }
}