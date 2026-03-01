/**
 * Configuration PostgreSQL - Supabase
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4,
  connectionTimeoutMillis: 10000,
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté !'))
  .catch(err => console.error('❌ Erreur DB:', err.message));

// Convertir ? en $1, $2, etc.
const convertParams = (sql, params) => {
  let index = 0;
  let pgSql = sql.replace(/\?/g, () => `$${++index}`);
  return pgSql;
};

const db = {
  run: (sql, params = []) => {
    return pool.query(convertParams(sql, params), params)
      .then(r => ({ lastID: r.rows[0]?.id || r.rowCount, changes: r.rowCount }));
  },
  get: (sql, params = []) => {
    return pool.query(convertParams(sql, params), params)
      .then(r => r.rows[0] || null);
  },
  all: (sql, params = []) => {
    return pool.query(convertParams(sql, params), params)
      .then(r => r.rows);
  },
  close: () => pool.end()
};

module.exports = db;
