import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ 
  connectionString: "postgresql://postgres.oyrwfniokiokbztepzeg:Amsocookd2133@aws-1-eu-central-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log('Connecting to:', (process.env.DIRECT_URL || process.env.DATABASE_URL)?.split('@')[1]);
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Success:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
