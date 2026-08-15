/**
 * IIUC Institutional SaaS — Toast Notification Store & Dispatcher
 * Controls Framer Motion glassmorphism toast queue.
 */

class ToastStore {
  constructor() {
    this.listeners = new Set();
    this.toasts = [];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  addToast(type, titleOrMsg, description = null, options = {}) {
    const id = options.id || 'toast-' + Math.random().toString(36).substr(2, 9);
    
    // Parse title & description
    let title = titleOrMsg;
    let desc = description;

    if (typeof titleOrMsg === 'object' && titleOrMsg !== null) {
      title = titleOrMsg.title || titleOrMsg.message || 'Notification';
      desc = titleOrMsg.description || null;
    }

    if (typeof description === 'object' && description !== null && !options.duration) {
      options = description;
      desc = null;
    }

    const duration = options.duration ?? (type === 'loading' ? 0 : 4000);

    const toastItem = {
      id,
      type, // 'success' | 'error' | 'warning' | 'info' | 'loading'
      title,
      description: desc,
      duration,
      createdAt: Date.now(),
    };

    // Replace if existing ID (e.g. loading -> success)
    const existingIndex = this.toasts.findIndex((t) => t.id === id);
    if (existingIndex > -1) {
      this.toasts[existingIndex] = toastItem;
    } else {
      this.toasts = [toastItem, ...this.toasts.slice(0, 4)]; // Max 5 toasts visible
    }

    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id) {
    if (!id) {
      this.toasts = [];
    } else {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }
    this.notify();
  }
}

export const toastStore = new ToastStore();

export const toast = {
  success: (title, desc, opts) => toastStore.addToast('success', title, desc, opts),
  error: (title, desc, opts) => toastStore.addToast('error', title, desc, opts),
  warning: (title, desc, opts) => toastStore.addToast('warning', title, desc, opts),
  warn: (title, desc, opts) => toastStore.addToast('warning', title, desc, opts),
  info: (title, desc, opts) => toastStore.addToast('info', title, desc, opts),
  loading: (title, desc, opts) => toastStore.addToast('loading', title, desc, opts),
  dismiss: (id) => toastStore.dismiss(id),
};

export default toast;
