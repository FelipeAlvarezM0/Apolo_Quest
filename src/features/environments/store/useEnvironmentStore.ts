import { create } from 'zustand';
import type { Environment, EnvironmentVariable } from '../../../shared/models';
import { environmentRepository } from '../../../shared/storage/repositories/environment.repository';
import { generateId } from '../../../shared/utils/id';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  isLoading: boolean;
  loadEnvironments: () => Promise<void>;
  createEnvironment: (name: string) => Promise<void>;
  updateEnvironment: (id: string, updates: Partial<Environment>) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  renameEnvironment: (id: string, name: string) => Promise<void>;
  duplicateEnvironment: (id: string) => Promise<void>;
  reorderEnvironments: (fromIndex: number, toIndex: number) => Promise<void>;
  setActiveEnvironment: (id: string | null) => void;
  addVariable: (environmentId: string) => Promise<void>;
  duplicateVariable: (environmentId: string, variableId: string) => Promise<void>;
  updateVariable: (environmentId: string, variableId: string, updates: Partial<EnvironmentVariable>) => Promise<void>;
  removeVariable: (environmentId: string, variableId: string) => Promise<void>;
  reorderVariables: (environmentId: string, fromIndex: number, toIndex: number) => Promise<void>;
  getActiveEnvironment: () => Environment | null;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvironmentId: null,
  isLoading: false,

  loadEnvironments: async () => {
    set({ isLoading: true });
    try {
      const environments = await environmentRepository.getAll();
      set({ environments, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createEnvironment: async (name) => {
    const newEnvironment: Environment = {
      id: generateId(),
      name,
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await environmentRepository.create(newEnvironment);
    set((state) => ({
      environments: [...state.environments, newEnvironment],
    }));
  },

  updateEnvironment: async (id, updates) => {
    await environmentRepository.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
      ),
    }));
  },

  deleteEnvironment: async (id) => {
    await environmentRepository.delete(id);
    set((state) => ({
      environments: state.environments.filter(e => e.id !== id),
      activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
    }));
  },

  renameEnvironment: async (id, name) => {
    await environmentRepository.update(id, {
      name,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === id ? { ...e, name, updatedAt: Date.now() } : e
      ),
    }));
  },

  duplicateEnvironment: async (id) => {
    const environment = get().environments.find(e => e.id === id);
    if (!environment) return;

    const newEnvironment: Environment = {
      ...environment,
      id: generateId(),
      name: `${environment.name} (Copy)`,
      variables: environment.variables.map(v => ({
        ...v,
        id: generateId(),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await environmentRepository.create(newEnvironment);
    set((state) => ({
      environments: [...state.environments, newEnvironment],
    }));
  },

  reorderEnvironments: async (fromIndex, toIndex) => {
    const { environments } = get();
    const reordered = [...environments];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    set({ environments: reordered });

    await Promise.all(
      reordered.map((env) =>
        environmentRepository.update(env.id, {
          updatedAt: Date.now(),
        })
      )
    );
  },

  setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

  addVariable: async (environmentId) => {
    const environment = get().environments.find(e => e.id === environmentId);
    if (!environment) return;

    const newVariable: EnvironmentVariable = {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    };

    const updatedVariables = [...environment.variables, newVariable];

    await environmentRepository.update(environmentId, {
      variables: updatedVariables,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === environmentId
          ? { ...e, variables: updatedVariables, updatedAt: Date.now() }
          : e
      ),
    }));
  },

  duplicateVariable: async (environmentId, variableId) => {
    const environment = get().environments.find(e => e.id === environmentId);
    if (!environment) return;

    const variable = environment.variables.find(v => v.id === variableId);
    if (!variable) return;

    const newVariable: EnvironmentVariable = {
      ...variable,
      id: generateId(),
      key: `${variable.key}_copy`,
    };

    const updatedVariables = [...environment.variables, newVariable];

    await environmentRepository.update(environmentId, {
      variables: updatedVariables,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === environmentId
          ? { ...e, variables: updatedVariables, updatedAt: Date.now() }
          : e
      ),
    }));
  },

  updateVariable: async (environmentId, variableId, updates) => {
    const environment = get().environments.find(e => e.id === environmentId);
    if (!environment) return;

    const updatedVariables = environment.variables.map(v =>
      v.id === variableId ? { ...v, ...updates } : v
    );

    await environmentRepository.update(environmentId, {
      variables: updatedVariables,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === environmentId
          ? { ...e, variables: updatedVariables, updatedAt: Date.now() }
          : e
      ),
    }));
  },

  removeVariable: async (environmentId, variableId) => {
    const environment = get().environments.find(e => e.id === environmentId);
    if (!environment) return;

    const updatedVariables = environment.variables.filter(v => v.id !== variableId);

    await environmentRepository.update(environmentId, {
      variables: updatedVariables,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === environmentId
          ? { ...e, variables: updatedVariables, updatedAt: Date.now() }
          : e
      ),
    }));
  },

  reorderVariables: async (environmentId, fromIndex, toIndex) => {
    const environment = get().environments.find(e => e.id === environmentId);
    if (!environment) return;

    const reordered = [...environment.variables];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    await environmentRepository.update(environmentId, {
      variables: reordered,
      updatedAt: Date.now(),
    });

    set((state) => ({
      environments: state.environments.map(e =>
        e.id === environmentId
          ? { ...e, variables: reordered, updatedAt: Date.now() }
          : e
      ),
    }));
  },

  getActiveEnvironment: () => {
    const { environments, activeEnvironmentId } = get();
    if (!activeEnvironmentId) return null;
    return environments.find(e => e.id === activeEnvironmentId) || null;
  },
}));
