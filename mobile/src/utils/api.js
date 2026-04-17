import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiBaseUrl = () => {
  // Use environment variable if defined (best practice for Expo 49+)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // If running on Web target in the browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Fallbacks for local development
  if (Platform.OS === 'android' && __DEV__) {
     return 'http://10.0.2.2:5000/api'; // Android Emulator alias
  }
  
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl(); 
console.log(`[NETWORK] Target Registry: ${API_BASE_URL}`);

const ANDROID_EMULATOR_URL = 'http://10.0.2.2:5000/api';
const LOCALHOST_URL = 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const getUrl = (baseUrl) => `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(getUrl(API_BASE_URL), {
      ...options,
      headers,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  } catch (err) {
    // If primary failed and we're on Android, try emulator alias
    if (Platform.OS === 'android') {
      console.log(`[NETWORK] Primary failed, attempting emulator fallback: ${ANDROID_EMULATOR_URL}`);
      try {
        const response = await fetch(getUrl(ANDROID_EMULATOR_URL), {
          ...options,
          headers,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');
        return data;
      } catch (innerErr) {
        console.log(`[NETWORK] Emulator fallback failed, attempting localhost fallback: ${LOCALHOST_URL}`);
        try {
          const response = await fetch(getUrl(LOCALHOST_URL), {
            ...options,
            headers,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Something went wrong');
          return data;
        } catch (thirdErr) {
          throw new Error(`NETWORK_ERROR: Unable to reach registry at ${API_BASE_URL} or ${ANDROID_EMULATOR_URL} or ${LOCALHOST_URL}`);
        }
      }
    }
    throw err;
  }
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

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const scanQRCode = async (code) => {
  return await apiFetch('/qrs/scan', {
    method: 'POST',
    body: JSON.stringify({ code }),
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
