/**
 * BETH HEARTBEAT ENGINE
 * 
 * Pings the production Render backend every 4 minutes to prevent
 * it from spinning down due to inactivity (Render free tier sleeps
 * after 15 minutes of no requests).
 * 
 * Strategy:
 *  - Ping immediately on start to pre-warm the server.
 *  - Ping every 4 minutes thereafter.
 *  - Only targets the production URL — skips pings during local dev.
 *  - Silent: no UI impact, no auth required (hits /health endpoint).
 */

import { AppState } from 'react-native';

const PRODUCTION_HEALTH_URL = 'https://beth-backend.onrender.com/health';
const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
const PING_TIMEOUT_MS = 10000; // 10s timeout for the ping itself

let _intervalId = null;
let _appStateSubscription = null;
let _isRunning = false;

const ping = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const res = await fetch(PRODUCTION_HEALTH_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      console.log(`[HEARTBEAT] ✓ Registry is alive — ${new Date().toLocaleTimeString()}`);
    } else {
      console.warn(`[HEARTBEAT] ⚠ Registry responded with ${res.status}`);
    }
  } catch (e) {
    // Silent fail — don't crash the app if the ping fails
    if (e.name !== 'AbortError') {
      console.warn(`[HEARTBEAT] ✗ Ping failed — ${e.message}`);
    }
  }
};

const startHeartbeat = () => {
  // Don't start in local web dev — it's unnecessary and adds noise
  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location?.hostname === 'localhost' ||
      window.location?.hostname === '127.0.0.1');

  if (isLocalDev) {
    console.log('[HEARTBEAT] Local dev detected — skipping registry pings.');
    return;
  }

  if (_isRunning) return; // Already running, don't double-start
  _isRunning = true;

  console.log('[HEARTBEAT] Starting — pinging registry every 4 minutes.');

  // Immediate warm-up ping so the server is ready before the user logs in
  ping();

  // Schedule recurring pings
  _intervalId = setInterval(ping, PING_INTERVAL_MS);

  // Pause pings when the app goes to the background, resume on foreground
  _appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      // App came back to foreground — ping immediately to re-warm
      if (!_intervalId) {
        ping();
        _intervalId = setInterval(ping, PING_INTERVAL_MS);
        console.log('[HEARTBEAT] App resumed — restarting registry pings.');
      }
    } else if (nextState === 'background' || nextState === 'inactive') {
      // App went to background — stop pinging to save battery
      if (_intervalId) {
        clearInterval(_intervalId);
        _intervalId = null;
        console.log('[HEARTBEAT] App backgrounded — pausing registry pings.');
      }
    }
  });
};

const stopHeartbeat = () => {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
  if (_appStateSubscription) {
    _appStateSubscription.remove();
    _appStateSubscription = null;
  }
  _isRunning = false;
  console.log('[HEARTBEAT] Stopped.');
};

export { startHeartbeat, stopHeartbeat };
