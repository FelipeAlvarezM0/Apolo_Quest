import { type InputHTMLAttributes, forwardRef } from 'react';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const { settings } = useSettingsStore();
    const isLight = settings.theme === 'light';

    return (
      <div className={label || error ? 'min-w-0' : ''}>
        {label && (
          <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`min-w-0 w-full px-4 py-2.5 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            isLight
              ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400 shadow-sm'
              : 'bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 hover:border-gray-500 shadow-lg'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
