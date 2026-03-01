require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./database'); // Connexion à ta base SQLite

// Initialisation de l'application Express
const app = express();

// Middlewares globaux
app.use(express.json());
app.use(cors());

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
// 2. ROUTE DE CONNEXION EXCLUSIVE (DEV & ADMIN)
// ==========================================
app.post('/api/login', (req, res) => {
  const { matricule, password } = req.body;

  // On cherche l'utilisateur (armando ou hermine)
  db.get('SELECT * FROM employes WHERE matricule = ?', [matricule.toLowerCase()], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Identifiant introuvable" });
    }

    // Vérification du mot de passe haché
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Sécurité supplémentaire : Seuls DEV et ADMIN_DRH peuvent se connecter
    if (user.role !== 'DEV' && user.role !== 'ADMIN_DRH') {
      return res.status(403).json({ message: "Vous n'avez pas les droits d'administration." });
    }

    // Génération du Token
    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: '12h' } // Le token expire après 12 heures
    );

    // Réponse au frontend
    res.json({
      token,
      user: {
        nom: user.nom,
        prenoms: user.prenoms,
        role: user.role,
        mustChange: user.statut === 'must_change' // Pour forcer Hermine à changer son MDP plus tard
      }
    });
  });
});


// ==========================================
// 3. ROUTES MÉTIERS (Protégées par le Token)
// ==========================================

// Récupérer la liste des agents
app.get('/api/agents', authenticateToken, (req, res) => {
  // On ne renvoie pas les mots de passe au frontend !
  db.all('SELECT id, matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role FROM employes', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Récupérer la liste des congés
app.get('/api/conges', authenticateToken, (req, res) => {
  db.all('SELECT * FROM conges', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});


// ==========================================
// Ajouter un nouvel agent
app.post('/api/agents', authenticateToken, (req, res) => {
  const { matricule, nom, prenoms, sexe, direction, fonction, telephone, email } = req.body;

  const sql = `INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, statut, jours_conge_annuel, role) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Par défaut : Actif, 30 jours, rôle Agent
  const values = [
    matricule, nom, prenoms, sexe || 'M', direction, fonction,
    telephone || '', email || '', 'Actif', 30, 'AGENT'
  ];

  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: "Agent ajouté avec succès" });
  });
});

// Ajouter un nouveau congé
app.post('/api/conges', authenticateToken, (req, res) => {
  const { employe_id, date_depart, date_retour, type, motif, nombre_jours } = req.body;

  const sql = `INSERT INTO conges (employe_id, date_depart, date_retour, nombre_jours, type, statut, motif) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  // Dans SQLite, les dates doivent de préférence être au format YYYY-MM-DD
  db.run(sql, [employe_id, date_depart, date_retour, nombre_jours || 0, type, 'En attente', motif || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // On renvoie un succès avec un identifiant
    res.json({ id: this.lastID, message: "Congé ajouté avec succès" });
  });
});

// Mettre à jour le statut d'un congé (Approuver/Refuser)
app.put('/api/conges/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  db.run('UPDATE conges SET statut = ? WHERE id = ?', [statut, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Statut mis à jour avec succès" });
  });
});
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur DRH-YOP sécurisé démarré sur http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
});

// Force le processus à rester en vie
setInterval(() => { }, 1000 * 60 * 60); 
