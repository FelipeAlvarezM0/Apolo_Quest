import { useEffect, useState } from 'react';
import type { FlowNode } from '../../models/flow';
import { Input } from '../../../../shared/ui/Input';
import { Select } from '../../../../shared/ui/Select';
import { Button } from '../../../../shared/ui/Button';
import { useCollectionsStore } from '../../../collections/store/useCollectionsStore';
import { useEnvironmentStore } from '../../../environments/store/useEnvironmentStore';

interface NodeInspectorProps {
  node: FlowNode | null;
  onUpdateNode: (node: FlowNode) => void;
}

export function NodeInspector({ node, onUpdateNode }: NodeInspectorProps) {
  const { collections } = useCollectionsStore();
  const { environments } = useEnvironmentStore();
  const [localNode, setLocalNode] = useState<FlowNode | null>(node);

  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  if (!localNode) {
    return (
      <div className="w-80 border-l border-border-subtle bg-bg-sidebar p-md">
        <p className="text-sm text-text-muted">Select a node to edit properties</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FlowNode>) => {
    const updated = { ...localNode, ...updates } as FlowNode;
    setLocalNode(updated);
    onUpdateNode(updated);
  };

  return (
    <div className="w-80 border-l border-border-subtle bg-bg-sidebar p-md overflow-y-auto">
      <div className="mb-md">
        <h3 className="text-sm font-semibold mb-1">Node Properties</h3>
        <p className="text-xs text-text-muted capitalize">{localNode.type} Node</p>
      </div>

      <div className="space-y-md">
        {localNode.type === 'request' && (
          <RequestNodeInspector
            node={localNode}
            collections={collections}
            environments={environments}
            onUpdate={handleUpdate}
          />
        )}

        {localNode.type === 'extract' && (
          <ExtractNodeInspector node={localNode} onUpdate={handleUpdate} />
        )}

        {localNode.type === 'condition' && (
          <ConditionNodeInspector node={localNode} onUpdate={handleUpdate} />
        )}

        {localNode.type === 'setVar' && (
          <SetVarNodeInspector node={localNode} onUpdate={handleUpdate} />
        )}

        {localNode.type === 'delay' && (
          <DelayNodeInspector node={localNode} onUpdate={handleUpdate} />
        )}

        {localNode.type === 'log' && (
          <LogNodeInspector node={localNode} onUpdate={handleUpdate} />
        )}

        {(localNode.type === 'start' || localNode.type === 'end') && (
          <p className="text-sm text-text-muted">No properties to configure</p>
        )}
      </div>
    </div>
  );
}

function RequestNodeInspector({ node, collections, environments, onUpdate }: any) {
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedRequest, setSelectedRequest] = useState('');

  useEffect(() => {
    if (node.data.requestRef.kind === 'collectionRequest') {
      setSelectedCollection(node.data.requestRef.collectionId);
      setSelectedRequest(node.data.requestRef.requestId);
    }
  }, [node]);

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setSelectedRequest('');
  };

  const handleRequestChange = (requestId: string) => {
    setSelectedRequest(requestId);
    onUpdate({
      data: {
        ...node.data,
        requestRef: {
          kind: 'collectionRequest',
          collectionId: selectedCollection,
          requestId,
        },
      },
    });
  };

  const selectedCollectionObj = collections.find((c: any) => c.id === selectedCollection);
  const requests = selectedCollectionObj?.requests || [];

  return (
    <>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Collection
        </label>
        <Select
          value={selectedCollection}
          onChange={(e) => handleCollectionChange(e.target.value)}
          className="w-full text-sm"
        >
          <option value="">Select collection</option>
          {collections.map((col: any) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedCollection && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
            Request
          </label>
          <Select
            value={selectedRequest}
            onChange={(e) => handleRequestChange(e.target.value)}
            className="w-full text-sm"
          >
            <option value="">Select request</option>
            {requests.map((req: any) => (
              <option key={req.id} value={req.id}>
                {req.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Save Response As
        </label>
        <Input
          value={node.data.saveResponseAs || ''}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, saveResponseAs: e.target.value },
            })
          }
          placeholder="Variable name (optional)"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Override Environment
        </label>
        <Select
          value={node.data.overrideEnvId || ''}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, overrideEnvId: e.target.value },
            })
          }
          className="w-full text-sm"
        >
          <option value="">None</option>
          {environments.map((env: any) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </Select>
      </div>
    </>
  );
}

