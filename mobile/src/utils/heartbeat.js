/**
 * BETH HEARTBEAT ENGINE — DECOMMISSIONED
 * 
 * Legacy heartbeat for Render backend has been disabled.
 * The platform has migrated to a serverless Supabase architecture.
 */

export const startHeartbeat = () => {
  if (__DEV__) {
    console.log('[HEARTBEAT] Engine decommissioned. Supabase is native.');
  }
};

export const stopHeartbeat = () => {
  // No-op
};
