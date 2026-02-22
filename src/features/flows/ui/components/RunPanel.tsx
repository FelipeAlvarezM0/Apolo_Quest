import { Play, Square, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../../../../shared/ui/Button';
import { useFlowRunStore } from '../../store/useFlowRunStore';

interface RunPanelProps {
  onRun: () => void;
  onStop: () => void;
}

export function RunPanel({ onRun, onStop }: RunPanelProps) {
  const { runStatus, timeline, context } = useFlowRunStore();

  const isRunning = runStatus === 'running';

  return (
    <div className="h-56 border-t border-border-subtle bg-bg-panel flex flex-col">
      <div className="px-md py-sm border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-md">
          <h3 className="text-sm font-semibold">Execution</h3>
          {runStatus !== 'idle' && (
            <span className={`
              text-xs font-medium px-2 py-0.5 rounded
              ${runStatus === 'running' ? 'bg-accent/15 text-accent' : ''}
              ${runStatus === 'success' ? 'bg-status-success/15 text-status-success' : ''}
              ${runStatus === 'error' ? 'bg-status-error/15 text-status-error' : ''}
              ${runStatus === 'stopped' ? 'bg-text-muted/15 text-text-muted' : ''}
            `}>
              {runStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-sm">
          {isRunning ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onStop}
              className="flex items-center gap-1.5"
            >
              <Square size={14} />
              Stop
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onRun}
              className="flex items-center gap-1.5"
            >
              <Play size={14} />
              Run Flow
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-sm">
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-muted">
              {isRunning ? 'Starting execution...' : 'Press Run to execute flow'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {timeline.map((event) => {
              const Icon =
                event.type === 'start'
                  ? Clock
                  : event.type === 'success'
                  ? CheckCircle2
                  : XCircle;

              const color =
                event.type === 'start'
                  ? 'text-text-secondary'
                  : event.type === 'success'
                  ? 'text-status-success'
                  : 'text-status-error';

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2 text-xs py-1 px-2 rounded hover:bg-bg-hover transition-all duration-fast"
                >
                  <Icon size={14} className={`flex-shrink-0 mt-0.5 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary">{event.message}</div>
                    {event.data !== undefined && event.data !== null && (
                      <div className="text-text-muted mt-0.5 font-mono text-xs">
                        {typeof event.data === 'object'
                          ? JSON.stringify(event.data, null, 2)
                          : String(event.data)}
                      </div>
                    )}
                  </div>
                  <span className="text-text-muted text-xs whitespace-nowrap">
                    {new Date(event.ts).toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {context.logs.length > 0 && (
        <div className="border-t border-border-subtle p-sm max-h-24 overflow-y-auto">
          <div className="text-xs space-y-0.5">
            {context.logs.map((log, idx) => (
              <div
                key={idx}
                className={`
                  ${log.level === 'error' ? 'text-status-error' : ''}
                  ${log.level === 'warn' ? 'text-status-warning' : ''}
                  ${log.level === 'info' ? 'text-text-secondary' : ''}
                `}
              >
                [{new Date(log.ts).toLocaleTimeString()}] {log.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
