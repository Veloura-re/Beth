/**
 * BETH API — Supabase Edition
 * All data flows directly through the Supabase SDK.
 * No backend server, no Render, no cold starts.
 */
import { supabase } from './supabase';

// ─── AUTH ────────────────────────────────────────────────────

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  // Fetch the user's profile for role info
  const profile = await getMyProfile();
  return { user: { ...data.user, ...profile }, session: data.session };
};

export const register = async (name, email, password, inviteToken) => {
  // Validate invite token first
  if (inviteToken) {
    const { data: invite } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', inviteToken)
      .eq('email', email)
      .eq('status', 'PENDING')
      .gt('expires_at', new Date().toISOString())
      .single();
    if (!invite) throw new Error('Invalid or expired invitation');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: invite.role } }
    });
    if (error) throw new Error(error.message);

    // Link profile to org
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      name,
      role: invite.role,
      organization_id: invite.organization_id,
    });

    // Mark invite as accepted
    await supabase.from('invitations').update({ status: 'ACCEPTED' }).eq('token', inviteToken);

    return { user: data.user, session: data.session };
  } else {
    // Open registration (AGENT by default)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'AGENT' } }
    });
    if (error) throw new Error(error.message);
    return { user: data.user, session: data.session };
  }
};

export const logout = async () => {
  await supabase.auth.signOut();
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// ─── PROFILE ─────────────────────────────────────────────────

export const getMyProfile = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, organization:organizations(name)')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getMyPerformance = async () => {
  const { data, error } = await supabase.rpc('get_user_performance');
  if (error) throw new Error(error.message);
  return data;
};

// ─── SCANS ───────────────────────────────────────────────────

export const scanQRCode = async (qrId, lat, lng) => {
  const { data, error } = await supabase.rpc('process_scan', {
    p_qr_id: qrId,
    p_lat: lat || null,
    p_lng: lng || null,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const getScanHistory = async () => {
  const { data, error } = await supabase
    .from('scans')
    .select('*, campaign:campaigns(name), qr:qr_codes(location_name)')
    .order('timestamp', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
};

export const getAllScans = async (organizationId) => {
  let q = supabase
    .from('scans')
    .select('*, campaign:campaigns(name, organization_id), agent:profiles!scans_agent_id_fkey(name)')
    .order('timestamp', { ascending: false })
    .limit(100);
  if (organizationId) q = q.eq('campaigns.organization_id', organizationId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
};

// ─── CAMPAIGNS ───────────────────────────────────────────────

export const getCampaigns = async (organizationId) => {
  let q = supabase.from('campaigns').select('*, qr_codes(count), scans(count)');
  if (organizationId) q = q.eq('organization_id', organizationId);
  const { data, error } = await q.order('created_at', { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createCampaign = async (payload) => {
  const { data, error } = await supabase.from('campaigns').insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateCampaign = async (id, payload) => {
  const { data, error } = await supabase.from('campaigns').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteCampaign = async (id) => {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── QR CODES ────────────────────────────────────────────────

export const getQRCodes = async (organizationId) => {
  let q = supabase.from('qr_codes').select('*, campaign:campaigns(name, organization_id)');
  if (organizationId) {
    q = q.eq('campaigns.organization_id', organizationId);
  }
  const { data, error } = await q.order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createQRCodes = async (payload) => {
  const { campaignId, painterId, locationName, gps, rewardPoints, expirationDate, quantity } = payload;
  const count = Math.min(Math.max(1, quantity || 1), 100);
  const batchId = count > 1 ? crypto.randomUUID() : null;
  const rows = Array.from({ length: count }, () => ({
    campaign_id: campaignId,
    painter_id: painterId || null,
    location_name: locationName || null,
    gps: gps || null,
    batch_id: batchId,
    reward_points: rewardPoints || 10,
    expiration_date: expirationDate || null,
  }));
  const { data, error } = await supabase.from('qr_codes').insert(rows).select();
  if (error) throw new Error(error.message);
  return { count: data.length, batchId, sampleId: data[0]?.id, qrs: data };
};

// ─── USERS / PERSONNEL ───────────────────────────────────────

export const getUsers = async (organizationId) => {
  let q = supabase.from('profiles').select('*, organization:organizations(name)');
  if (organizationId) q = q.eq('organization_id', organizationId);
  const { data, error } = await q.order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
};

// ─── INVITATIONS ─────────────────────────────────────────────

export const getInvitations = async () => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, organization:organizations(name)')
    .order('expires_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createInvitation = async ({ email, role, organizationId, organizationName }) => {
  let orgId = organizationId;
  if (!orgId && organizationName) {
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: organizationName })
      .select()
      .single();
    if (orgErr) throw new Error(orgErr.message);
    orgId = org.id;
  }
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const { data, error } = await supabase
    .from('invitations')
    .insert({ email, role, organization_id: orgId, expires_at: expiresAt.toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// ─── FINANCIAL ───────────────────────────────────────────────

export const requestCashout = async (amount) => {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('cashout_requests')
    .insert({ agent_id: user.user?.id, amount })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getCashoutRequests = async (organizationId) => {
  let q = supabase
    .from('cashout_requests')
    .select('*, agent:profiles!cashout_requests_agent_id_fkey(name, email, organization_id)')
    .order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  if (organizationId) return (data ?? []).filter(r => r.agent?.organization_id === organizationId);
  return data ?? [];
};

export const updateCashoutStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('cashout_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// ─── ORGANIZATIONS ───────────────────────────────────────────

export const getOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*, profiles(count), campaigns(count)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createOrganization = async (name) => {
  const { data, error } = await supabase.from('organizations').insert({ name }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateOrganization = async (id, payload) => {
  const { data, error } = await supabase.from('organizations').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteOrganization = async (id) => {
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── ANALYTICS ───────────────────────────────────────────────

export const getAnalyticsOverview = async (organizationId) => {
  const { data, error } = await supabase.rpc('get_analytics_overview', {
    p_organization_id: organizationId || null
  });
  if (error) throw new Error(error.message);
  return data;
};

export const getPlatformCensus = async () => {
  const [{ count: totalOrgs }, { count: totalAdmins }, { count: totalAgents }, { count: totalScans }] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'ADMIN'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'AGENT'),
    supabase.from('scans').select('*', { count: 'exact', head: true }),
  ]);
  return { totalOrgs, totalAdmins, totalAgents, totalScans };
};

// ─── LEGACY COMPAT (for any screen still calling apiFetch) ───
export const apiFetch = async (endpoint) => {
  console.warn(`[COMPAT] apiFetch called for ${endpoint} — migrate to direct Supabase call`);
  throw new Error(`apiFetch is deprecated. Endpoint: ${endpoint}`);
};

export const API_BASE_URL = 'https://jwfdxhblkmbmdetifxlj.supabase.co';
