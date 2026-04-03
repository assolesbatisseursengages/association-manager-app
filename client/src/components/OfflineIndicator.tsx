import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Component to display online/offline status indicator
 */
export function OfflineIndicator() {
  const { isOnline, isSupported } = useOfflineStatus();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Only show indicator when offline
    setShowIndicator(!isOnline);
  }, [isOnline]);

  if (!isSupported || isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg">
        <WifiOff className="w-5 h-5 text-amber-600" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-amber-900">Mode hors ligne</p>
          <p className="text-xs text-amber-700">Les modifications seront synchronisées à la reconnexion</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Component to display online status in header
 */
export function OnlineStatusBadge() {
  const { isOnline } = useOfflineStatus();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600 font-medium">En ligne</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-amber-600 font-medium">Hors ligne</span>
        </>
      )}
    </div>
  );
}
