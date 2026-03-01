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

// Normalisation des statuts (accepte les deux formats)
const normalizeStatut = (statut) => {
  const statutsMap = {
    'en_attente': 'en_attente',
    'En attente': 'en_attente',
    'En_attente': 'en_attente',
    'approuve': 'approuve',
    'Approuvé': 'approuve',
    'Approuve': 'approuve',
    'en_cours': 'en_cours',
    'En cours': 'en_cours',
    'termine': 'termine',
    'Terminé': 'termine',
    'refuse': 'refuse',
    'Refusé': 'refuse',
    'annule': 'annule',
    'Annulé': 'annule'
  };
  return statutsMap[statut] || statut;
};

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

// ============ HEALTH CHECK ============
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: err.message 
    });
  }
});

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

    // Jours pris dans le système (format approuve)
    const { rows: congesRows } = await sql(
      "SELECT COALESCE(SUM(nombre_jours), 0) as total FROM conges WHERE employe_id = ? AND statut IN ('approuve', 'Approuvé')",
      [req.params.id]
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'actif', 'AGENT')
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
    `, [nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, jours_pris_historique || 0, statut?.toLowerCase() || 'actif', req.params.id]);

    res.json({ message: "Agent mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un agent (avec vérification mot de passe admin)
app.delete('/api/agents/:id', auth, async (req, res) => {
  const { password } = req.body;
  
  try {
    // Vérifier le mot de passe de l'admin connecté
    const { rows: adminRows } = await sql('SELECT password FROM employes WHERE id = ?', [req.user.id]);
    const admin = adminRows[0];
    
    if (!admin || !admin.password) {
      return res.status(401).json({ message: "Session invalide" });
    }
    
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(403).json({ message: "Mot de passe incorrect" });
    }

    // Supprimer l'agent
    await sql('DELETE FROM employes WHERE id = ?', [req.params.id]);
    res.json({ message: "Agent supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Vérifier mot de passe admin pour actions sensibles
app.post('/api/verify-password', auth, async (req, res) => {
  const { password } = req.body;
  
  try {
    const { rows } = await sql('SELECT password FROM employes WHERE id = ?', [req.user.id]);
    const user = rows[0];
    
    if (!user || !user.password) {
      return res.status(401).json({ valid: false });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ CONGÉS ============
app.get('/api/conges', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT c.*, e.nom, e.prenoms, e.matricule, e.direction, e.fonction
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

  try {
    const { rows: soldeRows } = await sql('SELECT * FROM employes WHERE id = ?', [employe_id]);
    const emp = soldeRows[0];
    
    if (emp && emp.date_embauche) {
      const embauche = new Date(emp.date_embauche);
      const today = new Date();
      const annees = Math.floor((today - embauche) / (365.25 * 24 * 60 * 60 * 1000));
      const acquis = annees * 30;
      
      const { rows: prisRows } = await sql(
        "SELECT COALESCE(SUM(nombre_jours), 0) as total FROM conges WHERE employe_id = ? AND statut IN ('approuve', 'Approuvé')",
        [employe_id]
      );
      const prisSysteme = parseInt(prisRows[0]?.total || 0);
      const solde = acquis - prisSysteme - (emp.jours_pris_historique || 0);

      if (nombre_jours > solde) {
        return res.status(400).json({ message: `Solde insuffisant (${solde} jours disponibles)` });
      }
    }

    // Année du congé
    const anneeConge = new Date(date_depart).getFullYear();

    const { rows } = await sql(`
      INSERT INTO conges (employe_id, date_depart, date_retour, nombre_jours, type, statut, motif, annee_conge)
      VALUES (?, ?, ?, ?, ?, 'en_attente', ?, ?)
      RETURNING id
    `, [employe_id, date_depart, date_retour, nombre_jours, type?.toLowerCase() || 'annuel', motif || '', anneeConge]);

    res.json({ id: rows[0].id, message: "Demande de congé enregistrée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Modifier statut congé
app.put('/api/conges/:id', auth, async (req, res) => {
  const { statut } = req.body;
  const normalizedStatut = normalizeStatut(statut);
  
  try {
    // Si approbation, enregistrer qui a approuvé et quand
    if (normalizedStatut === 'approuve') {
      await sql(`
        UPDATE conges 
        SET statut = ?, date_approbation = CURRENT_TIMESTAMP, approuve_par = ?
        WHERE id = ?
      `, [normalizedStatut, req.user.id, req.params.id]);
    } else {
      await sql('UPDATE conges SET statut = ? WHERE id = ?', [normalizedStatut, req.params.id]);
    }
    
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
    const { rows: agentsCount } = await sql("SELECT COUNT(*) as total FROM employes WHERE role NOT IN ('DEV', 'ADMIN_DRH')");
    const { rows: congesEnAttente } = await sql("SELECT COUNT(*) as total FROM conges WHERE statut IN ('en_attente', 'En attente')");
    const { rows: congesApprouves } = await sql("SELECT COUNT(*) as total FROM conges WHERE statut IN ('approuve', 'Approuvé')");
    const { rows: congesEnCours } = await sql("SELECT COUNT(*) as total FROM conges WHERE statut = 'en_cours'");
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
      conges_en_cours: parseInt(congesEnCours[0]?.total || 0),
      conges_recents: congesRecents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ PARAMÈTRES ============
app.get('/api/parametres', auth, async (req, res) => {
  try {
    const { rows } = await sql('SELECT * FROM parametres ORDER BY cle');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ACTUALITÉS ============
app.get('/api/actualites', auth, async (req, res) => {
  try {
    const { rows } = await sql('SELECT * FROM actualites ORDER BY date_publication DESC LIMIT 10');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ RAPPELS ============
app.get('/api/rappels', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT r.*, e.nom, e.prenoms, e.matricule
      FROM rappels r
      JOIN conges c ON r.conge_id = c.id
      JOIN employes e ON c.employe_id = e.id
      WHERE r.est_envoye = FALSE AND r.date_rappel <= CURRENT_DATE
      ORDER BY r.date_rappel ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ NOTIFICATIONS ADMIN ============
// Récupérer toutes les notifications
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT n.*, e.nom, e.prenoms, e.matricule, e.direction,
             c.date_depart, c.date_retour, c.nombre_jours
      FROM notifications_admin n
      LEFT JOIN employes e ON n.employe_id = e.id
      LEFT JOIN conges c ON n.conge_id = c.id
      ORDER BY n.est_lue ASC, n.date_notification DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nombre de notifications non lues
app.get('/api/notifications/count', auth, async (req, res) => {
  try {
    const { rows } = await sql("SELECT COUNT(*) as total FROM notifications_admin WHERE est_lue = FALSE");
    res.json({ count: parseInt(rows[0]?.total || 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer une notification comme lue
app.put('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    await sql('UPDATE notifications_admin SET est_lue = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer toutes les notifications comme lues
app.put('/api/notifications/read-all', auth, async (req, res) => {
  try {
    await sql('UPDATE notifications_admin SET est_lue = TRUE');
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer action comme effectuée
app.put('/api/notifications/:id/action-done', auth, async (req, res) => {
  try {
    await sql('UPDATE notifications_admin SET action_effectuee = TRUE, est_lue = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: "Action marquée comme effectuée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ CONGÉS FINISSANT BIENTÔT ============
app.get('/api/conges/fin-proche', auth, async (req, res) => {
  try {
    // Congés qui finissent dans les 3 prochains jours
    const { rows } = await sql(`
      SELECT c.*, e.nom, e.prenoms, e.matricule, e.direction, e.fonction,
             (c.date_retour - CURRENT_DATE) as jours_restants
      FROM conges c
      JOIN employes e ON c.employe_id = e.id
      WHERE c.statut = 'approuve'
      AND c.date_retour >= CURRENT_DATE
      AND c.date_retour <= CURRENT_DATE + INTERVAL '3 days'
      ORDER BY c.date_retour ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ CHOIX CONGÉS ANNUELS ============
