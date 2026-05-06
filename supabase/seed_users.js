#!/usr/bin/env node
// Creates existing Beth users in Supabase Auth + profiles
// Option B: migrate existing super@beth.com, admin@beth.com, agent@beth.com

const https = require('https');

const SUPABASE_URL = 'https://jwfdxhblkmbmdetifxlj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZmR4aGJsa21ibWRldGlmeGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg2MDAyMiwiZXhwIjoyMDkyNDM2MDIyfQ.f0Os_2CT8_vUHimWu2wY9jO2qwGrpl4qr70UZJqtPew';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 1. Create a shared organization for super admin
  console.log('\n--- Creating HQ Organization ---');
  const orgRes = await request('POST', '/rest/v1/organizations', {
    name: 'Beth HQ'
  });
  // If 409 (already exists), ignore - fetch it
  let orgId;
  if (orgRes.status === 201) {
    // Get the org we just created
    const orgsRes = await request('GET', '/rest/v1/organizations?name=eq.Beth+HQ&select=id', null);
    orgId = orgsRes.body[0]?.id;
    console.log('Created org:', orgId);
  } else {
    const orgsRes = await request('GET', '/rest/v1/organizations?name=eq.Beth+HQ&select=id', null);
    orgId = orgsRes.body[0]?.id;
    console.log('Using existing org:', orgId);
  }

  const users = [
    { email: 'super@beth.com', password: 'SuperPass123', name: 'Super Admin', role: 'SUPERADMIN', organization_id: orgId },
    { email: 'admin@beth.com', password: 'AdminPass123', name: 'Admin User', role: 'ADMIN', organization_id: orgId },
    { email: 'agent@beth.com', password: 'AgentPass123', name: 'Field Agent', role: 'AGENT', organization_id: orgId },
  ];

  for (const u of users) {
    console.log(`\n--- Creating ${u.email} ---`);
    
    // Create auth user
    const authRes = await request('POST', '/auth/v1/admin/users', {
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role }
    });

    if (authRes.status === 422 && authRes.body.msg?.includes('already')) {
      console.log(`  Auth user already exists, looking up...`);
      // Get existing user
      const listRes = await request('GET', `/auth/v1/admin/users?page=1&per_page=100`, null);
      const existing = listRes.body.users?.find(u2 => u2.email === u.email);
      if (existing) {
        authRes.body = existing;
        authRes.status = 200;
      }
    }

    const userId = authRes.body.id || authRes.body.user?.id;
    if (!userId) {
      console.error(`  Failed to get user ID:`, JSON.stringify(authRes.body));
      continue;
    }
    console.log(`  Auth user ID: ${userId}`);

    // Upsert profile
    const profileRes = await request('POST', '/rest/v1/profiles', {
      id: userId,
      email: u.email,
      name: u.name,
      role: u.role,
      organization_id: u.organization_id
    });
    
    if (profileRes.status === 201 || profileRes.status === 200) {
      console.log(`  Profile created ✓`);
    } else {
      // Try update if already exists
      const upsertRes = await request('PATCH', `/rest/v1/profiles?id=eq.${userId}`, {
        name: u.name,
        role: u.role,
        organization_id: u.organization_id
      });
      console.log(`  Profile upserted (${upsertRes.status}) ✓`);
    }
  }

  console.log('\n✅ All users created. Credentials:');
  console.log('  super@beth.com / SuperPass123 (SUPERADMIN)');
  console.log('  admin@beth.com / AdminPass123 (ADMIN)');
  console.log('  agent@beth.com / AgentPass123 (AGENT)');
}

main().catch(console.error);
