import { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { useToastStore } from '../../../shared/ui/useToastStore';
import { Copy, Check } from 'lucide-react';

export function UrlInput() {
  const { currentRequest, setUrl } = useRequestStore();
  const { success } = useToastStore();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (!currentRequest.url) return;
    navigator.clipboard.writeText(currentRequest.url);
    setCopied(true);
    success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0 group">
      <div className="flex-1 min-w-0 relative">
        <input
          type="text"
          value={currentRequest.url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="
            w-full px-4 py-2 rounded-md
            bg-bg-input border border-border-subtle
            text-text-primary placeholder:text-text-placeholder
            text-sm font-semibold
            focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
            hover:border-border-default
            transition-all duration-fast
          "
        />
      </div>

      <button
        onClick={handleCopyUrl}
        className="
          p-2 transition-all duration-fast rounded-md shrink-0
          text-text-secondary hover:text-text-primary hover:bg-bg-hover
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        title="Copy URL"
        disabled={!currentRequest.url}
        aria-label="Copy URL to clipboard"
      >
        {copied ? <Check size={16} className="text-status-success" /> : <Copy size={16} />}
      </button>
    </div>
  );
}
