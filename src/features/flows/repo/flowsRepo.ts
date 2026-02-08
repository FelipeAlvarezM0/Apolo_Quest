import { db } from '../../../shared/storage/db';
import type { Flow } from '../models/flow';
import { validateFlow } from '../models/zod';
import { generateId } from '../../../shared/utils/id';

export const flowsRepo = {
  async getAll(): Promise<Flow[]> {
    try {
      return await db.flows.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('Failed to get flows:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Flow | undefined> {
    try {
      return await db.flows.get(id);
    } catch (error) {
      console.error('Failed to get flow by id:', error);
      return undefined;
    }
  },

  async create(flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Flow> {
    const now = Date.now();
    const newFlow: Flow = {
      ...flow,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    await db.flows.add(newFlow);
    return newFlow;
  },

  async update(flow: Flow): Promise<void> {
    const updated: Flow = {
      ...flow,
      updatedAt: Date.now(),
    };

    await db.flows.put(updated);
  },

  async delete(id: string): Promise<void> {
    await db.flows.delete(id);
  },

  async importFlow(json: string): Promise<{ success: boolean; flow?: Flow; error?: string }> {
    try {
      const parsed = JSON.parse(json);
      const validation = validateFlow(parsed);

      if (!validation.success) {
        return { success: false, error: 'Invalid flow format' };
      }

      const flow = validation.data as Flow;
      flow.id = generateId();
      flow.createdAt = Date.now();
      flow.updatedAt = Date.now();

      await db.flows.add(flow);
      return { success: true, flow };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async exportFlow(flowId: string): Promise<{ success: boolean; json?: string; error?: string }> {
    try {
      const flow = await db.flows.get(flowId);
      if (!flow) {
        return { success: false, error: 'Flow not found' };
      }

      const json = JSON.stringify(flow, null, 2);
      return { success: true, json };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async duplicate(flowId: string): Promise<Flow | undefined> {
    try {
      const original = await db.flows.get(flowId);
      if (!original) return undefined;

      const now = Date.now();
      const duplicated: Flow = {
        ...original,
        id: generateId(),
        name: `${original.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      await db.flows.add(duplicated);
      return duplicated;
    } catch (error) {
      console.error('Failed to duplicate flow:', error);
      return undefined;
    }
  },
};
