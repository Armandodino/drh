-- ============================================
-- EXTENSION POUR NOTIFICATIONS ET CHOIX CONGÉS
-- DRH Mairie de Yopougon - Supabase
-- ============================================

-- Table des choix de congés annuels (prévisions)
CREATE TABLE IF NOT EXISTS choix_conges_annuels (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL,
    date_depart_souhaitee DATE NOT NULL,
    date_retour_souhaitee DATE,
    nombre_jours INTEGER DEFAULT 30,
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'modifie', 'refuse')),
    observations TEXT,
    date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP,
    valide_par INTEGER REFERENCES employes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employe_id, annee)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_choix_conges_employe ON choix_conges_annuels(employe_id);
CREATE INDEX IF NOT EXISTS idx_choix_conges_annee ON choix_conges_annuels(annee);
CREATE INDEX IF NOT EXISTS idx_choix_conges_statut ON choix_conges_annuels(statut);

-- Table des notifications admin
CREATE TABLE IF NOT EXISTS notifications_admin (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('fin_conge_3j', 'fin_conge_1j', 'nouveau_choix', 'demande_conge', 'reprise_service')),
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    employe_id INTEGER REFERENCES employes(id) ON DELETE CASCADE,
    conge_id INTEGER REFERENCES conges(id) ON DELETE CASCADE,
    choix_conge_id INTEGER REFERENCES choix_conges_annuels(id) ON DELETE CASCADE,
    est_lue BOOLEAN DEFAULT FALSE,
    date_notification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_echeance DATE,
    action_requise BOOLEAN DEFAULT FALSE,
    action_effectuee BOOLEAN DEFAULT FALSE
);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_lues ON notifications_admin(est_lue);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications_admin(type);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications_admin(date_notification);

-- Fonction pour créer les notifications de fin de congé
CREATE OR REPLACE FUNCTION creer_notifications_fin_conge()
RETURNS void AS $$
DECLARE
    conge_record RECORD;
BEGIN
    -- Pour les congés qui finissent dans 3 jours
    FOR conge_record IN 
        SELECT c.id, c.employe_id, c.date_retour, e.nom, e.prenoms, e.matricule
        FROM conges c
        JOIN employes e ON c.employe_id = e.id
        WHERE c.statut = 'approuve'
        AND c.date_retour = CURRENT_DATE + INTERVAL '3 days'
    LOOP
        INSERT INTO notifications_admin (type, titre, message, employe_id, conge_id, date_echeance, action_requise)
        VALUES (
            'fin_conge_3j',
            'Fin de congé dans 3 jours',
            CONCAT('Le congé de ', conge_record.nom, ' ', conge_record.prenoms, ' (', conge_record.matricule, ') se termine le ', TO_CHAR(conge_record.date_retour, 'DD/MM/YYYY'), '. Préparer la note de reprise.'),
            conge_record.employe_id,
            conge_record.id,
            conge_record.date_retour,
            TRUE
        );
    END LOOP;
    
    -- Pour les congés qui finissent demain
    FOR conge_record IN 
        SELECT c.id, c.employe_id, c.date_retour, e.nom, e.prenoms, e.matricule
        FROM conges c
        JOIN employes e ON c.employe_id = e.id
        WHERE c.statut = 'approuve'
        AND c.date_retour = CURRENT_DATE + INTERVAL '1 day'
    LOOP
        INSERT INTO notifications_admin (type, titre, message, employe_id, conge_id, date_echeance, action_requise)
        VALUES (
            'fin_conge_1j',
            'Fin de congé DEMAIN',
            CONCAT('URGENT: Le congé de ', conge_record.nom, ' ', conge_record.prenoms, ' (', conge_record.matricule, ') se termine demain. Générer la note de reprise immédiatement.'),
            conge_record.employe_id,
            conge_record.id,
            conge_record.date_retour,
            TRUE
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
SELECT '✅ Tables choix_conges_annuels et notifications_admin créées !' AS status;
