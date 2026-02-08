import Dexie, { type Table } from 'dexie';
import type { Collection, HistoryEntry, Environment, Settings } from '../models';
import type { Flow } from '../../features/flows/models/flow';

export class ApiClientDatabase extends Dexie {
  collections!: Table<Collection, string>;
  history!: Table<HistoryEntry, string>;
  environments!: Table<Environment, string>;
  settings!: Table<Settings, string>;
  flows!: Table<Flow, string>;

  constructor() {
    super('ApiClientDB');

    this.version(1).stores({
      collections: 'id, name, createdAt, updatedAt',
      history: 'id, timestamp',
      environments: 'id, name, createdAt, updatedAt',
      settings: 'theme',
    });

    this.version(2).stores({
      collections: 'id, name, createdAt, updatedAt',
      history: 'id, timestamp',
      environments: 'id, name, createdAt, updatedAt',
      settings: 'theme',
      flows: 'id, name, createdAt, updatedAt',
    });
  }
}

export const db = new ApiClientDatabase();
