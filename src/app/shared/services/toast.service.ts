import { Injectable, signal } from '@angular/core';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly type: 'success' | 'error' | 'info' | 'warning';
  readonly duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  
  show(
    message: string, 
    type: Toast['type'] = 'info', 
    duration = 3000
  ): void {
    const toast: Toast = {
      id: Date.now(),
      message,
      type,
      duration
    };
    
    this._toasts.update(toasts => [...toasts, toast]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }
  
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }
  
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }
  
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
  
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
  
  remove(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
  
  clear(): void {
    this._toasts.set([]);
  }
}
