const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://172.27.57.74:5000/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle logout/redirect if needed
    }
    throw new Error('API Error');
  }

  return response.json();
}
