/**
 * BETH API — Supabase Edition
 * All data flows directly through the Supabase SDK.
 * No backend server, no Render, no cold starts.
 */
import { supabase } from './supabase';

// ─── TYPES ───────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'AGENT';
  organizationId?: string;
  createdAt: string;
  organization?: { name: string };
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  profilesCount?: number;
  campaignsCount?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  budget: number;
  rewardPerScan: number;
  painterMargin: number;
  organizationId: string;
  createdAt: string;
  qrCodesCount?: number;
  scansCount?: number;
}

export interface Scan {
  id: string;
  timestamp: string;
  campaignId: string;
  agentId: string;
  qrId: string;
  lat?: number;
  lng?: number;
  pointsEarned: number;
  campaign?: { name: string; organizationId: string };
  qr?: { location_name: string };
  agent?: { name: string };
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  organization?: { name: string };
}

export interface CashoutRequest {
  id: string;
  agentId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  createdAt: string;
  agent?: { name: string; email: string; organizationId: string };
}

// ─── AUTH ────────────────────────────────────────────────────

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  // Fetch the user's profile for role info
  const profile = await getMyProfile();
  return { user: { ...data.user, ...profile }, session: data.session };
};

export const register = async (name: string, email: string, password: string, inviteToken?: string | null) => {
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
    if (!data.user) throw new Error('Failed to create user');

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

export const getMyProfile = async (): Promise<Profile> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*, organization:organizations(name)')
    .eq('id', userData.user.id)
    .single();
  if (error) throw new Error(error.message);
  
  return {
    ...data,
    organizationId: data.organization_id,
    createdAt: data.created_at
  };
};

export const getMyPerformance = async () => {
  const { data, error } = await supabase.rpc('get_user_performance');
  if (error) throw new Error(error.message);
  return data;
};

// ─── SCANS ───────────────────────────────────────────────────

