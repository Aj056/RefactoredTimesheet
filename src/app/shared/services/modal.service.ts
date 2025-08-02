import { Injectable, signal } from '@angular/core';

export interface ConfirmationModal {
  readonly id: number;
  readonly title: string;
  readonly message: string;
  readonly confirmText: string;
  readonly cancelText: string;
  readonly confirmVariant: 'primary' | 'danger';
  readonly onConfirm: () => void | Promise<void>;
  readonly onCancel?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _activeModal = signal<ConfirmationModal | null>(null);
  readonly activeModal = this._activeModal.asReadonly();

  /**
   * Show confirmation modal
   */
  confirm(
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options: {
      confirmText?: string;
      cancelText?: string;
      confirmVariant?: 'primary' | 'danger';
      onCancel?: () => void;
    } = {}
  ): void {
    const modal: ConfirmationModal = {
      id: Date.now(),
      title,
      message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      confirmVariant: options.confirmVariant || 'primary',
      onConfirm,
      onCancel: options.onCancel
    };

    this._activeModal.set(modal);
  }

  /**
   * Show logout confirmation
   */
  confirmLogout(onConfirm: () => void | Promise<void>): void {
    this.confirm(
      'Confirm Logout',
      'Are you sure you want to logout? You will need to sign in again.',
      onConfirm,
      {
        confirmText: 'Logout',
        cancelText: 'Stay',
        confirmVariant: 'danger'
      }
    );
  }

  /**
   * Show delete confirmation
   */
  confirmDelete(
    itemName: string,
    onConfirm: () => void | Promise<void>
  ): void {
    this.confirm(
      'Confirm Delete',
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      onConfirm,
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmVariant: 'danger'
      }
    );
  }

  /**
   * Close the active modal
   */
  close(): void {
    this._activeModal.set(null);
  }

  /**
   * Handle confirm action
   */
  async handleConfirm(): Promise<void> {
    const modal = this._activeModal();
    if (modal) {
      try {
        await modal.onConfirm();
      } catch (error) {
        console.error('Modal confirm action failed:', error);
      } finally {
        this.close();
      }
    }
  }

  /**
   * Handle cancel action
   */
  handleCancel(): void {
    const modal = this._activeModal();
    if (modal) {
      modal.onCancel?.();
      this.close();
    }
  }
}
