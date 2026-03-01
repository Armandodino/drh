const sqlite3 = require('sqlite3').verbose();

// Connexion à la base SQLite
const db = new sqlite3.Database('./mairie_yopougon.sqlite', (err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base :", err.message);
  } else {
    console.log("✅ Base de données DRH Mairie Yopougon connectée avec succès !");
  }
});

// Activer les clés étrangères
db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {
 // Remplace la création de la table employes par ceci :
  db.run(`CREATE TABLE IF NOT EXISTS employes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenoms TEXT NOT NULL,
    sexe TEXT,
    direction TEXT NOT NULL,
    fonction TEXT,
    telephone TEXT,
    email TEXT,
    date_embauche TEXT,
    photo TEXT,
    statut TEXT DEFAULT 'actif',
    jours_conge_annuel INTEGER DEFAULT 30,
    role TEXT DEFAULT 'AGENT',      /* <-- NOUVEAU : Rôle de l'utilisateur */
    password TEXT,                  /* <-- NOUVEAU : Mot de passe haché */
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
     () => console.log("✅ Table 'employes' prête"));

  // === TABLE CONGÉS (CORRIGÉE ET COMPLÈTE pour matcher server.js + frontend) ===
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
    FOREIGN KEY(employe_id) REFERENCES employes(id) ON DELETE CASCADE
  )`, () => console.log("✅ Table 'conges' prête et complète"));
});

module.exports = db;