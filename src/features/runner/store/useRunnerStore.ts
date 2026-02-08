import { create } from 'zustand';
import type { Collection, RunnerResult, Environment, HttpRequest } from '../../../shared/models';
import { executeRequest } from '../../../shared/http/requestExecutor';

interface RunnerState {
  isRunning: boolean;
  results: RunnerResult[];
  currentIndex: number;
  runCollection: (collection: Collection, environment: Environment | null, timeoutMs?: number) => Promise<void>;
  runSelectedRequests: (requests: HttpRequest[], environment: Environment | null, timeoutMs?: number) => Promise<void>;
  runSingleRequest: (request: HttpRequest, environment: Environment | null, timeoutMs?: number) => Promise<RunnerResult>;
  stopRun: () => void;
  clearResults: () => void;
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  isRunning: false,
  results: [],
  currentIndex: -1,

  runCollection: async (collection, environment, timeoutMs) => {
    set({ isRunning: true, results: [], currentIndex: 0 });

    const results: RunnerResult[] = [];

    for (let i = 0; i < collection.requests.length; i++) {
      if (!get().isRunning) break;

      const request = collection.requests[i];
      set({ currentIndex: i });

      try {
        const startTime = performance.now();
        const response = await executeRequest(request, environment, timeoutMs);
        const endTime = performance.now();

        results.push({
          requestId: request.id,
          requestName: request.name,
          status: response.error ? 'error' : 'success',
          response,
          timeMs: Math.round(endTime - startTime),
        });
      } catch (error) {
        results.push({
          requestId: request.id,
          requestName: request.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timeMs: 0,
        });
      }

      set({ results: [...results] });
    }

    set({ isRunning: false, currentIndex: -1 });
  },

  runSelectedRequests: async (requests, environment, timeoutMs) => {
    set({ isRunning: true, results: [], currentIndex: 0 });

    const results: RunnerResult[] = [];

    for (let i = 0; i < requests.length; i++) {
      if (!get().isRunning) break;

      const request = requests[i];
      set({ currentIndex: i });

      try {
        const startTime = performance.now();
        const response = await executeRequest(request, environment, timeoutMs);
        const endTime = performance.now();

        results.push({
          requestId: request.id,
          requestName: request.name,
          status: response.error ? 'error' : 'success',
          response,
          timeMs: Math.round(endTime - startTime),
        });
      } catch (error) {
        results.push({
          requestId: request.id,
          requestName: request.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timeMs: 0,
        });
      }

      set({ results: [...results] });
    }

    set({ isRunning: false, currentIndex: -1 });
  },

  runSingleRequest: async (request, environment, timeoutMs) => {
    try {
      const startTime = performance.now();
      const response = await executeRequest(request, environment, timeoutMs);
      const endTime = performance.now();

      return {
        requestId: request.id,
        requestName: request.name,
        status: response.error ? 'error' : 'success',
        response,
        timeMs: Math.round(endTime - startTime),
      };
    } catch (error) {
      return {
        requestId: request.id,
        requestName: request.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timeMs: 0,
      };
    }
  },

  stopRun: () => set({ isRunning: false }),

  clearResults: () => set({ results: [], currentIndex: -1 }),
}));
