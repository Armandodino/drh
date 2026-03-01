/**
 * SERVEUR DRH YOPOUGON - Version SQLite
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Initialiser SQLite
const db = new sqlite3.Database('./drh.sqlite');

// Créer les tables
db.serialize(() => {
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
});

// Créer les comptes admin au démarrage
async function initAdmins() {
  const accounts = [
    { matricule: 'drh001', nom: 'ANZAN', prenoms: 'Admin DRH', sexe: 'M', direction: 'Direction des Ressources Humaines', fonction: 'Directeur RH', role: 'ADMIN_DRH', password: 'admin123' },
    { matricule: 'dev001', nom: 'DEVELOPPEUR', prenoms: 'Système', sexe: 'M', direction: "Direction des Systèmes d'Information", fonction: 'Développeur', role: 'DEV', password: 'dev2026' }
  ];

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);
    db.run(
      `INSERT OR IGNORE INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut, jours_conge_annuel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'actif', 30)`,
      [acc.matricule, acc.nom, acc.prenoms, acc.sexe, acc.direction, acc.fonction, acc.role, hash]
    );
  }
  console.log('✅ Comptes admin créés');
}

initAdmins();

// Helpers DB
const dbQuery = {
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  }),
  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row || null));
  }),
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
  })
};

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
};

// Login
app.post('/api/login', async (req, res) => {
  const { matricule, password } = req.body;
  console.log('🔐 Tentative connexion:', matricule);

  try {
    const user = await dbQuery.get('SELECT * FROM employes WHERE matricule = ?', [matricule.toLowerCase()]);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(401).json({ message: "Identifiant introuvable" });
    }

    if (!user.password) {
      console.log('❌ Pas de mot de passe');
      return res.status(401).json({ message: "Compte non configuré" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    if (user.role !== 'DEV' && user.role !== 'ADMIN_DRH') {
      console.log('❌ Droits insuffisants');
      return res.status(403).json({ message: "Droits insuffisants" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    console.log('✅ Connexion réussie:', user.nom);
    res.json({
      token,
      user: { nom: user.nom, prenoms: user.prenoms, role: user.role }
    });
  } catch (err) {
    console.error('❌ Erreur:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Agents
app.get('/api/agents', authenticateToken, async (req, res) => {
  try {
    const rows = await dbQuery.all('SELECT id, matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role FROM employes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Congés
app.get('/api/conges', authenticateToken, async (req, res) => {
  try {
    const rows = await dbQuery.all('SELECT * FROM conges');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter agent
app.post('/api/agents', authenticateToken, async (req, res) => {
  const { matricule, nom, prenoms, sexe, direction, fonction, telephone, email } = req.body;
  try {
    const result = await dbQuery.run(
      `INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matricule, nom, prenoms, sexe || 'M', direction, fonction, telephone || '', email || '', 'Actif', 30, 'AGENT']
    );
    res.json({ id: result.lastID, message: "Agent ajouté" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter congé
app.post('/api/conges', authenticateToken, async (req, res) => {
  const { employe_id, date_depart, date_retour, type, motif, nombre_jours } = req.body;
  try {
    const result = await dbQuery.run(
      `INSERT INTO conges (employe_id, date_depart, date_retour, nombre_jours, type, statut, motif) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employe_id, date_depart, date_retour, nombre_jours || 0, type, 'En attente', motif || '']
    );
    res.json({ id: result.lastID, message: "Congé ajouté" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier congé
app.put('/api/conges/:id', authenticateToken, async (req, res) => {
  try {
    await dbQuery.run('UPDATE conges SET statut = ? WHERE id = ?', [req.body.statut, req.params.id]);
    res.json({ message: "Statut mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Servir le frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur DRH-YOP sur http://localhost:${PORT}`);
  console.log(`📦 Base: SQLite`);
  console.log(`🔐 Comptes: drh001/admin123, dev001/dev2026`);
});
