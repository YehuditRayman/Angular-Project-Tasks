import { Component, OnInit, computed, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

import { TasksService } from '../../services/tasks.service';
import { CommentsService } from '../../services/comments.service';
import { Task } from '../../models/types.model';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, NgClass, DragDropModule,
    MatButtonModule, MatCardModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatProgressSpinnerModule, MatSelectModule,
    MatDialogModule, MatTooltipModule
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList implements OnInit {
  tasksService = inject(TasksService);
  commentsService = inject(CommentsService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  toast = inject(ToastService);
  @ViewChild('taskDialog') taskDialog!: TemplateRef<any>;

  projectId = signal<string>('');
  editingTaskId = signal<string | null>(null);
  selectedTask = signal<Task | null>(null);
  searchQuery = signal('');

  taskForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    priority: new FormControl('normal'),
    due_date: new FormControl('')
  });

  commentControl = new FormControl('');

  todoTasks = computed(() => this.filterTasks('todo'));
  inProgressTasks = computed(() => this.filterTasks('in_progress'));
  doneTasks = computed(() => this.filterTasks('done'));

  private filterTasks(status: string) {
    const text = this.searchQuery().toLowerCase();
    return this.tasksService.myTasks().filter(t =>
      t.status === status &&
      (t.title.toLowerCase().includes(text) || t.description?.toLowerCase().includes(text))
    );
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('projectId');
    if (id) {
      this.projectId.set(id);
      this.tasksService.loadTasks(id);
    }
  }

  openCreate() {
    this.editingTaskId.set(null);
    this.selectedTask.set(null);
    this.taskForm.reset({ priority: 'normal' });
    this.commentsService.currentComments.set([]);
    this.openDialog();
  }

  openEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.selectedTask.set(task);

    const formattedDate = task.due_date
      ? new Date(task.due_date).toISOString().split('T')[0]
      : '';

    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority || 'normal',
      due_date: formattedDate
    });

    this.commentsService.loadComments(task.id);
    this.openDialog();
  }

  private openDialog() {
    this.dialog.open(this.taskDialog, {
      width: '900px', maxWidth: '94vw', height: 'auto', maxHeight: '90vh',
      direction: 'rtl', panelClass: 'dialog-no-padding', autoFocus: false
    });
  }

  closeModal() {
    this.dialog.closeAll();
    this.editingTaskId.set(null);
    this.selectedTask.set(null);
    this.taskForm.reset();
    this.commentControl.reset();
  }

  saveTask() {
    if (this.taskForm.invalid) return;

    const { title, description, priority, due_date } = this.taskForm.value;
    const currentProjectId = this.projectId();
    const taskId = this.editingTaskId();

    const processedDate = due_date ? new Date(due_date) : null;

    const taskData: any = {
      title,
      description,
      priority,
      due_date: processedDate
    };

    if (taskId) {
      this.tasksService.updateTask(taskId, taskData).subscribe({
        next: () => {
          this.closeModal();
          this.toast.show('The task was successfully updated.', 'success');
        },
        error: () => this.toast.show('Error updating task', 'error')
      });
    } else {
      const selectedPriority = priority as 'low' | 'normal' | 'high';
      this.tasksService.addTask(
        currentProjectId, title!, description!, processedDate, selectedPriority
      ).subscribe({
        next: () => {
          this.closeModal();
          this.toast.show('The task was created successfully.', 'success');
        },
        error: () => this.toast.show('Error creating task', 'error')
      });
    }
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.item.data as Task;
      const newStatus = event.container.id;
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.tasksService.updateTask(task.id, { status: newStatus }).subscribe({
        next: () => this.toast.show('Status updated', 'success'),
        error: () => {
          this.toast.show('Towing failed.', 'error');
          this.tasksService.loadTasks(this.projectId());
        }
      });
    }
  }

  onDeleteTask(task: Task) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px', direction: 'rtl',
      data: { message: `Should I delete the task?"${task.title}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tasksService.deleteTask(task.id).subscribe({
          next: () => {
            if (this.editingTaskId() === task.id) this.closeModal();
            this.toast.show('The task was successfully deleted.', 'success');
          },
          error: () => this.toast.show('Error deleting task', 'error')
        });
      }
    });
  }

  onPriorityChange(task: Task, newPriority: string) {
    this.tasksService.updateTask(task.id, { priority: newPriority }).subscribe({
      next: () => this.toast.show('Priority updated', 'success'),
      error: () => this.toast.show('Error updating priority', 'error')
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  sendComment() {
    if (!this.commentControl.value || !this.selectedTask()) return;
    const body = this.commentControl.value!;
    const taskId = this.selectedTask()!.id;
    this.commentsService.addComment(taskId, body).subscribe({
      next: () => {
        this.commentControl.reset();
        this.toast.show('Response sent', 'success');
      },
      error: () => this.toast.show('Error sending response', 'error')
    });
  }
}