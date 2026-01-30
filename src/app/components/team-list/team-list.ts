import { Component, OnInit, inject, ViewChild, TemplateRef, signal } from '@angular/core';
import { TeamsService } from '../../services/teams.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatSelectModule } from '@angular/material/select'; 

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe, JsonPipe, RouterLink, MatButtonModule,
    MatCardModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatDialogModule, MatToolbarModule,
    MatTooltipModule, MatSelectModule 
  ],
  templateUrl: './team-list.html',
  styleUrl: './team-list.css'
})
export class TeamList implements OnInit {
  public teamsService = inject(TeamsService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);

  @ViewChild('createTeamDialog') createTeamDialog!: TemplateRef<any>;
  @ViewChild('addMemberDialog') addMemberDialog!: TemplateRef<any>;

  newTeamNameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  memberIdControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]);
  teamSelectControl = new FormControl('', [Validators.required]); 

  ngOnInit() {
    this.teamsService.loadTeams();
  }

  openCreateDialog() {
    this.newTeamNameControl.reset();
    this.dialog.open(this.createTeamDialog, { width: '400px', direction: 'ltr' });
  }

  createNewTeam() {
    if (this.newTeamNameControl.invalid) return;
    const name = this.newTeamNameControl.value!;

    this.teamsService.addTeam(name).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.toast.show('The team was created successfully.', 'success');
      },
      error: () => this.toast.show('Error creating team', 'error')
    });
  }

  openAddMemberDialogGlobal() {
    this.memberIdControl.reset();
    this.teamSelectControl.reset(); 
    this.dialog.open(this.addMemberDialog, { width: '400px', direction: 'ltr' });
  }

  addMemberToTeam() {
    const teamId = this.teamSelectControl.value;
    const userIdVal = this.memberIdControl.value;
    if (!teamId || !userIdVal) return;
    const userId = +userIdVal; 
    this.teamsService.addMember(userId, teamId).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.toast.show('The member was successfully added to the team.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.toast.show('Error adding team member', 'error');
      }
    });
  }
}