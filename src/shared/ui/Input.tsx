import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={label || error ? 'min-w-0' : ''}>
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            min-w-0 w-full px-3 py-2 text-sm
            bg-bg-input
            text-text-primary placeholder:text-text-placeholder
            focus:outline-none
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-status-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
