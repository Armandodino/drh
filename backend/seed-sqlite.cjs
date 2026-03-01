/**
 * Seed - Créer les comptes admin
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./drh.sqlite');

async function seed() {
  console.log('🌱 Initialisation des données...\n');

  // Créer les tables
  await new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS employes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenoms TEXT NOT NULL,
      sexe TEXT DEFAULT 'M',
      direction TEXT NOT NULL,
      fonction TEXT,
      telephone TEXT,
      email TEXT,
      statut TEXT DEFAULT 'actif',
      jours_conge_annuel INTEGER DEFAULT 30,
      role TEXT DEFAULT 'AGENT',
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => err ? reject(err) : resolve());
  });

  await new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS conges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employe_id INTEGER NOT NULL,
      date_depart TEXT NOT NULL,
      date_retour TEXT NOT NULL,
      nombre_jours INTEGER NOT NULL,
      type TEXT NOT NULL,
      motif TEXT,
      statut TEXT DEFAULT 'En attente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employe_id) REFERENCES employes(id)
    )`, (err) => err ? reject(err) : resolve());
  });

  console.log('✅ Tables créées');

  // Créer les comptes
  const accounts = [
    { matricule: 'drh001', nom: 'ANZAN', prenoms: 'Admin DRH', sexe: 'M', direction: 'Direction des Ressources Humaines', fonction: 'Directeur RH', role: 'ADMIN_DRH', password: 'admin123' },
    { matricule: 'dev001', nom: 'DEVELOPPEUR', prenoms: 'Système', sexe: 'M', direction: "Direction des Systèmes d'Information", fonction: 'Développeur', role: 'DEV', password: 'dev2026' }
  ];

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut, jours_conge_annuel)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'actif', 30)`,
        [acc.matricule, acc.nom, acc.prenoms, acc.sexe, acc.direction, acc.fonction, acc.role, hash],
        (err) => err ? reject(err) : resolve()
      );
    });
    console.log(`✅ Compte créé: ${acc.matricule} (${acc.role}) - mot de passe: ${acc.password}`);
  }

  db.close();
  console.log('\n🎉 Terminé !');
}

seed().catch(console.error);
