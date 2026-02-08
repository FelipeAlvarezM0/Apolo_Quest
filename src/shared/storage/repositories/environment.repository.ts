import { db } from '../db';
import { EnvironmentSchema } from '../../validation/schemas';
import type { Environment } from '../../models';

export const environmentRepository = {
  async getAll(): Promise<Environment[]> {
    const environments = await db.environments.toArray();
    return environments.map(e => EnvironmentSchema.parse(e));
  },

  async getById(id: string): Promise<Environment | undefined> {
    const environment = await db.environments.get(id);
    if (!environment) return undefined;
    return EnvironmentSchema.parse(environment);
  },

  async create(environment: Environment): Promise<void> {
    const validated = EnvironmentSchema.parse(environment);
    await db.environments.add(validated);
  },

  async update(id: string, environment: Partial<Environment>): Promise<void> {
    await db.environments.update(id, environment);
  },

  async delete(id: string): Promise<void> {
    await db.environments.delete(id);
  },

  async clear(): Promise<void> {
    await db.environments.clear();
  },
};
