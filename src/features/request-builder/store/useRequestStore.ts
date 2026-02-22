import { create } from 'zustand';
import type { HttpRequest, HttpResponse, HeaderKV, QueryParamKV, AuthConfig, RequestBody, Environment } from '../../../shared/models';
import { generateId } from '../../../shared/utils/id';
import { executeRequest, cancelRequest } from '../../../shared/http/requestExecutor';
import { historyRepository } from '../../../shared/storage/repositories/history.repository';

interface RequestState {
  currentRequest: HttpRequest;
  currentResponse: HttpResponse | null;
  isLoading: boolean;
  activeEnvironmentId: string | null;
  setMethod: (method: HttpRequest['method']) => void;
  setUrl: (url: string) => void;
  setName: (name: string) => void;
  addQueryParam: () => void;
  updateQueryParam: (id: string, updates: Partial<QueryParamKV>) => void;
  removeQueryParam: (id: string) => void;
  addHeader: () => void;
  updateHeader: (id: string, updates: Partial<HeaderKV>) => void;
  removeHeader: (id: string) => void;
  setAuth: (auth: AuthConfig) => void;
  setBody: (body: RequestBody) => void;
  setPreRequestScript: (script: string) => void;
  setPostRequestScript: (script: string) => void;
  sendRequest: (environment: Environment | null, timeoutMs?: number) => Promise<void>;
  stopRequest: () => void;
  loadRequest: (request: HttpRequest, environmentId?: string | null) => void;
  duplicateRequest: () => void;
  resetRequest: () => void;
  setActiveEnvironmentId: (id: string | null) => void;
}

const createEmptyRequest = (): HttpRequest => ({
  id: generateId(),
  name: 'New Request',
  method: 'GET',
  url: '',
  queryParams: [],
  headers: [],
  auth: { type: 'none', apiKeys: [] },
  body: { type: 'none', content: '', rawType: 'json', formData: [] },
  preRequestScript: '',
  postRequestScript: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useRequestStore = create<RequestState>((set, get) => ({
  currentRequest: createEmptyRequest(),
  currentResponse: null,
  isLoading: false,
  activeEnvironmentId: null,

  setMethod: (method) => set((state) => ({
    currentRequest: { ...state.currentRequest, method, updatedAt: Date.now() }
  })),

  setUrl: (url) => set((state) => ({
    currentRequest: { ...state.currentRequest, url, updatedAt: Date.now() }
  })),

  setName: (name) => set((state) => ({
    currentRequest: { ...state.currentRequest, name, updatedAt: Date.now() }
  })),

  addQueryParam: () => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      queryParams: [...state.currentRequest.queryParams, {
        id: generateId(),
        key: '',
        value: '',
        enabled: true,
      }],
      updatedAt: Date.now(),
    }
  })),

  updateQueryParam: (id, updates) => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      queryParams: state.currentRequest.queryParams.map(qp =>
        qp.id === id ? { ...qp, ...updates } : qp
      ),
      updatedAt: Date.now(),
    }
  })),

  removeQueryParam: (id) => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      queryParams: state.currentRequest.queryParams.filter(qp => qp.id !== id),
      updatedAt: Date.now(),
    }
  })),

  addHeader: () => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      headers: [...state.currentRequest.headers, {
        id: generateId(),
        key: '',
        value: '',
        enabled: true,
      }],
      updatedAt: Date.now(),
    }
  })),

  updateHeader: (id, updates) => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      headers: state.currentRequest.headers.map(h =>
        h.id === id ? { ...h, ...updates } : h
      ),
      updatedAt: Date.now(),
    }
  })),

  removeHeader: (id) => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      headers: state.currentRequest.headers.filter(h => h.id !== id),
      updatedAt: Date.now(),
    }
  })),

  setAuth: (auth) => set((state) => ({
    currentRequest: { ...state.currentRequest, auth, updatedAt: Date.now() }
  })),

  setBody: (body) => set((state) => ({
    currentRequest: { ...state.currentRequest, body, updatedAt: Date.now() }
  })),

  setPreRequestScript: (script) => set((state) => ({
    currentRequest: { ...state.currentRequest, preRequestScript: script, updatedAt: Date.now() }
  })),

  setPostRequestScript: (script) => set((state) => ({
    currentRequest: { ...state.currentRequest, postRequestScript: script, updatedAt: Date.now() }
  })),

  sendRequest: async (environment, timeoutMs) => {
    const { currentRequest, activeEnvironmentId } = get();
    set({ isLoading: true, currentResponse: null });

    try {
      const response = await executeRequest(currentRequest, environment, timeoutMs);
      set({ currentResponse: response, isLoading: false });

      await historyRepository.create({
        id: generateId(),
        request: currentRequest,
        response,
        timestamp: Date.now(),
        environmentId: activeEnvironmentId,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  stopRequest: () => {
    cancelRequest();
    set({ isLoading: false });
  },

  loadRequest: (request, environmentId) => set({
    currentRequest: { ...request, updatedAt: Date.now() },
    currentResponse: null,
    activeEnvironmentId: environmentId !== undefined ? environmentId : get().activeEnvironmentId,
  }),

  duplicateRequest: () => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      id: generateId(),
      name: `${state.currentRequest.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    currentResponse: null,
  })),

  resetRequest: () => set({
    currentRequest: createEmptyRequest(),
    currentResponse: null,
  }),

  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),
}));
