/**
 * SERVEUR DRH YOPOUGON - VERSION POSTGRESQL/SUPABASE
 * Compatible avec Render + Supabase
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

// Choisir la base de données selon l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const db = isProduction 
  ? require('./database-supabase') 
  : require('./database');

// Initialisation de l'application Express
const app = express();

// Middlewares globaux
app.use(express.json());
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : '*',
  credentials: true
}));

// Clé secrète JWT
const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

// ==========================================
// 1. MIDDLEWARE DE SÉCURITÉ (Vérifie le Token)
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Accès refusé. Token manquant." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Session expirée ou token invalide." });
    req.user = user;
    next();
  });
};

// ==========================================
// 2. ROUTE DE CONNEXION (DEV & ADMIN)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { matricule, password } = req.body;

  try {
    const user = await db.get('SELECT * FROM employes WHERE matricule = $1', [matricule.toLowerCase()]);
    
    if (!user) {
      return res.status(401).json({ message: "Identifiant introuvable" });
    }

    // Vérification du mot de passe haché
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Sécurité : Seuls DEV et ADMIN_DRH peuvent se connecter
    if (user.role !== 'DEV' && user.role !== 'ADMIN_DRH') {
      return res.status(403).json({ message: "Vous n'avez pas les droits d'administration." });
    }

    // Génération du Token
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
        role: user.role,
        mustChange: user.statut === 'must_change'
      }
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ==========================================
// 3. ROUTES MÉTIERS (Protégées)
// ==========================================

// Récupérer la liste des agents
app.get('/api/agents', authenticateToken, async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT id, matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role FROM employes'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer la liste des congés
app.get('/api/conges', authenticateToken, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM conges');
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un nouvel agent
app.post('/api/agents', authenticateToken, async (req, res) => {
  const { matricule, nom, prenoms, sexe, direction, fonction, telephone, email } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [matricule, nom, prenoms, sexe || 'M', direction, fonction, telephone || '', email || '', 'Actif', 30, 'AGENT']
    );
    res.json({ id: result.lastID, message: "Agent ajouté avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un nouveau congé
app.post('/api/conges', authenticateToken, async (req, res) => {
  const { employe_id, date_depart, date_retour, type, motif, nombre_jours } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO conges (employe_id, date_depart, date_retour, nombre_jours, type, statut, motif) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [employe_id, date_depart, date_retour, nombre_jours || 0, type, 'En attente', motif || '']
    );
    res.json({ id: result.lastID, message: "Congé ajouté avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour le statut d'un congé
app.put('/api/conges/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  try {
    await db.run('UPDATE conges SET statut = $1 WHERE id = $2', [statut, id]);
    res.json({ message: "Statut mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. SERVIR LE FRONTEND EN PRODUCTION
// ==========================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Toutes les routes non-API renvoient vers index.html (SPA)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ==========================================
// 5. DÉMARRAGE DU SERVEUR
// ==========================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur DRH-YOP démarré sur http://localhost:${PORT}`);
  console.log(`📦 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Base de données: ${isProduction ? 'PostgreSQL (Supabase)' : 'SQLite'}`);
});

server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
});
