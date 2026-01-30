import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { TeamList } from './components/team-list/team-list';
import { ProjectList } from './components/project-list/project-list';
import { authGuard } from './guards/auth.guard';
import { TaskList } from './components/task-list/task-list';
import { AllProjects } from './components/all-projects/all-projects';
import { AllTasks } from './components/all-tasks/all-tasks';
import { LandingPage} from './components/landing-page/landing-page'

export const routes: Routes = [
  { path: '', redirectTo: 'landingPage', pathMatch: 'full' },
  { path: 'landingPage', component: LandingPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'teams', component: TeamList },
      { path: 'projects/:team_id', component: ProjectList },
      { path: 'projects/:projectId/tasks', component: TaskList },
      { path: 'all-projects', component: AllProjects },
      { path: 'all-tasks', component: AllTasks },
      { path: 'projects/:projectId/tasks/:taskId', component: TaskList }
    ]
  },

  { path: '**', redirectTo: 'login' }
];