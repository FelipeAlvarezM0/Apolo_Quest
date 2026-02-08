import { db } from '../db';
import { SettingsSchema } from '../../validation/schemas';
import type { Settings } from '../../models';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  timeoutMs: 30000,
  prettyJson: true,
};

export const settingsRepository = {
  async get(): Promise<Settings> {
    const allSettings = await db.settings.toArray();
    if (allSettings.length === 0) {
      await this.save(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return SettingsSchema.parse(allSettings[0]);
  },

  async save(settings: Settings): Promise<void> {
    const validated = SettingsSchema.parse(settings);
    await db.settings.clear();
    await db.settings.add(validated);
  },
};
