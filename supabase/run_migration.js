#!/usr/bin/env node
// Run the SQL migration against the Supabase project
// Usage: node run_migration.js

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://jwfdxhblkmbmdetifxlj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZmR4aGJsa21ibWRldGlmeGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg2MDAyMiwiZXhwIjoyMDkyNDM2MDIyfQ.f0Os_2CT8_vUHimWu2wY9jO2qwGrpl4qr70UZJqtPew';

const sql = fs.readFileSync('./supabase/migration.sql', 'utf8');

// Split into individual statements and run each
const statements = sql
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function runSql(query) {
  const body = JSON.stringify({ query: query + ';' });
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Running Beth SQL migration...');
  const result = await runSql(sql);
  if (result.status >= 400) {
    console.error('Migration failed:', result.body);
  } else {
    console.log('Migration complete!');
  }
}

main().catch(console.error);
