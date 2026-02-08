import { db } from '../db';
import { HistoryEntrySchema } from '../../validation/schemas';
import type { HistoryEntry } from '../../models';

export const historyRepository = {
  async getAll(): Promise<HistoryEntry[]> {
    const entries = await db.history.orderBy('timestamp').reverse().toArray();
    return entries.map(e => HistoryEntrySchema.parse(e));
  },

  async getRecent(limit: number): Promise<HistoryEntry[]> {
    const entries = await db.history.orderBy('timestamp').reverse().limit(limit).toArray();
    return entries.map(e => HistoryEntrySchema.parse(e));
  },

  async create(entry: HistoryEntry): Promise<void> {
    const validated = HistoryEntrySchema.parse(entry);
    await db.history.add(validated);
  },

  async delete(id: string): Promise<void> {
    await db.history.delete(id);
  },

  async clear(): Promise<void> {
    await db.history.clear();
  },
};
