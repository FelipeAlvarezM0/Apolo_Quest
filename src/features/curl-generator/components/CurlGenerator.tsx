import { useState } from 'react';
import { useRequestStore } from '../../request-builder/store/useRequestStore';
import { useEnvironmentStore } from '../../environments/store/useEnvironmentStore';
import { generateCurl } from '../services/curlGenerator';
import { Button } from '../../../shared/ui/Button';
import { Copy, Check, Terminal } from 'lucide-react';

export function CurlGenerator() {
  const { currentRequest } = useRequestStore();
  const { getActiveEnvironment } = useEnvironmentStore();
  const [copied, setCopied] = useState(false);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeBody, setIncludeBody] = useState(true);
  const [multiline, setMultiline] = useState(true);

  const activeEnv = getActiveEnvironment();
  const curlCommand = generateCurl(currentRequest, activeEnv, {
    includeHeaders,
    includeBody,
    multiline,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
          <Terminal size={24} />
          cURL Generator
        </h2>
        <Button
          onClick={handleCopy}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-blue-300 text-sm">
        This command represents your current request. Copy and paste it into a terminal to execute it.
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHeaders}
            onChange={(e) => setIncludeHeaders(e.target.checked)}
            className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
          />
          Include Headers
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={includeBody}
            onChange={(e) => setIncludeBody(e.target.checked)}
            className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
          />
          Include Body
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={multiline}
            onChange={(e) => setMultiline(e.target.checked)}
            className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
          />
          Multiline Format
        </label>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded p-4">
        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-all">
          {curlCommand}
        </pre>
      </div>
    </div>
  );
}
