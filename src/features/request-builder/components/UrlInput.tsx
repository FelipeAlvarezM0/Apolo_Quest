import { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Copy, Check } from 'lucide-react';

export function UrlInput() {
  const { currentRequest, setUrl } = useRequestStore();
  const { settings } = useSettingsStore();
  const { success } = useToastStore();
  const [copied, setCopied] = useState(false);
  const isLight = settings.theme === 'light';

  const handleCopyUrl = () => {
    if (!currentRequest.url) return;
    navigator.clipboard.writeText(currentRequest.url);
    setCopied(true);
    success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <input
        type="text"
        value={currentRequest.url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        className={`flex-1 min-w-0 h-10 rounded-lg border px-3 text-sm outline-none transition-all ${
          isLight
            ? 'bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus:border-blue-500'
            : 'bg-gray-900/40 text-gray-100 border-gray-700 placeholder:text-gray-500 focus:border-blue-400'
        }`}
      />

      <button
        onClick={handleCopyUrl}
        className={`p-2.5 transition-all rounded-lg shrink-0 border ${
          isLight
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-300 hover:border-gray-400'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 border-gray-600 hover:border-gray-500'
        } ${!currentRequest.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="Copy URL"
        disabled={!currentRequest.url}
        aria-label="Copy URL to clipboard"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </div>
  );
}
