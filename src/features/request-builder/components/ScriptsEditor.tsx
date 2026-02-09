import { useRequestStore } from '../store/useRequestStore';
import { CodeEditor } from '../../../shared/ui/CodeEditor';

export function ScriptsEditor() {
  const { currentRequest, setPreRequestScript, setPostRequestScript } = useRequestStore();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pre-Request Script</label>
          <CodeEditor
            value={currentRequest.preRequestScript || ''}
            onChange={(value) => setPreRequestScript(value)}
            language="javascript"
            placeholder=""
            minHeight="16rem"
            className="bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Post-Request Script</label>
          <CodeEditor
            value={currentRequest.postRequestScript || ''}
            onChange={(value) => setPostRequestScript(value)}
            language="javascript"
            placeholder=""
            minHeight="16rem"
            className="bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}
