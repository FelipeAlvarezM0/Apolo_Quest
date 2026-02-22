import { create } from 'zustand';
import type { Collection, HttpRequest } from '../../../shared/models';
import { collectionsRepository } from '../../../shared/storage/repositories/collections.repository';
import { generateId } from '../../../shared/utils/id';

interface CollectionsState {
  collections: Collection[];
  isLoading: boolean;
  loadCollections: () => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<void>;
  addRequestToCollection: (collectionId: string, request: HttpRequest) => Promise<void>;
  removeRequestFromCollection: (collectionId: string, requestId: string) => Promise<void>;
  updateCollection: (collectionId: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  moveRequestInCollection: (collectionId: string, requestId: string, direction: 'up' | 'down') => Promise<void>;
  moveRequestBetweenCollections: (fromCollectionId: string, toCollectionId: string, requestId: string) => Promise<void>;
  reorderCollections: (fromIndex: number, toIndex: number) => Promise<void>;
  duplicateRequest: (collectionId: string, request: HttpRequest) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  isLoading: false,

  loadCollections: async () => {
    set({ isLoading: true });
    try {
      const collections = await collectionsRepository.getAll();
      set({ collections, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createCollection: async (name, description) => {
    const newCollection: Collection = {
      id: generateId(),
      name,
      description,
      requests: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await collectionsRepository.create(newCollection);
    set((state) => ({
      collections: [...state.collections, newCollection],
    }));
  },

  addRequestToCollection: async (collectionId, request) => {
    const collection = get().collections.find(c => c.id === collectionId);
    if (!collection) return;

    const requestWithNewId = { ...request, id: generateId() };
    const updatedRequests = [...collection.requests, requestWithNewId];

    await collectionsRepository.update(collectionId, {
      requests: updatedRequests,
      updatedAt: Date.now(),
    });

    set((state) => ({
      collections: state.collections.map(c =>
        c.id === collectionId
          ? { ...c, requests: updatedRequests, updatedAt: Date.now() }
          : c
      ),
    }));
  },

  removeRequestFromCollection: async (collectionId, requestId) => {
    const collection = get().collections.find(c => c.id === collectionId);
    if (!collection) return;

    const updatedRequests = collection.requests.filter(r => r.id !== requestId);

    await collectionsRepository.update(collectionId, {
      requests: updatedRequests,
      updatedAt: Date.now(),
    });

    set((state) => ({
      collections: state.collections.map(c =>
        c.id === collectionId
          ? { ...c, requests: updatedRequests, updatedAt: Date.now() }
          : c
      ),
    }));
  },

  updateCollection: async (collectionId, updates) => {
    await collectionsRepository.update(collectionId, {
      ...updates,
      updatedAt: Date.now(),
    });

    set((state) => ({
      collections: state.collections.map(c =>
        c.id === collectionId
          ? { ...c, ...updates, updatedAt: Date.now() }
          : c
      ),
    }));
  },

  deleteCollection: async (collectionId) => {
    await collectionsRepository.delete(collectionId);
    set((state) => ({
      collections: state.collections.filter(c => c.id !== collectionId),
    }));
  },

  moveRequestInCollection: async (collectionId, requestId, direction) => {
    const collection = get().collections.find(c => c.id === collectionId);
    if (!collection) return;

    const index = collection.requests.findIndex(r => r.id === requestId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= collection.requests.length) return;

    const updatedRequests = [...collection.requests];
    [updatedRequests[index], updatedRequests[newIndex]] = [updatedRequests[newIndex], updatedRequests[index]];

    await collectionsRepository.update(collectionId, {
      requests: updatedRequests,
      updatedAt: Date.now(),
    });

    set((state) => ({
      collections: state.collections.map(c =>
        c.id === collectionId
          ? { ...c, requests: updatedRequests, updatedAt: Date.now() }
          : c
      ),
    }));
  },

  duplicateRequest: async (collectionId, request) => {
    const collection = get().collections.find(c => c.id === collectionId);
    if (!collection) return;

    const duplicatedRequest = {
      ...request,
      id: generateId(),
      name: `${request.name} (Copy)`,
    };

    const updatedRequests = [...collection.requests, duplicatedRequest];

    await collectionsRepository.update(collectionId, {
      requests: updatedRequests,
      updatedAt: Date.now(),
    });

    set((state) => ({
      collections: state.collections.map(c =>
        c.id === collectionId
          ? { ...c, requests: updatedRequests, updatedAt: Date.now() }
          : c
      ),
    }));
  },

  moveRequestBetweenCollections: async (fromCollectionId, toCollectionId, requestId) => {
    const fromCollection = get().collections.find(c => c.id === fromCollectionId);
    const toCollection = get().collections.find(c => c.id === toCollectionId);
    if (!fromCollection || !toCollection) return;

    const request = fromCollection.requests.find(r => r.id === requestId);
    if (!request) return;

    const fromUpdatedRequests = fromCollection.requests.filter(r => r.id !== requestId);
    const toUpdatedRequests = [...toCollection.requests, { ...request, id: generateId() }];

    await collectionsRepository.update(fromCollectionId, {
      requests: fromUpdatedRequests,
      updatedAt: Date.now(),
    });

    await collectionsRepository.update(toCollectionId, {
      requests: toUpdatedRequests,
      updatedAt: Date.now(),
    });

    set((state) => ({
      collections: state.collections.map(c => {
        if (c.id === fromCollectionId) {
          return { ...c, requests: fromUpdatedRequests, updatedAt: Date.now() };
        }
        if (c.id === toCollectionId) {
          return { ...c, requests: toUpdatedRequests, updatedAt: Date.now() };
        }
        return c;
      }),
    }));
  },

  reorderCollections: async (fromIndex, toIndex) => {
    const { collections } = get();
    const reordered = [...collections];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    set({ collections: reordered });

    await Promise.all(
      reordered.map((collection) =>
        collectionsRepository.update(collection.id, {
          updatedAt: Date.now(),
        })
      )
    );
  },
}));
