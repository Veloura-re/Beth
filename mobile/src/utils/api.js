import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Local development fallback: 
  // If you are on an emulator, use http://10.0.2.2:5000/api
  // If you are on a physical device, use your machine's local IP (e.g. http://192.168.1.x:5000/api)
  // For web development, http://localhost:5000/api works.
  
  // Defaulting to Render production for convenience, but logging a warning
  console.warn('[NETWORK] EXPO_PUBLIC_API_URL not found. Falling back to Production Registry.');
  return 'https://beth-backend.onrender.com/api'; 
};

export const API_BASE_URL = getApiBaseUrl(); 
console.log(`[NETWORK] Target Registry: ${API_BASE_URL}`);

const ANDROID_EMULATOR_URL = 'http://10.0.2.2:5000/api';
const LOCALHOST_URL = 'http://127.0.0.1:5000/api';

let primaryIsDown = false;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 30000; // 30 seconds

export const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const isLocalWeb = Platform.OS === 'web' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If we're on local web, try local backend first to avoid any timeout penalty
  if (isLocalWeb) {
    try {
      const response = await fetch(`${LOCALHOST_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.log(`[NETWORK] Local first failed, falling back to primary/sticky logic`);
    }
  }

  // Circuit breaker: skip primary if known to be down
  const now = Date.now();
  const shouldSkipPrimary = primaryIsDown && (now - lastFailureTime < FAILURE_THRESHOLD);

  if (!shouldSkipPrimary) {
    // Controller for timing out the primary request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 seconds

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (!response.ok) {
        const detail = data.error || (data.diagnostic ? JSON.stringify(data.diagnostic) : (data.details ? JSON.stringify(data.details) : ''));
        const errMsg = data.message || 'REGISTRY_REJECTION';
        throw new Error(detail ? `${errMsg}: ${detail}` : errMsg);
      }
      primaryIsDown = false; 
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError' || err.message.includes('Network request failed') || err.message.includes('CORS')) {
        primaryIsDown = true;
        lastFailureTime = Date.now();
        console.warn(`[NETWORK] Primary registry unreachable. Activating 30s sticky fallback.`);
      }
    }
  }

  // Web platform fallback (non-localhost or if local-first failed)
  if (Platform.OS === 'web') {
    try {
      console.log(`[NETWORK] Using Web fallback: ${LOCALHOST_URL}${endpoint}`);
      const response = await fetch(`${LOCALHOST_URL}${endpoint}`, {
        ...options,
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'REGISTRY_REJECTION');
      return data;
    } catch (fallbackErr) {
      console.error(`[NETWORK_FAILURE] Both primary and local fallbacks failed.`, fallbackErr);
      throw new Error(`BETH_NETWORK_ERROR: Both primary and local registries are unreachable.`);
    }
  }

  throw new Error(`BETH_NETWORK_ERROR: Unable to communicate with registry at ${API_BASE_URL}.`);
};

export const login = async (email, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

export const register = async (name, email, password, token) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, token }),
  });

  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const scanQRCode = async (qrId, lat, lng) => {
  return await apiFetch('/scans', {
    method: 'POST',
    body: JSON.stringify({ qrId, lat, lng }),
  });
};

export const requestCashout = async (amount) => {
  return await apiFetch('/financial/cashout', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
};

export const updateCampaign = async (id, data) => {
  return await apiFetch(`/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};
