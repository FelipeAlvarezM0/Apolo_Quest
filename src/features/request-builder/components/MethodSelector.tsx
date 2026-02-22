import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRequestStore } from '../store/useRequestStore';
import type { HttpMethod } from '../../../shared/models';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-method-get/15 text-method-get border-method-get/30 hover:bg-method-get/25',
  POST: 'bg-method-post/15 text-method-post border-method-post/30 hover:bg-method-post/25',
  PUT: 'bg-method-put/15 text-method-put border-method-put/30 hover:bg-method-put/25',
  PATCH: 'bg-method-patch/15 text-method-patch border-method-patch/30 hover:bg-method-patch/25',
  DELETE: 'bg-method-delete/15 text-method-delete border-method-delete/30 hover:bg-method-delete/25',
  HEAD: 'bg-method-head/15 text-method-head border-method-head/30 hover:bg-method-head/25',
  OPTIONS: 'bg-method-options/15 text-method-options border-method-options/30 hover:bg-method-options/25',
};

export function MethodSelector() {
  const { currentRequest, setMethod } = useRequestStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const currentStyle = METHOD_STYLES[currentRequest.method];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-2 px-3 py-1.5 rounded-md
          font-semibold text-sm transition-all duration-fast
          border min-w-[90px]
          ${currentStyle}
        `}
        aria-label="HTTP method selector"
        aria-expanded={isOpen}
      >
        <span>{currentRequest.method}</span>
        <ChevronDown size={14} className={`transition-transform duration-fast ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 min-w-[120px] rounded-md panel-elevated border border-border-default bg-bg-elevated overflow-hidden z-50 animate-fade-in">
          {HTTP_METHODS.map((method) => {
            const isActive = currentRequest.method === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => handleMethodSelect(method)}
                className={`
                  w-full px-4 py-2 text-left font-semibold text-sm
                  transition-all duration-fast
                  hover:bg-bg-hover
                  ${isActive ? 'bg-bg-hover' : ''}
                `}
                style={{
                  color: `var(--method-${method.toLowerCase()})`,
                }}
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
