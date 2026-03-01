/**
 * Script d'initialisation pour Supabase
 * Crée les tables et les comptes admin
 * 
 * Usage: node backend/seed-supabase.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const ACCOUNTS = [
  {
    matricule: 'drh001',
    nom: 'ANZAN',
    prenoms: 'Admin DRH',
    sexe: 'M',
    direction: 'Direction des Ressources Humaines',
    fonction: 'Directeur RH',
    role: 'ADMIN_DRH',
    password: 'admin123',
    statut: 'actif'
  },
  {
    matricule: 'dev001',
    nom: 'DEVELOPPEUR',
    prenoms: 'Système',
    sexe: 'M',
    direction: "Direction des Systèmes d'Information",
    fonction: 'Développeur',
    role: 'DEV',
    password: 'dev2026',
    statut: 'actif'
  }
];

async function createTables() {
  console.log('📦 Création des tables...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS employes (
      id SERIAL PRIMARY KEY,
      matricule VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(100) NOT NULL,
      prenoms VARCHAR(100) NOT NULL,
      sexe VARCHAR(1) DEFAULT 'M',
      direction VARCHAR(200) NOT NULL,
      fonction VARCHAR(100),
      telephone VARCHAR(20),
      email VARCHAR(100),
      date_embauche DATE,
      photo TEXT,
      statut VARCHAR(50) DEFAULT 'actif',
      jours_conge_annuel INTEGER DEFAULT 30,
      role VARCHAR(20) DEFAULT 'AGENT',
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conges (
      id SERIAL PRIMARY KEY,
      employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
      date_depart DATE NOT NULL,
      date_retour DATE NOT NULL,
      nombre_jours INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      motif TEXT,
      statut VARCHAR(50) DEFAULT 'En attente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Index
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_employes_matricule ON employes(matricule)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_conges_employe_id ON conges(employe_id)`);

  console.log('✅ Tables créées avec succès !');
}

async function createAccounts() {
  console.log('\n👥 Création des comptes...');

  for (const acc of ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(acc.password, 10);

    try {
      await pool.query(
        `INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut, jours_conge_annuel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 30)
         ON CONFLICT (matricule) DO UPDATE SET password = $8
         RETURNING matricule`,
        [acc.matricule, acc.nom, acc.prenoms, acc.sexe, acc.direction, acc.fonction, acc.role, hashedPassword, acc.statut]
      );
      console.log(`  ✅ ${acc.matricule} (${acc.role}) - mot de passe: ${acc.password}`);
    } catch (err) {
      console.error(`  ❌ Erreur pour ${acc.matricule}:`, err.message);
    }
  }
}

async function main() {
  console.log('🚀 Initialisation de la base Supabase...\n');

  try {
    await createTables();
    await createAccounts();

    // Vérification
    const result = await pool.query('SELECT matricule, nom, role FROM employes');
    console.log('\n📋 Comptes dans la base:');
    result.rows.forEach(r => console.log(`  - ${r.matricule} | ${r.nom} | ${r.role}`));

  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await pool.end();
    console.log('\n✨ Terminé !');
  }
}

main();
