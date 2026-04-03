import { useEffect, useState } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  isSupported: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

/**
 * Hook to manage offline status and service worker registration
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    const swSupported = 'serviceWorker' in navigator;
    setIsSupported(swSupported);

    if (!swSupported) {
      console.log('[OfflineStatus] Service Workers not supported');
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });
        console.log('[OfflineStatus] Service Worker registered successfully');
        setSwRegistration(registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[OfflineStatus] New service worker available');
                // Notify user about update
                window.dispatchEvent(
                  new CustomEvent('sw-update-available', {
                    detail: { registration },
                  })
                );
              }
            });
          }
        });
      } catch (error) {
        console.error('[OfflineStatus] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[OfflineStatus] Back online');
      setIsOnline(true);
      // Trigger data sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_DATA',
        });
      }
    };

    const handleOffline = () => {
      console.log('[OfflineStatus] Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isSupported,
    swRegistration,
  };
}

/**
 * Utility function to cache URLs in the service worker
 */
export async function cacheUrls(urls: string[]): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls,
    });
  }
}

/**
 * Utility function to clear the cache
 */
export async function clearCache(): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
    });
  }
}

/**
 * Utility function to trigger service worker update
 */
export async function updateServiceWorker(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
