import { create } from 'zustand';
import type { Settings } from '../../../shared/models';
import { settingsRepository } from '../../../shared/storage/repositories/settings.repository';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    theme: 'dark',
    timeoutMs: 30000,
    prettyJson: true,
  },
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await settingsRepository.get();
      set({ settings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      settingsRepository.save(newSettings);
      return { settings: newSettings };
    });
  },
}));
