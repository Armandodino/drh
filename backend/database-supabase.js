/**
 * Configuration PostgreSQL - Supabase
 * Remplace la configuration SQLite pour la production
 */

const { Pool } = require('pg');
const dns = require('dns');

// Forcer IPv4 pour éviter les problèmes de connexion IPv6
dns.setDefaultResultOrder('ipv4first');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Forcer IPv4
  family: 4,
  // Timeouts
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
});

// Gestion des erreurs de connexion
pool.on('error', (err) => {
  console.error('❌ Erreur inattendue du pool PostgreSQL:', err.message);
});

// Test de connexion avec retry
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ Base de données PostgreSQL (Supabase) connectée avec succès !');
      client.release();
      return true;
    } catch (err) {
      console.error(`❌ Tentative ${i + 1}/${retries} - Erreur de connexion:`, err.message);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
};

testConnection();

// Wrapper pour les requêtes style SQLite
const db = {
  // Exécute une requête sans résultat
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      // Convertir les ? en $1, $2, etc. pour PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }

      pool.query(pgSql, params)
        .then(result => {
          resolve({ lastID: result.rows[0]?.id || result.rowCount, changes: result.rowCount });
        })
        .catch(reject);
    });
  },

  // Récupère une seule ligne
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }

      pool.query(pgSql, params)
        .then(result => resolve(result.rows[0] || null))
        .catch(reject);
    });
  },

  // Récupère toutes les lignes
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }

      pool.query(pgSql, params)
        .then(result => resolve(result.rows))
        .catch(reject);
    });
  },

  // Ferme la connexion
  close: () => pool.end()
};

module.exports = db;
