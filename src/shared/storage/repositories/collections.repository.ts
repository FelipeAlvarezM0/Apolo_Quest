import { db } from '../db';
import { CollectionSchema } from '../../validation/schemas';
import type { Collection } from '../../models';

export const collectionsRepository = {
  async getAll(): Promise<Collection[]> {
    const collections = await db.collections.toArray();
    return collections.map(c => CollectionSchema.parse(c));
  },

  async getById(id: string): Promise<Collection | undefined> {
    const collection = await db.collections.get(id);
    if (!collection) return undefined;
    return CollectionSchema.parse(collection);
  },

  async create(collection: Collection): Promise<void> {
    const validated = CollectionSchema.parse(collection);
    await db.collections.add(validated);
  },

  async update(id: string, collection: Partial<Collection>): Promise<void> {
    await db.collections.update(id, collection);
  },

  async delete(id: string): Promise<void> {
    await db.collections.delete(id);
  },

  async clear(): Promise<void> {
    await db.collections.clear();
  },
};
