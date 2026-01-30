import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal<string>('');
  type = signal<ToastType>('info');
  isVisible = signal<boolean>(false);

  private timeoutRef: any;

  show(msg: string, type: ToastType = 'info') {
    this.message.set(msg);
    this.type.set(type);
    this.isVisible.set(true);

    if (this.timeoutRef) clearTimeout(this.timeoutRef);

    this.timeoutRef = setTimeout(() => {
      this.close();
    }, 3000);
  }

  close() {
    this.isVisible.set(false);
  }
}