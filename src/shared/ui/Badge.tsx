interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'method';
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
  className?: string;
}

export function Badge({ children, variant = 'neutral', method, className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    error: 'bg-status-error/10 text-status-error border-status-error/20',
    info: 'bg-status-info/10 text-status-info border-status-info/20',
    neutral: 'bg-bg-elevated text-text-secondary border-border-subtle',
    method: '',
  };

  const methodVariants = {
    GET: 'bg-method-get/10 text-method-get border-method-get/30',
    POST: 'bg-method-post/10 text-method-post border-method-post/30',
    PUT: 'bg-method-put/10 text-method-put border-method-put/30',
    PATCH: 'bg-method-patch/10 text-method-patch border-method-patch/30',
    DELETE: 'bg-method-delete/10 text-method-delete border-method-delete/30',
    OPTIONS: 'bg-method-options/10 text-method-options border-method-options/30',
    HEAD: 'bg-method-head/10 text-method-head border-method-head/30',
  };

  const variantClass = variant === 'method' && method
    ? methodVariants[method]
    : variants[variant];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: number }) {
  const getVariant = (status: number): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    if (status === 0) return 'error';
    if (status < 200) return 'info';
    if (status < 300) return 'success';
    if (status < 400) return 'info';
    if (status < 500) return 'warning';
    return 'error';
  };

  return <Badge variant={getVariant(status)}>{status}</Badge>;
}
