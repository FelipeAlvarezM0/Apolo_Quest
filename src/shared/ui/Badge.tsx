interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-green-900/50 text-green-300 border-green-700',
    warning: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    error: 'bg-red-900/50 text-red-300 border-red-700',
    info: 'bg-blue-900/50 text-blue-300 border-blue-700',
    default: 'bg-gray-800 text-gray-300 border-gray-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: number }) {
  const getVariant = (status: number): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    if (status === 0) return 'error';
    if (status < 200) return 'info';
    if (status < 300) return 'success';
    if (status < 400) return 'info';
    if (status < 500) return 'warning';
    return 'error';
  };

  return <Badge variant={getVariant(status)}>{status}</Badge>;
}
