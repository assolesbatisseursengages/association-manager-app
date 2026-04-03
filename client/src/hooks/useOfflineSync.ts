import { useEffect, useState, useCallback } from 'react';
import { useOfflineStatus } from './useOfflineStatus';

interface SyncItem {
  id: string;
  tableName: string;
  action: 'create' | 'update' | 'delete';
  recordId?: number;
  data: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

const DB_NAME = 'LesBatisseursDB';
const STORE_NAME = 'offline_sync_queue';
const DB_VERSION = 1;

/**
 * Hook to manage offline data synchronization with IndexedDB
 */
export function useOfflineSync() {
  const { isOnline } = useOfflineStatus();
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [pendingItems, setPendingItems] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error('[OfflineSync] IndexedDB error:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          const database = request.result;
          console.log('[OfflineSync] IndexedDB opened successfully');
          resolve(database);
        };

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            console.log('[OfflineSync] Object store created');
          }
        };
      });
    };

    initDB()
      .then((database) => {
        setDb(database);
      })
      .catch((error) => {
        console.error('[OfflineSync] Failed to initialize IndexedDB:', error);
      });
  }, []);

  // Add item to sync queue
  const addToSyncQueue = useCallback(
    async (tableName: string, action: 'create' | 'update' | 'delete', data: Record<string, any>, recordId?: number) => {
      if (!db) return;

      const item: SyncItem = {
        id: `${tableName}-${action}-${Date.now()}`,
        tableName,
        action,
        recordId,
        data,
        timestamp: Date.now(),
        status: 'pending',
      };

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(item);

        request.onsuccess = () => {
          console.log('[OfflineSync] Item added to queue:', item.id);
          resolve();
        };

        request.onerror = () => {
          console.error('[OfflineSync] Error adding item:', request.error);
          reject(request.error);
        };
      });
    },
    [db]
  );

  // Get pending items
  const getPendingItems = useCallback(async () => {
    if (!db) return [];

    return new Promise<SyncItem[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        const items = request.result as SyncItem[];
        console.log('[OfflineSync] Found pending items:', items.length);
        resolve(items);
      };

      request.onerror = () => {
        console.error('[OfflineSync] Error getting pending items:', request.error);
        reject(request.error);
      };
    });
  }, [db]);

  // Mark item as synced
  const markAsSynced = useCallback(
    async (itemId: string) => {
      if (!db) return;

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(itemId);

        request.onsuccess = () => {
          const item = request.result as SyncItem;
          if (item) {
            item.status = 'synced';
            const updateRequest = store.put(item);
            updateRequest.onsuccess = () => {
              console.log('[OfflineSync] Item marked as synced:', itemId);
              resolve();
            };
            updateRequest.onerror = () => {
              reject(updateRequest.error);
            };
          } else {
            resolve();
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    },
    [db]
  );

  // Clear sync queue
  const clearSyncQueue = useCallback(async () => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[OfflineSync] Sync queue cleared');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }, [db]);

  // Sync pending items when back online
  useEffect(() => {
    if (!isOnline || !db || isSyncing) return;

    const syncData = async () => {
      setIsSyncing(true);
      try {
        const items = await getPendingItems();
        setPendingItems(items);

        for (const item of items) {
          try {
            // In a real app, you would send this to the server
            // For now, just mark as synced
            await markAsSynced(item.id);
            console.log('[OfflineSync] Synced item:', item.id);
          } catch (error) {
            console.error('[OfflineSync] Error syncing item:', error);
          }
        }

        console.log('[OfflineSync] Sync complete');
      } catch (error) {
        console.error('[OfflineSync] Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncData();
  }, [isOnline, db, getPendingItems, markAsSynced, isSyncing]);

  return {
    addToSyncQueue,
    getPendingItems,
    markAsSynced,
    clearSyncQueue,
    pendingItems,
    isSyncing,
  };
}
