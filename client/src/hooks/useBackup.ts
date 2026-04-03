import { useCallback } from 'react';
import { toast } from 'sonner';

interface BackupData {
  version: string;
  timestamp: string;
  documents: any[];
  members: any[];
  categories: any[];
  notes: any[];
}

export function useBackup() {
  const exportData = useCallback(() => {
    try {
      // Récupérer toutes les données du localStorage
      const documents = JSON.parse(localStorage.getItem('offlineDocuments') || '[]');
      const members = JSON.parse(localStorage.getItem('offlineMembers') || '[]');
      const categories = JSON.parse(localStorage.getItem('offlineCategories') || '[]');
      const notes = JSON.parse(localStorage.getItem('offlineNotes') || '[]');

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documents,
        members,
        categories,
        notes,
      };

      // Créer le fichier JSON
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-batisseurs-engages-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('✅ Backup exporté avec succès');
      return backupData;
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('❌ Erreur lors de l\'export du backup');
      throw error;
    }
  }, []);

  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backupData: BackupData = JSON.parse(content);

          // Vérifier la structure du backup
          if (!backupData.version || !backupData.timestamp) {
            throw new Error('Format de backup invalide');
          }

          // Importer les données
          localStorage.setItem('offlineDocuments', JSON.stringify(backupData.documents || []));
          localStorage.setItem('offlineMembers', JSON.stringify(backupData.members || []));
          localStorage.setItem('offlineCategories', JSON.stringify(backupData.categories || []));
          localStorage.setItem('offlineNotes', JSON.stringify(backupData.notes || []));

          toast.success('✅ Backup importé avec succès');
          resolve(true);
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          toast.error('❌ Erreur lors de l\'import du backup');
          resolve(false);
        }
      };

      reader.onerror = () => {
        toast.error('❌ Erreur lors de la lecture du fichier');
        resolve(false);
      };

      reader.readAsText(file);
    });
  }, []);

  const getBackupSize = useCallback(() => {
    try {
      const documents = localStorage.getItem('offlineDocuments') || '[]';
      const members = localStorage.getItem('offlineMembers') || '[]';
      const categories = localStorage.getItem('offlineCategories') || '[]';
      const notes = localStorage.getItem('offlineNotes') || '[]';

      const totalSize = (documents.length + members.length + categories.length + notes.length) / 1024;
      return totalSize.toFixed(2);
    } catch {
      return '0';
    }
  }, []);

  return {
    exportData,
    importData,
    getBackupSize,
  };
}
