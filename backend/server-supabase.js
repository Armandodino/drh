/**
 * SERVEUR DRH YOPOUGON - VERSION POSTGRESQL/SUPABASE
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const db = isProduction
  ? require('./database-supabase')
  : require('./database');

const app = express();

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

// Middleware auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
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
    // Utiliser ? qui sera converti en $1 par database-supabase.js
    const user = await db.get('SELECT * FROM employes WHERE matricule = ?', [matricule.toLowerCase()]);

    if (!user) {
      return res.status(401).json({ message: "Identifiant introuvable" });
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
      user: {
        nom: user.nom,
        prenoms: user.prenoms,
        role: user.role
      }
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
      `INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `INSERT INTO conges (employe_id, date_depart, date_retour, nombre_jours, type, statut, motif)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employe_id, date_depart, date_retour, nombre_jours || 0, type, 'En attente', motif || '']
    );
    res.json({ id: result.lastID, message: "Congé ajouté" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier statut congé
app.put('/api/conges/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    await db.run('UPDATE conges SET statut = ? WHERE id = ?', [statut, id]);
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
  console.log(`📦 Mode: ${isProduction ? 'Production (PostgreSQL)' : 'Développement (SQLite)'}`);
});
