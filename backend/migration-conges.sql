-- ============================================
-- MISE À JOUR SCHÉMA POSTGRESQL - DRH YOPOUGON
-- Gestion avancée des congés
-- ============================================

-- Ajouter les colonnes pour la gestion des congés historiques
ALTER TABLE employes ADD COLUMN IF NOT EXISTS date_embauche DATE;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS jours_pris_historique INTEGER DEFAULT 0;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS jours_conge_cumules INTEGER DEFAULT 0;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Créer une table pour l'historique des congés passés (avant le système)
CREATE TABLE IF NOT EXISTS conges_historique (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL,
    jours_pris INTEGER NOT NULL DEFAULT 0,
    type_conge VARCHAR(50) DEFAULT 'Annuel',
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employe_id, annee)
);

-- Fonction pour calculer les congés cumulés
CREATE OR REPLACE FUNCTION calculer_conges_cumules(employe_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_date_embauche DATE;
    v_annees_travaillees INTEGER;
    v_jours_acquis INTEGER;
    v_jours_pris_systeme INTEGER;
    v_jours_pris_historique INTEGER;
    v_solde INTEGER;
BEGIN
    -- Récupérer la date d'embauche
    SELECT date_embauche, COALESCE(jours_pris_historique, 0) 
    INTO v_date_embauche, v_jours_pris_historique
    FROM employes WHERE id = employe_id_param;
    
    IF v_date_embauche IS NULL THEN
        RETURN 30; -- Valeur par défaut
    END IF;
    
    -- Calculer les années travaillées
    v_annees_travaillees := EXTRACT(YEAR FROM AGE(CURRENT_DATE, v_date_embauche));
    
    -- 30 jours de congé par an
    v_jours_acquis := v_annees_travaillees * 30;
    
    -- Jours pris via le système (congés approuvés)
    SELECT COALESCE(SUM(nombre_jours), 0) 
    INTO v_jours_pris_systeme
    FROM conges 
    WHERE employe_id = employe_id_param AND statut = 'Approuvé';
    
    -- Solde = Acquis - Pris système - Pris historique
    v_solde := v_jours_acquis - v_jours_pris_systeme - v_jours_pris_historique;
    
    RETURN GREATEST(v_solde, 0);
END;
$$ LANGUAGE plpgsql;

-- Vue pour afficher le solde de congés de chaque employé
CREATE OR REPLACE VIEW vue_solde_conges AS
SELECT 
    e.id,
    e.matricule,
    e.nom,
    e.prenoms,
    e.direction,
    e.date_embauche,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.date_embauche))::INTEGER AS annees_anciennete,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.date_embauche))::INTEGER * 30 AS jours_acquis_total,
    COALESCE(e.jours_pris_historique, 0) AS jours_pris_avant_systeme,
    COALESCE(
        (SELECT SUM(nombre_jours) FROM conges WHERE employe_id = e.id AND statut = 'Approuvé'), 0
    ) AS jours_pris_systeme,
    calculer_conges_cumules(e.id) AS solde_conges
FROM employes e
WHERE e.role = 'AGENT' OR e.role = 'ADMIN_DRH';

-- Message de confirmation
SELECT '✅ Mise à jour terminée !' AS status;
