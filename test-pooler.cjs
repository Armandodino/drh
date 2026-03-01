const { Pool } = require('pg');

// Tester différents formats de pooler Supabase
const urls = [
  // Session pooler - Eu Central
  'postgres://postgres.grhcyxzkaidvfgxbynok:Moutonblanc98%40@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  // Transaction pooler  
  'postgres://postgres.grhcyxzkaidvfgxbynok:Moutonblanc98%40@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
];

async function test() {
  for (const url of urls) {
    console.log('\n🔍 Test:', url.split('@')[1]?.split('/')[0] || url);
    try {
      const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
      });
      const client = await pool.connect();
      console.log('✅ CONNEXION RÉUSSIE !');
      const result = await client.query('SELECT 1 as test');
      console.log('📊 Query result:', result.rows[0]);
      client.release();
      await pool.end();
      console.log('\n🎯 URL CORRECTE:', url);
      return;
    } catch (err) {
      console.log('❌ Échec:', err.message);
    }
  }
}

test();
