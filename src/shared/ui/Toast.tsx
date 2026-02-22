import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: {
      bg: 'bg-status-success/15',
      border: 'border-status-success/30',
      icon: 'text-status-success',
      text: 'text-text-primary',
    },
    error: {
      bg: 'bg-status-error/15',
      border: 'border-status-error/30',
      icon: 'text-status-error',
      text: 'text-text-primary',
    },
    warning: {
      bg: 'bg-status-warning/15',
      border: 'border-status-warning/30',
      icon: 'text-status-warning',
      text: 'text-text-primary',
    },
    info: {
      bg: 'bg-status-info/15',
      border: 'border-status-info/30',
      icon: 'text-status-info',
      text: 'text-text-primary',
    },
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        backdrop-blur-md border rounded-lg panel-elevated
        p-4 flex items-start gap-3 min-w-[320px] max-w-md
        animate-slide-in
      `}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${style.icon}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors duration-fast"
      >
        <X size={18} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
