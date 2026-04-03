import { useCallback, useState, useEffect } from 'react';

export interface SyncEvent {
  id: string;
  timestamp: string;
  type: 'export' | 'import' | 'create' | 'update' | 'delete';
  entity: 'document' | 'member' | 'category' | 'note';
  entityName: string;
  status: 'success' | 'error';
  message: string;
}

export function useSyncHistory() {
  const [syncHistory, setSyncHistory] = useState<SyncEvent[]>([]);

  // Charger l'historique au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('syncHistory');
    if (saved) {
      try {
        setSyncHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
    }
  }, []);

  // Sauvegarder l'historique
  const saveHistory = useCallback((events: SyncEvent[]) => {
    // Garder seulement les 100 derniers événements
    const limited = events.slice(-100);
    localStorage.setItem('syncHistory', JSON.stringify(limited));
    setSyncHistory(limited);
  }, []);

  // Ajouter un événement
  const addEvent = useCallback((event: Omit<SyncEvent, 'id'>) => {
    const newEvent: SyncEvent = {
      ...event,
      id: `${Date.now()}-${Math.random()}`,
    };
    const updated = [...syncHistory, newEvent];
    saveHistory(updated);
  }, [syncHistory, saveHistory]);

  // Obtenir la dernière synchronisation
  const getLastSync = useCallback(() => {
    const lastSync = syncHistory
      .filter(e => e.type === 'export' || e.type === 'import')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .at(0);
    return lastSync;
  }, [syncHistory]);

  // Obtenir les statistiques
  const getStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayEvents = syncHistory.filter(
      e => new Date(e.timestamp) >= today
    );

    const successCount = syncHistory.filter(e => e.status === 'success').length;
    const errorCount = syncHistory.filter(e => e.status === 'error').length;

    return {
      totalEvents: syncHistory.length,
      todayEvents: todayEvents.length,
      successCount,
      errorCount,
      lastSync: getLastSync(),
    };
  }, [syncHistory, getLastSync]);

  // Effacer l'historique
  const clearHistory = useCallback(() => {
    localStorage.removeItem('syncHistory');
    setSyncHistory([]);
  }, []);

  return {
    syncHistory,
    addEvent,
    getLastSync,
    getStats,
    clearHistory,
  };
}
