export interface User {
  id?: number; 
  name: string; 
  email: string;
  password?: string; 
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  members_count?: number;
  ownerId?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  team_id: string | number; 
  status?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: 'todo' | 'in_progress' | 'done'; 
  priority?: 'low' | 'normal' | 'high'; 
  due_date?: Date|null;
  assigneeId?: number;
  orderIndex?: number;
  project_name?: string;
  team_id?: string | number;
  team_name?: string;
}
export interface Comment {
  id: number;
  task_id: string; 
  user_id: number;
  body: string;       
  created_at: string; 
  author_name: string; 
}

export interface Member{
  userId:number,
  role:'member'
}