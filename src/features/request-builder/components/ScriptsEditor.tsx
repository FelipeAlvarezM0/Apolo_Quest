import { useRequestStore } from '../store/useRequestStore';
import { CodeEditor } from '../../../shared/ui/CodeEditor';
import { Code } from 'lucide-react';

export function ScriptsEditor() {
  const { currentRequest, setPreRequestScript, setPostRequestScript } = useRequestStore();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded">
        <div className="flex items-start gap-2 mb-2">
          <Code size={18} className="text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-300">Script Execution Context</p>
            <p className="text-xs text-blue-400 mt-1">Scripts have access to the following context:</p>
          </div>
        </div>
        <ul className="text-xs text-blue-300 space-y-1 ml-6 list-disc">
          <li><code className="text-blue-200">request</code> - Current request object (url, method, headers, body, etc.)</li>
          <li><code className="text-blue-200">environment</code> - Active environment variables</li>
          <li><code className="text-blue-200">response</code> - Response object (post-request only)</li>
          <li><code className="text-blue-200">setEnv(key, value)</code> - Set environment variable</li>
          <li><code className="text-blue-200">getEnv(key)</code> - Get environment variable</li>
          <li><code className="text-blue-200">console.log(...)</code> - Log messages to browser console</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pre-Request Script</label>
          <p className="text-xs text-gray-400 mb-3">
            This script runs <strong>before</strong> sending the request. Use it to set variables, modify headers, or prepare data.
          </p>
          <CodeEditor
            value={currentRequest.preRequestScript || ''}
            onChange={(value) => setPreRequestScript(value)}
            language="javascript"
            placeholder={`// Example: Set a timestamp variable
const timestamp = Date.now();
setEnv('timestamp', timestamp);

// Example: Add a custom header
request.headers.push({
  key: 'X-Request-Time',
  value: new Date().toISOString()
});

// Example: Log request details
console.log('Sending request to:', request.url);`}
            minHeight="16rem"
            className="bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Post-Request Script (Tests)</label>
          <p className="text-xs text-gray-400 mb-3">
            This script runs <strong>after</strong> receiving the response. Use it to validate responses, extract data, or run tests.
          </p>
          <CodeEditor
            value={currentRequest.postRequestScript || ''}
            onChange={(value) => setPostRequestScript(value)}
            language="javascript"
            placeholder={`// Example: Test response status
if (response.status === 200) {
  console.log('✓ Request successful');
} else {
  console.error('✗ Request failed with status:', response.status);
}

// Example: Extract and save token
try {
  const data = JSON.parse(response.body);
  if (data.token) {
    setEnv('authToken', data.token);
    console.log('Token saved to environment');
  }
} catch (error) {
  console.error('Failed to parse response:', error);
}

// Example: Validate response time
if (response.timeMs < 1000) {
  console.log('✓ Response time OK:', response.timeMs + 'ms');
} else {
  console.warn('⚠ Slow response:', response.timeMs + 'ms');
}`}
            minHeight="16rem"
            className="bg-gray-800"
          />
        </div>
      </div>

      <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded">
        <p className="text-xs text-yellow-300">
          <strong>Note:</strong> Scripts are executed in a sandboxed environment. Errors will be caught and logged to the console.
        </p>
      </div>
    </div>
  );
}