export const scanQRCode = async (qrId: string, lat?: number, lng?: number) => {
  const { data, error } = await supabase.rpc('process_scan', {
    p_qr_id: qrId,
    p_lat: lat || null,
    p_lng: lng || null,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const getScanHistory = async (): Promise<Scan[]> => {
  const { data, error } = await supabase
    .from('scans')
    .select('*, campaign:campaigns(name), qr:qr_codes(location_name)')
    .order('timestamp', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data || []).map((s: any) => ({
    ...s,
    campaignId: s.campaign_id,
    agentId: s.agent_id,
    qrId: s.qr_id,
    pointsEarned: s.points_earned
  }));
};

export const getAllScans = async (organizationId?: string | null): Promise<Scan[]> => {
  let q = supabase
    .from('scans')
    .select('*, campaign:campaigns(name, organization_id), agent:profiles!scans_agent_id_fkey(name)')
    .order('timestamp', { ascending: false })
    .limit(100);
  if (organizationId) q = q.eq('campaigns.organization_id', organizationId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((s: any) => ({
    ...s,
    campaignId: s.campaign_id,
    agentId: s.agent_id,
    qrId: s.qr_id,
    pointsEarned: s.points_earned,
    campaign: s.campaign ? {
      name: s.campaign.name,
      organizationId: s.campaign.organization_id
    } : undefined
  }));
};

// ─── CAMPAIGNS ───────────────────────────────────────────────

export const getCampaigns = async (organizationId?: string | null): Promise<Campaign[]> => {
  let q = supabase.from('campaigns').select('*, qr_codes(count), scans(count)');
  if (organizationId) q = q.eq('organization_id', organizationId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c: any) => ({
    ...c,
    rewardPerScan: c.reward_per_scan,
    painterMargin: c.painter_margin,
    organizationId: c.organization_id,
    createdAt: c.created_at,
    qrCodesCount: c.qr_codes?.[0]?.count,
    scansCount: c.scans?.[0]?.count
  }));
};

export const createCampaign = async (payload: Partial<Campaign>) => {
  const dbPayload = {
    ...payload,
    reward_per_scan: payload.rewardPerScan,
    painter_margin: payload.painterMargin,
    organization_id: payload.organizationId,
  };
  delete (dbPayload as any).rewardPerScan;
  delete (dbPayload as any).painterMargin;
  delete (dbPayload as any).organizationId;

  const { data, error } = await supabase.from('campaigns').insert(dbPayload).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateCampaign = async (id: string, payload: Partial<Campaign>) => {
  const dbPayload = {
    ...payload,
    reward_per_scan: payload.rewardPerScan,
    painter_margin: payload.painterMargin,
    organization_id: payload.organizationId,
  };
  delete (dbPayload as any).rewardPerScan;
  delete (dbPayload as any).painterMargin;
  delete (dbPayload as any).organizationId;

  const { data, error } = await supabase.from('campaigns').update(dbPayload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteCampaign = async (id: string) => {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── QR CODES ────────────────────────────────────────────────

export const getQRCodes = async (organizationId?: string | null) => {
  let q = supabase.from('qr_codes').select('*, campaign:campaigns(name, organization_id)');
  if (organizationId) {
    q = q.eq('campaigns.organization_id', organizationId);
  }
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((qr: any) => ({
    ...qr,
    createdAt: qr.created_at,
    campaign: qr.campaign ? {
      name: qr.campaign.name,
      organizationId: qr.campaign.organization_id
    } : undefined
  }));
};

export const createQRCodes = async (payload: {
  campaignId: string;
  painterId?: string;
  locationName?: string;
  gps?: string;
  rewardPoints?: number;
  expirationDate?: string;
  quantity?: number;
}) => {
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

export const getUsers = async (organizationId?: string | null): Promise<Profile[]> => {
  let q = supabase.from('profiles').select('*, organization:organizations(name)');
  if (organizationId) q = q.eq('organization_id', organizationId);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p: any) => ({
    ...p,
    organizationId: p.organization_id,
    createdAt: p.created_at
  }));
};

// ─── INVITATIONS ─────────────────────────────────────────────

export const getInvitations = async (): Promise<Invitation[]> => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, organization:organizations(name)')
    .order('expires_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((i: any) => ({
    ...i,
    organizationId: i.organization_id,
    expiresAt: i.expires_at,
    createdAt: i.created_at
  }));
};

export const createInvitation = async ({ email, role, organizationId, organizationName }: {
  email: string;
  role: string;
  organizationId?: string | null;
  organizationName?: string | null;
}) => {
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
  const inviteLink = `${window.location.origin}/invite?token=${data.token}&email=${encodeURIComponent(email)}`;
  return { 
    ...data, 
    inviteLink,
    organizationId: data.organization_id,
    expiresAt: data.expires_at,
    createdAt: data.created_at
  };
};

// ─── FINANCIAL ───────────────────────────────────────────────

export const requestCashout = async (amount: number) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('cashout_requests')
    .insert({ agent_id: userData.user.id, amount })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getCashoutRequests = async (organizationId?: string | null): Promise<CashoutRequest[]> => {
  let q = supabase
    .from('cashout_requests')
    .select('*, agent:profiles!cashout_requests_agent_id_fkey(name, email, organization_id)')
    .order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  
  const mapped = (data ?? []).map((r: any) => ({
    ...r,
    agentId: r.agent_id,
    createdAt: r.created_at,
    agent: r.agent ? {
      ...r.agent,
      organizationId: r.agent.organization_id
    } : undefined
  }));

  if (organizationId) return mapped.filter((r: any) => r.agent?.organizationId === organizationId);
  return mapped;
};

export const updateCashoutStatus = async (id: string, status: string) => {
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

export const getOrganizations = async (): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*, profiles(count), campaigns(count)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((o: any) => ({
    ...o,
    createdAt: o.created_at,
    profilesCount: o.profiles?.[0]?.count,
    campaignsCount: o.campaigns?.[0]?.count
  }));
};

export const createOrganization = async (name: string) => {
  const { data, error } = await supabase.from('organizations').insert({ name }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateOrganization = async (id: string, payload: Partial<Organization>) => {
  const { data, error } = await supabase.from('organizations').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteOrganization = async (id: string) => {
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── ANALYTICS ───────────────────────────────────────────────

export const getAnalyticsOverview = async (organizationId?: string | null) => {
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

export interface DailyScanData {
  name: string;
  scans: number;
}

export const getDailyScans = async (): Promise<DailyScanData[]> => {
  const { data, error } = await supabase.from('scans').select('timestamp').order('timestamp', { ascending: false });
  if (error) throw new Error(error.message);
  const daily: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    daily[d.toLocaleDateString()] = 0;
  }
  (data || []).forEach(s => {
    const d = new Date(s.timestamp).toLocaleDateString();
    if (daily[d] !== undefined) daily[d]++;
  });
  return Object.entries(daily).map(([name, scans]) => ({ name, scans }));
};

// ─── LEGACY COMPAT (for any screen still calling apiFetch) ───
export const apiFetch = async (endpoint: string) => {
  console.warn(`[COMPAT] apiFetch called for ${endpoint} — migrate to direct Supabase call`);
  throw new Error(`apiFetch is deprecated. Endpoint: ${endpoint}`);
};

export const API_BASE_URL = 'https://jwfdxhblkmbmdetifxlj.supabase.co';
