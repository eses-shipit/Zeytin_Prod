// src/services/offline-storage.ts

export type QueuedAction = {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
};

const STORAGE_KEY = 'zeytin_offline_queue';

export const OfflineStorageService = {
  getQueue: (): QueuedAction[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to read offline queue', e);
      return [];
    }
  },

  addToQueue: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const queue = OfflineStorageService.getQueue();
    const newAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    queue.push(newAction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return newAction;
  },

  removeFromQueue: (id: string) => {
    const queue = OfflineStorageService.getQueue();
    const newQueue = queue.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
  },

  clearQueue: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  updateRetryCount: (id: string) => {
    const queue = OfflineStorageService.getQueue();
    const itemIndex = queue.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      queue[itemIndex].retryCount += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  }
};

