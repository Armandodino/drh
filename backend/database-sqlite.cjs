const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./drh.sqlite');

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
)`);

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
)`);

console.log('✅ SQLite prêt');

module.exports = {
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  }),
  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  }),
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  })
};