// Récupérer tous les choix de congés pour une année
app.get('/api/choix-conges/:annee', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT cc.*, e.nom, e.prenoms, e.matricule, e.direction, e.fonction
      FROM choix_conges_annuels cc
      JOIN employes e ON cc.employe_id = e.id
      WHERE cc.annee = ?
      ORDER BY e.nom, e.prenoms
    `, [req.params.annee]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer le choix d'un agent pour une année
app.get('/api/choix-conges/agent/:employeId/:annee', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT * FROM choix_conges_annuels 
      WHERE employe_id = ? AND annee = ?
    `, [req.params.employeId, req.params.annee]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Créer ou mettre à jour un choix de congé
app.post('/api/choix-conges', auth, async (req, res) => {
  const { employe_id, annee, date_depart_souhaitee, nombre_jours, observations } = req.body;
  
  try {
    // Calculer la date de retour
    const dateDepart = new Date(date_depart_souhaitee);
    const dateRetour = new Date(dateDepart);
    dateRetour.setDate(dateRetour.getDate() + (nombre_jours || 30));
    
    const { rows } = await sql(`
      INSERT INTO choix_conges_annuels (employe_id, annee, date_depart_souhaitee, date_retour_souhaitee, nombre_jours, observations, statut)
      VALUES (?, ?, ?, ?, ?, ?, 'en_attente')
      ON CONFLICT (employe_id, annee) DO UPDATE SET 
        date_depart_souhaitee = EXCLUDED.date_depart_souhaitee,
        date_retour_souhaitee = EXCLUDED.date_retour_souhaitee,
        nombre_jours = EXCLUDED.nombre_jours,
        observations = EXCLUDED.observations,
        statut = 'en_attente',
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [employe_id, annee, date_depart_souhaitee, dateRetour.toISOString().split('T')[0], nombre_jours || 30, observations || '']);

    // Créer une notification pour l'admin
    const { rows: agentRows } = await sql('SELECT nom, prenoms, matricule FROM employes WHERE id = ?', [employe_id]);
    const agent = agentRows[0];
    
    await sql(`
      INSERT INTO notifications_admin (type, titre, message, employe_id, choix_conge_id, action_requise)
      VALUES ('nouveau_choix', 'Nouveau choix de congé', ?, ?, ?, TRUE)
    `, [`${agent?.nom} ${agent?.prenoms} (${agent?.matricule}) a soumis son choix de congé pour ${annee}`, employe_id, rows[0].id]);

    res.json({ id: rows[0].id, message: "Choix de congé enregistré" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Valider un choix de congé (admin)
app.put('/api/choix-conges/:id/valider', auth, async (req, res) => {
  const { password, statut, observations } = req.body;
  
  try {
    // Vérifier le mot de passe
    const { rows: adminRows } = await sql('SELECT password FROM employes WHERE id = ?', [req.user.id]);
    const admin = adminRows[0];
    
    if (!admin || !admin.password) {
      return res.status(401).json({ message: "Session invalide" });
    }
    
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(403).json({ message: "Mot de passe incorrect" });
    }

    await sql(`
      UPDATE choix_conges_annuels 
      SET statut = ?, observations = ?, date_validation = CURRENT_TIMESTAMP, valide_par = ?
      WHERE id = ?
    `, [statut, observations || '', req.user.id, req.params.id]);

    res.json({ message: "Choix de congé " + (statut === 'valide' ? 'validé' : 'refusé') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Modifier un choix de congé (admin avec mot de passe)
app.put('/api/choix-conges/:id', auth, async (req, res) => {
  const { password, date_depart_souhaitee, nombre_jours, observations } = req.body;
  
  try {
    // Vérifier le mot de passe
    const { rows: adminRows } = await sql('SELECT password FROM employes WHERE id = ?', [req.user.id]);
    const admin = adminRows[0];
    
    if (!admin || !admin.password) {
      return res.status(401).json({ message: "Session invalide" });
    }
    
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(403).json({ message: "Mot de passe incorrect" });
    }

    // Calculer la nouvelle date de retour
    const dateDepart = new Date(date_depart_souhaitee);
    const dateRetour = new Date(dateDepart);
    dateRetour.setDate(dateRetour.getDate() + (nombre_jours || 30));
    
    await sql(`
      UPDATE choix_conges_annuels 
      SET date_depart_souhaitee = ?, date_retour_souhaitee = ?, nombre_jours = ?, 
          observations = ?, statut = 'modifie', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [date_depart_souhaitee, dateRetour.toISOString().split('T')[0], nombre_jours || 30, observations || '', req.params.id]);

    res.json({ message: "Choix de congé modifié" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Agents n'ayant pas encore fait leur choix
app.get('/api/choix-conges/:annee/manquants', auth, async (req, res) => {
  try {
    const { rows } = await sql(`
      SELECT e.id, e.nom, e.prenoms, e.matricule, e.direction
      FROM employes e
      WHERE e.role = 'AGENT' 
      AND e.statut = 'actif'
      AND e.id NOT IN (
        SELECT employe_id FROM choix_conges_annuels WHERE annee = ?
      )
      ORDER BY e.nom, e.prenoms
    `, [req.params.annee]);
    res.json(rows);
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
