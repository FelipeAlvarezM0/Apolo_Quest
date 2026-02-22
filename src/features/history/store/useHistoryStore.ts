import { create } from 'zustand';
import type { HistoryEntry } from '../../../shared/models';
import { historyRepository } from '../../../shared/storage/repositories/history.repository';

interface HistoryState {
  entries: HistoryEntry[];
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],
  isLoading: false,

  loadHistory: async () => {
    set({ isLoading: true });
    try {
      const entries = await historyRepository.getAll();
      set({ entries, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearHistory: async () => {
    await historyRepository.clear();
    set({ entries: [] });
  },

  deleteEntry: async (id) => {
    await historyRepository.delete(id);
    set((state) => ({
      entries: state.entries.filter(e => e.id !== id),
    }));
  },
}));
