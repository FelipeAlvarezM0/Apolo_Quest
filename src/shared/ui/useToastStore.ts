import { create } from 'zustand';
import { generateId } from '../utils/id';
import type { Toast, ToastType } from './Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, message, duration) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, duration = 3000) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'success', message, duration }],
    }));
  },

  error: (message, duration = 4000) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'error', message, duration }],
    }));
  },

  warning: (message, duration = 4000) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'warning', message, duration }],
    }));
  },

  info: (message, duration = 3000) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'info', message, duration }],
    }));
  },
}));
