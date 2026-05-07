import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useData - A custom hook for fetching data with local caching (SWR logic)
 * @param {string} key - Unique key for caching this data
 * @param {function} fetcher - Async function that returns the data
 * @param {object} options - Configuration options
 */
export const useData = (key, fetcher, options = {}) => {
  const { 
    enabled = true, 
    onSuccess = null, 
    onError = null,
    refreshInterval = 0 // in ms
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const CACHE_KEY = `beth_cache_${key}`;

  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoading(false);
        setIsStale(true);
        return parsed;
      }
    } catch (e) {
      console.warn(`Failed to load ${key} from cache`, e);
    }
    return null;
  }, [CACHE_KEY, key]);

  const fetchData = useCallback(async (silent = false) => {
    if (!enabled) return;
    if (!silent) setLoading(true);
    
    try {
      const result = await fetcher();
      setData(result);
      setIsStale(false);
      setError(null);
      
      // Save to cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));
      
      if (onSuccess) onSuccess(result);
    } catch (e) {
      setError(e);
      if (onError) onError(e);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetcher, CACHE_KEY, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const init = async () => {
      await loadFromCache();
      if (mounted) {
        // Fetch fresh data in background
        fetchData(true); 
      }
    };

    init();

    let interval;
    if (refreshInterval > 0) {
      interval = setInterval(() => fetchData(true), refreshInterval);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [enabled, key]); // key is important here to re-run on key change

  return { data, loading, error, isStale, refetch: () => fetchData() };
};
