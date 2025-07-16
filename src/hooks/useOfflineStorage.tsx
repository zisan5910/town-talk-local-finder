
import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

interface CachedData {
  data: any;
  timestamp: number;
  expiry?: number;
}

export const useOfflineStorage = () => {
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load offline actions from localStorage
    const storedActions = localStorage.getItem('offline-actions');
    if (storedActions) {
      try {
        setOfflineActions(JSON.parse(storedActions));
      } catch (error) {
        console.error('Failed to parse offline actions:', error);
        localStorage.removeItem('offline-actions');
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      console.log('Back online - processing offline actions');
      processOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Gone offline - enabling offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      }).catch(err => console.log('Background sync registration failed:', err));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now()
    };

    const updatedActions = [...offlineActions, action];
    setOfflineActions(updatedActions);
    localStorage.setItem('offline-actions', JSON.stringify(updatedActions));
    
    console.log('Added offline action:', action);
  }, [offlineActions]);

  const processOfflineActions = useCallback(async () => {
    if (offlineActions.length === 0) return;

    console.log('Processing', offlineActions.length, 'offline actions');

    // Process each offline action
    for (const action of offlineActions) {
      try {
        // Handle different types of offline actions
        switch (action.type) {
          case 'add-to-cart':
            console.log('Syncing cart addition:', action.data);
            // Here you would typically sync with your backend
            break;
          case 'add-to-wishlist':
            console.log('Syncing wishlist addition:', action.data);
            // Here you would typically sync with your backend
            break;
          case 'remove-from-wishlist':
            console.log('Syncing wishlist removal:', action.data);
            break;
          case 'search-query':
            console.log('Syncing search query:', action.data);
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
    localStorage.removeItem('offline-actions');
    console.log('All offline actions processed');
  }, [offlineActions]);

  const cacheData = useCallback((key: string, data: any, expiry: number = 3600000) => {
    const cachedData: CachedData = {
      data,
      timestamp: Date.now(),
      expiry
    };
    
    try {
      localStorage.setItem(`cache-${key}`, JSON.stringify(cachedData));
      console.log('Cached data for key:', key);
    } catch (error) {
      console.error('Failed to cache data:', error);
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        clearOldCache();
        try {
          localStorage.setItem(`cache-${key}`, JSON.stringify(cachedData));
        } catch (retryError) {
          console.error('Failed to cache data after cleanup:', retryError);
        }
      }
    }
  }, []);

  const getCachedData = useCallback((key: string, maxAge: number = 3600000) => {
    try {
      const cached = localStorage.getItem(`cache-${key}`);
      if (cached) {
        const cachedData: CachedData = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;
        const effectiveMaxAge = cachedData.expiry || maxAge;
        
        if (age < effectiveMaxAge) {
          console.log('Retrieved cached data for key:', key);
          return cachedData.data;
        } else {
          console.log('Cached data expired for key:', key);
          localStorage.removeItem(`cache-${key}`);
        }
      }
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      localStorage.removeItem(`cache-${key}`);
    }
    return null;
  }, []);

  const clearOldCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache-'));
    
    // Sort by timestamp and remove oldest entries
    const cacheEntries = cacheKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return { key, timestamp: data.timestamp || 0 };
      } catch {
        return { key, timestamp: 0 };
      }
    }).sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25% of cache entries
    const toRemove = Math.ceil(cacheEntries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(cacheEntries[i].key);
    }
    
    console.log('Cleaned up', toRemove, 'old cache entries');
  }, []);

  const preloadImages = useCallback((imageUrls: string[]) => {
    if (!isOnline) return;
    
    imageUrls.forEach(url => {
      const img = new Image();
      img.onload = () => console.log('Preloaded image:', url);
      img.onerror = () => console.error('Failed to preload image:', url);
      img.src = url;
    });
  }, [isOnline]);

  return {
    isOnline,
    addOfflineAction,
    cacheData,
    getCachedData,
    preloadImages,
    clearOldCache,
    offlineActions: offlineActions.length
  };
};
