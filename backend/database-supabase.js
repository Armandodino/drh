/**
 * Configuration PostgreSQL - Supabase
 * Remplace la configuration SQLite pour la production
 */

const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
pool.connect()
  .then(() => console.log('✅ Base de données PostgreSQL (Supabase) connectée avec succès !'))
  .catch(err => console.error('❌ Erreur de connexion PostgreSQL:', err.message));

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
