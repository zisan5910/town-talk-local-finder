
import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const useOfflineStorage = () => {
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load offline actions from localStorage
    try {
      const storedActions = localStorage.getItem('offline-actions');
      if (storedActions) {
        setOfflineActions(JSON.parse(storedActions));
      }
    } catch (error) {
      console.error('Failed to load offline actions:', error);
    }

    const handleOnline = () => {
      console.log('App is back online');
      setIsOnline(true);
      // Process offline actions when back online
      processOfflineActions();
    };

    const handleOffline = () => {
      console.log('App is offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now()
    };

    setOfflineActions(prev => {
      const updatedActions = [...prev, action];
      try {
        localStorage.setItem('offline-actions', JSON.stringify(updatedActions));
      } catch (error) {
        console.error('Failed to save offline action:', error);
      }
      return updatedActions;
    });
  }, []);

  const processOfflineActions = useCallback(async () => {
    if (offlineActions.length === 0) return;

    console.log('Processing offline actions:', offlineActions.length);

    // Process each offline action
    for (const action of offlineActions) {
      try {
        // Handle different types of offline actions
        switch (action.type) {
          case 'add-to-cart':
            console.log('Syncing cart addition:', action.data);
            break;
          case 'add-to-wishlist':
          case 'remove-from-wishlist':
            console.log('Syncing wishlist action:', action.data);
            break;
          case 'order-checkout':
            console.log('Syncing checkout:', action.data);
            break;
          default:
            console.log('Unknown offline action:', action.type);
        }
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }

    // Clear processed actions
    setOfflineActions([]);
    try {
      localStorage.removeItem('offline-actions');
    } catch (error) {
      console.error('Failed to clear offline actions:', error);
    }
  }, [offlineActions]);

  const cacheData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`cache-${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  const getCachedData = useCallback((key: string, maxAge: number = 3600000) => {
    try {
      const cached = localStorage.getItem(`cache-${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }, []);

  const clearCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  return {
    isOnline,
    addOfflineAction,
    cacheData,
    getCachedData,
    clearCache,
    offlineActions: offlineActions.length
  };
};
