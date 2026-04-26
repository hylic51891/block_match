import type { IStorageRepository } from './types';
import { LocalStorageRepository } from './local-storage-repo';

let instance: IStorageRepository | null = null;

export function createStorage(): IStorageRepository {
  if (!instance) {
    instance = new LocalStorageRepository();
  }
  return instance;
}

export { type IStorageRepository } from './types';
