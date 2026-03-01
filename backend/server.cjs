/**
 * SERVEUR DRH YOPOUGON - Version hybride
 * Utilise PostgreSQL si disponible, SQLite sinon
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Choisir la base de données
let db;
let usingPostgres = false;

if (process.env.DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      family: 4
    });

    const convertParams = (sql, params) => {
      let index = 0;
      return sql.replace(/\?/g, () => `$${++index}`);
    };

    db = {
      run: (sql, params = []) => pool.query(convertParams(sql, params), params).then(r => ({ lastID: r.rows[0]?.id || r.rowCount, changes: r.rowCount })),
      get: (sql, params = []) => pool.query(convertParams(sql, params), params).then(r => r.rows[0] || null),
      all: (sql, params = []) => pool.query(convertParams(sql, params), params).then(r => r.rows)
    };

    pool.connect().then(() => {
      console.log('✅ PostgreSQL connecté !');
      usingPostgres = true;
    }).catch(err => {
      console.log('⚠️ PostgreSQL indisponible, utilisation de SQLite');
      db = require('./database-sqlite.cjs');
    });
  } catch (e) {
    console.log('⚠️ Module pg non disponible, utilisation de SQLite');
    db = require('./database-sqlite.cjs');
  }
} else {
  console.log('📦 Utilisation de SQLite (pas de DATABASE_URL)');
  db = require('./database-sqlite.cjs');
}

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

  try {
    const user = await db.get('SELECT * FROM employes WHERE matricule = ?', [matricule.toLowerCase()]);

    if (!user) {
      return res.status(401).json({ message: "Identifiant introuvable" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Compte non configuré" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    if (user.role !== 'DEV' && user.role !== 'ADMIN_DRH') {
      return res.status(403).json({ message: "Droits insuffisants" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: { nom: user.nom, prenoms: user.prenoms, role: user.role }
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Agents
app.get('/api/agents', authenticateToken, async (req, res) => {
  try {
    const rows = await db.all('SELECT id, matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role FROM employes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Congés
app.get('/api/conges', authenticateToken, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM conges');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter agent
app.post('/api/agents', authenticateToken, async (req, res) => {
  const { matricule, nom, prenoms, sexe, direction, fonction, telephone, email } = req.body;
  try {
    const result = await db.run(
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
    const result = await db.run(
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
    await db.run('UPDATE conges SET statut = ? WHERE id = ?', [req.body.statut, req.params.id]);
    res.json({ message: "Statut mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur DRH-YOP sur http://localhost:${PORT}`);
});
