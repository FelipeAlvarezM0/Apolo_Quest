import { type SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => {
    return (
      <div className={label ? 'w-full' : ''}>
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={`
              w-full min-w-[120px] rounded-md border border-border-subtle px-3 py-2 pr-9 text-sm font-medium
              appearance-none cursor-pointer
              bg-bg-input
              text-text-primary
              hover:border-border-default focus:border-border-focus
              focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus/40
              transition-all duration-fast
              [&>option]:py-2 [&>option]:px-3
              [&>option]:bg-bg-elevated [&>option]:text-text-primary
              [&>option:checked]:bg-accent/20
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-text-muted transition-colors duration-fast group-hover:text-text-secondary">
            <ChevronDown size={14} />
          </span>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
