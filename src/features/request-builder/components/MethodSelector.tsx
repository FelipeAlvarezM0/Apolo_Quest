import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRequestStore } from '../store/useRequestStore';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import type { HttpMethod } from '../../../shared/models';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, { text: string; border: string }> = {
  GET: { text: 'text-green-500', border: 'border-green-500' },
  POST: { text: 'text-orange-500', border: 'border-orange-500' },
  PUT: { text: 'text-blue-500', border: 'border-blue-500' },
  PATCH: { text: 'text-cyan-500', border: 'border-cyan-500' },
  DELETE: { text: 'text-red-500', border: 'border-red-500' },
  HEAD: { text: 'text-purple-500', border: 'border-purple-500' },
  OPTIONS: { text: 'text-gray-500', border: 'border-gray-500' },
};

export function MethodSelector() {
  const { currentRequest, setMethod } = useRequestStore();
  const { settings } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLight = settings.theme === 'light';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMethodSelect = (method: HttpMethod) => {
    setMethod(method);
    setIsOpen(false);
  };

  const currentColors = METHOD_COLORS[currentRequest.method];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md font-semibold text-sm transition-all border-2 min-w-[90px] ${
          currentColors.text
        } ${currentColors.border} ${
          isLight ? 'bg-white hover:bg-gray-50' : 'bg-gray-900 hover:bg-gray-800'
        }`}
        aria-label="HTTP method selector"
        aria-expanded={isOpen}
      >
        <span>{currentRequest.method}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1 min-w-[120px] rounded-md shadow-xl border overflow-hidden z-50 ${
            isLight ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-700'
          }`}
        >
          {HTTP_METHODS.map((method) => {
            const colors = METHOD_COLORS[method];
            return (
              <button
                key={method}
                type="button"
                onClick={() => handleMethodSelect(method)}
                className={`w-full px-4 py-2 text-left font-semibold text-sm transition-all ${
                  colors.text
                } ${
                  isLight
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-gray-700'
                } ${
                  currentRequest.method === method
                    ? isLight ? 'bg-gray-100' : 'bg-gray-700'
                    : ''
                }`}
              >
                {method}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
