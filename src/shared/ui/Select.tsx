import { type SelectHTMLAttributes, forwardRef } from 'react';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => {
    const { settings } = useSettingsStore();
    const isLight = settings.theme === 'light';

    return (
      <div className={label ? 'w-full' : ''}>
        {label && (
          <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={`w-full min-w-[160px] px-4 py-3 pr-11 rounded-xl text-base font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 [&>option]:py-2 [&>option]:px-4 ${
              isLight
                ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-300 text-gray-900 hover:border-gray-400 hover:shadow-md focus:bg-white shadow-sm [&>option]:bg-white [&>option]:text-gray-900'
                : 'bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700 text-gray-100 hover:border-gray-600 hover:shadow-lg hover:shadow-blue-500/5 focus:bg-gray-800 shadow-md [&>option]:bg-gray-800 [&>option]:text-gray-100 [&>option:checked]:bg-gray-700 [&>option:hover]:bg-gray-700'
            } ${className}`}
            style={{
              backgroundImage: 'none',
              colorScheme: isLight ? 'light' : 'dark',
            }}
            {...props}
          >
            {children}
          </select>
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:translate-y-[-45%] ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <ChevronDown size={20} strokeWidth={2.5} />
          </div>
          <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${
            isLight
              ? 'bg-gradient-to-r from-blue-50/50 to-transparent'
              : 'bg-gradient-to-r from-blue-900/10 to-transparent'
          }`} />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
