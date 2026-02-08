import { type SelectHTMLAttributes, forwardRef } from 'react';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
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
              w-full min-w-[120px] px-3 py-2 pr-9 rounded-md text-sm font-medium
              appearance-none cursor-pointer
              bg-bg-input border border-border-subtle
              text-text-primary
              focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
              hover:border-border-default
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
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
