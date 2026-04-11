const { Client } = require('pg');

async function testConnection() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const cleanUrl = rawUrl.split('?')[0]; 
  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to DB');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

testConnection();
