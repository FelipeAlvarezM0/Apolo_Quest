import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-md border
    font-semibold tracking-wide transition-all duration-fast active-press
    focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/60
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantClasses = {
    primary: `
      border-accent/40 bg-gradient-to-br from-accent to-accent-active
      text-white shadow-lg shadow-accent/20 hover:brightness-110 hover:shadow-accent/30
    `,
    secondary: `
      border-border-default bg-bg-elevated text-text-primary
      hover:border-border-focus/50 hover:bg-bg-hover
    `,
    danger: `
      border-status-error/40 bg-status-error text-white
      shadow-lg shadow-status-error/20 hover:brightness-110
    `,
    ghost: `
      border-transparent bg-transparent text-text-secondary
      hover:text-text-primary hover:bg-bg-hover
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