function ExtractNodeInspector({ node, onUpdate }: any) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          From
        </label>
        <Select
          value={node.data.from}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, from: e.target.value },
            })
          }
          className="w-full text-sm"
        >
          <option value="lastResponseBody">Last Response Body</option>
          <option value="flowVar">Flow Variable</option>
        </Select>
      </div>

      {node.data.from === 'flowVar' && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
            Flow Variable Name
          </label>
          <Input
            value={node.data.flowVarName || ''}
            onChange={(e) =>
              onUpdate({
                data: { ...node.data, flowVarName: e.target.value },
              })
            }
            placeholder="varName"
            className="text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          JSON Path
        </label>
        <Input
          value={node.data.jsonPath}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, jsonPath: e.target.value },
            })
          }
          placeholder="e.g., data.user.id"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          To Flow Variable
        </label>
        <Input
          value={node.data.toFlowVar}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, toFlowVar: e.target.value },
            })
          }
          placeholder="destinationVar"
          className="text-sm"
        />
      </div>
    </>
  );
}

function ConditionNodeInspector({ node, onUpdate }: any) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Left Side
        </label>
        <Select
          value={node.data.left.kind}
          onChange={(e) =>
            onUpdate({
              data: {
                ...node.data,
                left: { ...node.data.left, kind: e.target.value },
              },
            })
          }
          className="w-full text-sm mb-2"
        >
          <option value="flowVar">Flow Variable</option>
          <option value="lastStatus">Last Status Code</option>
          <option value="lastResponseBodyPath">Last Response Body Path</option>
        </Select>
        <Input
          value={node.data.left.value}
          onChange={(e) =>
            onUpdate({
              data: {
                ...node.data,
                left: { ...node.data.left, value: e.target.value },
              },
            })
          }
          placeholder="Value or path"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Operator
        </label>
        <Select
          value={node.data.op}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, op: e.target.value },
            })
          }
          className="w-full text-sm"
        >
          <option value="equals">Equals</option>
          <option value="notEquals">Not Equals</option>
          <option value="contains">Contains</option>
          <option value="gt">Greater Than</option>
          <option value="lt">Less Than</option>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Right Side
        </label>
        <Select
          value={node.data.right.kind}
          onChange={(e) =>
            onUpdate({
              data: {
                ...node.data,
                right: { ...node.data.right, kind: e.target.value },
              },
            })
          }
          className="w-full text-sm mb-2"
        >
          <option value="literal">Literal Value</option>
          <option value="flowVar">Flow Variable</option>
        </Select>
        <Input
          value={node.data.right.value}
          onChange={(e) =>
            onUpdate({
              data: {
                ...node.data,
                right: { ...node.data.right, value: e.target.value },
              },
            })
          }
          placeholder="Value"
          className="text-sm"
        />
      </div>
    </>
  );
}

function SetVarNodeInspector({ node, onUpdate }: any) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Variable Name
        </label>
        <Input
          value={node.data.key}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, key: e.target.value },
            })
          }
          placeholder="varName"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
          Value Template
        </label>
        <Input
          value={node.data.valueTemplate}
          onChange={(e) =>
            onUpdate({
              data: { ...node.data, valueTemplate: e.target.value },
            })
          }
          placeholder="Value or {{variable}}"
          className="text-sm"
        />
      </div>
    </>
  );
}

function DelayNodeInspector({ node, onUpdate }: any) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
        Delay (ms)
      </label>
      <Input
        type="number"
        value={node.data.ms}
        onChange={(e) =>
          onUpdate({
            data: { ...node.data, ms: Number(e.target.value) },
          })
        }
        placeholder="1000"
        className="text-sm"
      />
    </div>
  );
}

function LogNodeInspector({ node, onUpdate }: any) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-text-muted">
        Message Template
      </label>
      <Input
        value={node.data.messageTemplate}
        onChange={(e) =>
          onUpdate({
            data: { ...node.data, messageTemplate: e.target.value },
          })
        }
        placeholder="Message with {{variables}}"
        className="text-sm"
      />
    </div>
  );
}
