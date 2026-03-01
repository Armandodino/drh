/**
 * SERVEUR DRH YOPOUGON - PostgreSQL (Supabase Pooler)
 * Gestion avancée des congés avec calcul automatique
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const { Pool } = require('pg');

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté !'))
  .catch(err => console.error('❌ Erreur DB:', err.message));

// SQL helper
const sql = (query, params = []) => {
  let i = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++i}`);
  return pool.query(pgQuery, params);
};

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Non autorisé" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Session expirée" });
    req.user = user;
    next();
  });
};

// ============ LOGIN ============
app.post('/api/login', async (req, res) => {
  const { matricule, password } = req.body;
  console.log('🔐 Connexion:', matricule);

  try {
    const { rows } = await sql('SELECT * FROM employes WHERE LOWER(matricule) = LOWER(?)', [matricule]);
    const user = rows[0];

    if (!user) return res.status(401).json({ message: "Matricule introuvable" });
    if (!user.password) return res.status(401).json({ message: "Compte non configuré" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Mot de passe incorrect" });

    if (!['DEV', 'ADMIN_DRH'].includes(user.role)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, nom: user.nom }, JWT_SECRET, { expiresIn: '12h' });
    console.log('✅ Connecté:', user.nom);

    res.json({
      token,
      user: { id: user.id, nom: user.nom, prenoms: user.prenoms, role: user.role }
    });
  } catch (err) {
    console.error('❌ Erreur login:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ============ CALCUL CONGÉS ============
app.get('/api/employes/:id/solde', auth, async (req, res) => {
  try {
    const { rows } = await sql('SELECT * FROM employes WHERE id = ?', [req.params.id]);
    const emp = rows[0];
    if (!emp) return res.status(404).json({ error: "Employé non trouvé" });

    // Calcul
    let joursAcquis = 0;
    let anneesAnciennete = 0;
    
    if (emp.date_embauche) {
      const embauche = new Date(emp.date_embauche);
      const today = new Date();
      anneesAnciennete = Math.floor((today - embauche) / (365.25 * 24 * 60 * 60 * 1000));
      joursAcquis = anneesAnciennete * 30;
    }

    // Jours pris dans le système
    const { rows: congesRows } = await sql(
      'SELECT COALESCE(SUM(nombre_jours), 0) as total FROM conges WHERE employe_id = ? AND statut = ?',
      [req.params.id, 'Approuvé']
    );
    const joursPrisSysteme = parseInt(congesRows[0]?.total || 0);
    const joursPrisHistorique = emp.jours_pris_historique || 0;
    const solde = Math.max(0, joursAcquis - joursPrisSysteme - joursPrisHistorique);

    res.json({
      date_embauche: emp.date_embauche,
      annees_anciennete: anneesAnciennete,
      jours_acquis: joursAcquis,
      jours_pris_systeme: joursPrisSysteme,
      jours_pris_historique: joursPrisHistorique,
      jours_pris_total: joursPrisSysteme + joursPrisHistorique,
      solde_restant: solde
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ============ AGENTS ============
app.get('/api/agents', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT 
        e.id, e.matricule, e.nom, e.prenoms, e.sexe, e.direction, e.fonction, 
        e.telephone, e.email, e.statut, e.role, e.date_embauche,
        e.jours_pris_historique, e.photo_url
      FROM employes e
      ORDER BY e.nom, e.prenoms
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un agent avec date d'embauche
app.post('/api/agents', auth, async (req, res) => {
  const { matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, jours_pris_historique } = req.body;
  
  try {
    const { rows } = await sql(`
      INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, jours_pris_historique, statut, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Actif', 'AGENT')
      RETURNING id
    `, [matricule?.toLowerCase(), nom, prenoms, sexe || 'M', direction, fonction, telephone || '', email || '', date_embauche || null, jours_pris_historique || 0]);

    res.json({ id: rows[0].id, message: "Agent ajouté avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Modifier un agent
app.put('/api/agents/:id', auth, async (req, res) => {
  const { nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, jours_pris_historique, statut } = req.body;
  
  try {
    await sql(`
      UPDATE employes 
      SET nom = ?, prenoms = ?, sexe = ?, direction = ?, fonction = ?, 
          telephone = ?, email = ?, date_embauche = ?, jours_pris_historique = ?, statut = ?
      WHERE id = ?
    `, [nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, jours_pris_historique || 0, statut, req.params.id]);

    res.json({ message: "Agent mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ CONGÉS ============
app.get('/api/conges', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT c.*, e.nom, e.prenoms, e.matricule, e.direction
      FROM conges c
      JOIN employes e ON c.employe_id = e.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un congé
app.post('/api/conges', auth, async (req, res) => {
  const { employe_id, date_depart, date_retour, type, motif, nombre_jours } = req.body;

  // Vérifier le solde
  try {
    const { rows: soldeRows } = await sql('SELECT * FROM employes WHERE id = ?', [employe_id]);
    const emp = soldeRows[0];
    
    if (emp && emp.date_embauche) {
      const embauche = new Date(emp.date_embauche);
      const today = new Date();
      const annees = Math.floor((today - embauche) / (365.25 * 24 * 60 * 60 * 1000));
      const acquis = annees * 30;
      
      const { rows: prisRows } = await sql(
        'SELECT COALESCE(SUM(nombre_jours), 0) as total FROM conges WHERE employe_id = ? AND statut = ?',
        [employe_id, 'Approuvé']
      );
      const prisSysteme = parseInt(prisRows[0]?.total || 0);
      const solde = acquis - prisSysteme - (emp.jours_pris_historique || 0);

      if (nombre_jours > solde) {
        return res.status(400).json({ message: `Solde insuffisant (${solde} jours disponibles)` });
      }
    }

    const { rows } = await sql(`
      INSERT INTO conges (employe_id, date_depart, date_retour, nombre_jours, type, statut, motif)
      VALUES (?, ?, ?, ?, ?, 'En attente', ?)
      RETURNING id
    `, [employe_id, date_depart, date_retour, nombre_jours, type, motif || '']);

    res.json({ id: rows[0].id, message: "Demande de congé enregistrée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier statut congé
app.put('/api/conges/:id', auth, async (req, res) => {
  const { statut } = req.body;
  try {
    await sql('UPDATE conges SET statut = ? WHERE id = ?', [statut, req.params.id]);
    res.json({ message: "Statut mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ HISTORIQUE CONGÉS (avant système) ============
app.post('/api/agents/:id/historique-conges', auth, async (req, res) => {
  const { annee, jours_pris, type_conge, observations } = req.body;
  
  try {
    await sql(`
      INSERT INTO conges_historique (employe_id, annee, jours_pris, type_conge, observations)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (employe_id, annee) DO UPDATE SET 
        jours_pris = EXCLUDED.jours_pris,
        type_conge = EXCLUDED.type_conge,
        observations = EXCLUDED.observations
    `, [req.params.id, annee, jours_pris, type_conge || 'Annuel', observations || '']);

    // Mettre à jour le total dans employes
    const { rows } = await sql('SELECT COALESCE(SUM(jours_pris), 0) as total FROM conges_historique WHERE employe_id = ?', [req.params.id]);
    await sql('UPDATE employes SET jours_pris_historique = ? WHERE id = ?', [rows[0].total, req.params.id]);

    res.json({ message: "Historique enregistré" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id/historique-conges', auth, async (req, res) => {
  try {
    const { rows } = await sql('SELECT * FROM conges_historique WHERE employe_id = ? ORDER BY annee DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ DASHBOARD ============
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const { rows: agentsCount } = await sql('SELECT COUNT(*) as total FROM employes WHERE role NOT IN (?, ?)', ['DEV', 'ADMIN_DRH']);
    const { rows: congesEnAttente } = await sql('SELECT COUNT(*) as total FROM conges WHERE statut = ?', ['En attente']);
    const { rows: congesApprouves } = await sql('SELECT COUNT(*) as total FROM conges WHERE statut = ?', ['Approuvé']);
    const { rows: congesRecents } = await sql(`
      SELECT c.*, e.nom, e.prenoms, e.direction 
      FROM conges c 
      JOIN employes e ON c.employe_id = e.id 
      ORDER BY c.created_at DESC LIMIT 5
    `);

    res.json({
      total_agents: parseInt(agentsCount[0]?.total || 0),
      conges_en_attente: parseInt(congesEnAttente[0]?.total || 0),
      conges_approuves: parseInt(congesApprouves[0]?.total || 0),
      conges_recents: congesRecents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ FRONTEND ============
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DRH-YOPOUGON sur http://localhost:${PORT}`);
  console.log(`📦 Base: PostgreSQL (Supabase)`);
});
