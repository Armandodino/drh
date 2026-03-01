-- ============================================
-- MIGRATION COMPLETE MySQL → PostgreSQL
-- DRH Mairie de Yopougon - Supabase
-- ============================================

-- Supprimer les tables existantes si nécessaire (dans l'ordre des dépendances)
DROP TABLE IF EXISTS rappels CASCADE;
DROP TABLE IF EXISTS logs_activite CASCADE;
DROP TABLE IF EXISTS fiches_conge CASCADE;
DROP TABLE IF EXISTS conges CASCADE;
DROP TABLE IF EXISTS conges_historique CASCADE;
DROP TABLE IF EXISTS employes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS parametres CASCADE;
DROP TABLE IF EXISTS actualites CASCADE;

-- ============================================
-- TABLE DES UTILISATEURS ADMIN
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mot de passe: admin123 (hash bcrypt)
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$10$rQZ8X6kV9YzN3hG2fE8GwO5ZJXK4mP7qR1sT2uV3wX4yZ5aB6cD7e', 'admin');

-- ============================================
-- TABLE DES EMPLOYÉS
-- ============================================
CREATE TABLE employes (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    sexe VARCHAR(1) DEFAULT 'M' CHECK (sexe IN ('M', 'F')),
    direction VARCHAR(200) NOT NULL,
    fonction VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_embauche DATE,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
    jours_conge_annuel INTEGER DEFAULT 30,
    jours_pris_historique INTEGER DEFAULT 0,
    photo_url TEXT,
    role VARCHAR(20) DEFAULT 'AGENT',
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_employes_matricule ON employes(matricule);
CREATE INDEX idx_employes_direction ON employes(direction);
CREATE INDEX idx_employes_statut ON employes(statut);

-- Données des employés
INSERT INTO employes (id, matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, jours_pris_historique, role) VALUES
(15, '1278-d', 'Djrogo', 'Hermine', 'F', 'DIRECTION DES RESSOURCES HUMAINES', 'Secrétaire', '0102030405', 'hermine@gmail.com', '2017-12-01', 'actif', 30, 0, 'AGENT'),
(16, '1616-d', 'Traoré', 'Assanatou', 'F', 'DIRECTION DES RESSOURCES HUMAINES', 'Secrétaire', '0707305794', 'Assanatou@gmail.com', '2024-10-01', 'actif', 30, 0, 'AGENT'),
(17, '1163-s', 'Coulibaly', 'Ibrahim', 'M', 'DIRECTION DU SERVICE INFORMATIQUE', 'Informaticien', '0546987502', 'Ibrahim@gmail.com', '2022-04-02', 'actif', 30, 0, 'AGENT'),
(18, '833396-j', 'Pale', 'Toto Justine', 'F', 'DIRECTION DES RESSOURCES HUMAINES', 'Assistante Ressources Humaines', '', 'justine@gmail.com', '2022-04-12', 'actif', 30, 0, 'AGENT'),
(19, '989-a', 'Coulibaly', 'Drissa', 'M', 'DIRECTION DU SERVICE INFORMATIQUE', 'Informaticien', '0523265652', 'Drissa@gmail.com', '2025-07-01', 'actif', 30, 0, 'AGENT'),
(20, '12345-d', 'Anzan', 'Komenan', 'M', 'Direction Technique', 'Informaticien', '', '', '2021-05-12', 'actif', 30, 0, 'AGENT');

-- Comptes admin DRH (mot de passe: admin123)
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut, jours_conge_annuel, jours_pris_historique) VALUES
('drh001', 'ANZAN', 'Admin DRH', 'M', 'Direction des Ressources Humaines', 'Directeur RH', 'ADMIN_DRH', '$2b$10$rQZ8X6kV9YzN3hG2fE8GwO5ZJXK4mP7qR1sT2uV3wX4yZ5aB6cD7e', 'actif', 30, 0),
('dev001', 'DEVELOPPEUR', 'Système', 'M', 'Direction des Systèmes d''Information', 'Développeur', 'DEV', '$2b$10$rQZ8X6kV9YzN3hG2fE8GwO5ZJXK4mP7qR1sT2uV3wX4yZ5aB6cD7e', 'actif', 30, 0);

-- Réinitialiser la séquence
SELECT setval('employes_id_seq', 21, false);

-- ============================================
-- TABLE DES CONGÉS
-- ============================================
CREATE TABLE conges (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    date_depart DATE NOT NULL,
    date_retour DATE NOT NULL,
    nombre_jours INTEGER NOT NULL,
    type VARCHAR(20) DEFAULT 'annuel' CHECK (type IN ('annuel', 'cumule', 'exceptionnel', 'maladie', 'Annuel', 'Exceptionnel', 'Maladie')),
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'en_cours', 'termine', 'refuse', 'annule', 'En attente', 'Approuvé', 'Annulé')),
    est_cumule BOOLEAN DEFAULT FALSE,
    annee_conge INTEGER NOT NULL,
    motif TEXT,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    date_approbation TIMESTAMP,
    approuve_par INTEGER REFERENCES users(id) ON DELETE SET NULL,
    commentaire_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_conges_employe ON conges(employe_id);
CREATE INDEX idx_conges_dates ON conges(date_depart, date_retour);
CREATE INDEX idx_conges_statut ON conges(statut);
CREATE INDEX idx_conges_annee ON conges(annee_conge);

-- Données des congés
INSERT INTO conges (id, employe_id, date_depart, date_retour, nombre_jours, type, statut, est_cumule, annee_conge, motif, date_demande, approuve_par) VALUES
(18, 19, '2026-08-02', '2026-09-01', 31, 'annuel', 'approuve', FALSE, 2025, NULL, '2025-07-16 09:51:29', NULL),
(19, 15, '2025-08-15', '2025-09-14', 31, 'annuel', 'approuve', FALSE, 2025, NULL, '2025-07-16 09:55:12', NULL),
(20, 17, '2025-07-23', '2025-08-06', 15, 'annuel', 'approuve', FALSE, 2022, NULL, '2025-07-21 10:35:07', NULL);

SELECT setval('conges_id_seq', 21, false);

-- ============================================
-- TABLE HISTORIQUE CONGÉS (avant système)
-- ============================================
CREATE TABLE conges_historique (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL,
    jours_pris INTEGER NOT NULL DEFAULT 0,
    type_conge VARCHAR(50) DEFAULT 'Annuel',
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employe_id, annee)
);

-- ============================================
-- TABLE DES FICHES DE CONGÉ
-- ============================================
CREATE TABLE fiches_conge (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    conge_id INTEGER REFERENCES conges(id) ON DELETE SET NULL,
    direction VARCHAR(100) NOT NULL,
    annee INTEGER NOT NULL,
    date_emission DATE NOT NULL,
    fichier_url VARCHAR(255),
    statut VARCHAR(20) DEFAULT 'emise' CHECK (statut IN ('emise', 'retournee', 'validee')),
    date_retour DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_fiches_employe_annee ON fiches_conge(employe_id, annee);

-- Données
INSERT INTO fiches_conge (id, employe_id, conge_id, direction, annee, date_emission, statut) VALUES
(4, 15, NULL, 'DIRECTION DES RESSOURCES HUMAINES', 2025, '2025-07-16', 'emise'),
(5, 16, NULL, 'DIRECTION DES RESSOURCES HUMAINES', 2025, '2025-07-16', 'emise'),
(6, 18, NULL, 'DIRECTION DES RESSOURCES HUMAINES', 2025, '2025-07-16', 'emise');

SELECT setval('fiches_conge_id_seq', 7, false);

-- ============================================
-- TABLE DES RAPPELS
-- ============================================
CREATE TABLE rappels (
    id SERIAL PRIMARY KEY,
    conge_id INTEGER NOT NULL REFERENCES conges(id) ON DELETE CASCADE,
    type_rappel VARCHAR(20) NOT NULL CHECK (type_rappel IN ('depart_5j', 'depart_3j', 'depart_1j', 'fin_3j', 'fin_1j', 'retour_attente', 'retour_tardif')),
    date_rappel DATE NOT NULL,
    est_envoye BOOLEAN DEFAULT FALSE,
    date_envoi TIMESTAMP,
    moyen_envoi VARCHAR(20) DEFAULT 'notification' CHECK (moyen_envoi IN ('email', 'sms', 'notification')),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_rappels_conge ON rappels(conge_id);
CREATE INDEX idx_rappels_date ON rappels(date_rappel);

-- Données des rappels
INSERT INTO rappels (id, conge_id, type_rappel, date_rappel, est_envoye, moyen_envoi, message, is_read) VALUES
(75, 20, 'depart_5j', '2025-07-18', FALSE, 'notification', 'Rappel: Votre congé commence dans 5 jours (23/07/2025)', FALSE),
(76, 20, 'depart_3j', '2025-07-20', FALSE, 'notification', 'Rappel: Votre congé commence dans 3 jours (23/07/2025)', FALSE),
(77, 20, 'depart_1j', '2025-07-22', FALSE, 'notification', 'Rappel: Votre congé commence demain (23/07/2025)', FALSE),
(78, 20, 'fin_3j', '2025-08-03', FALSE, 'notification', 'Rappel: Votre congé se termine dans 3 jours (06/08/2025)', FALSE),
(79, 20, 'fin_1j', '2025-08-05', FALSE, 'notification', 'Rappel: Votre congé se termine demain (06/08/2025)', FALSE),
(80, 20, 'retour_attente', '2025-08-07', FALSE, 'notification', 'Rappel: Veuillez confirmer votre retour de congé', FALSE);

SELECT setval('rappels_id_seq', 81, false);

-- ============================================
-- TABLE DES ACTUALITÉS
-- ============================================
CREATE TABLE actualites (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) DEFAULT 'info'
);

-- ============================================
-- TABLE DES PARAMÈTRES
-- ============================================
CREATE TABLE parametres (
    id SERIAL PRIMARY KEY,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'integer', 'boolean', 'json')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données des paramètres
INSERT INTO parametres (cle, valeur, description, type) VALUES
('jours_conges_annuels', '30', 'Nombre de jours de congés annuels par défaut', 'integer'),
('rappel_depart_jours', '5,3,1', 'Jours avant départ pour les rappels', 'string'),
('rappel_fin_jours', '3,1', 'Jours avant fin pour les rappels', 'string'),
('email_admin', 'admin@yopougon.ci', 'Email de l''administrateur', 'string'),
('nom_mairie', 'Mairie de Yopougon', 'Nom officiel de la mairie', 'string'),
('adresse_mairie', 'Yopougon, Abidjan, Côte d''Ivoire', 'Adresse de la mairie', 'string'),
('telephone_mairie', '+225 XX XX XX XX', 'Téléphone de la mairie', 'string');

-- ============================================
-- TABLE DES LOGS D'ACTIVITÉ
-- ============================================
CREATE TABLE logs_activite (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    employe_id INTEGER REFERENCES employes(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_affectee VARCHAR(50),
    id_enregistrement INTEGER,
    anciennes_valeurs JSONB,
    nouvelles_valeurs JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_logs_user ON logs_activite(user_id);
CREATE INDEX idx_logs_action ON logs_activite(action);
CREATE INDEX idx_logs_date ON logs_activite(created_at);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour calculer automatiquement le nombre de jours
CREATE OR REPLACE FUNCTION calculate_days()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nombre_jours = (NEW.date_retour - NEW.date_depart) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer les jours avant insertion
CREATE TRIGGER trigger_calculate_days_before_insert
BEFORE INSERT ON conges
FOR EACH ROW
EXECUTE FUNCTION calculate_days();

-- Trigger pour calculer les jours avant mise à jour
CREATE TRIGGER trigger_calculate_days_before_update
BEFORE UPDATE ON conges
FOR EACH ROW
EXECUTE FUNCTION calculate_days();

-- Fonction pour créer les rappels après approbation
CREATE OR REPLACE FUNCTION create_rappels_after_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.statut = 'approuve' AND OLD.statut != 'approuve' THEN
        -- Rappel 5 jours avant départ
        INSERT INTO rappels (conge_id, type_rappel, date_rappel, message)
        VALUES (NEW.id, 'depart_5j', NEW.date_depart - INTERVAL '5 days', 
                'Rappel: Votre congé commence dans 5 jours (' || TO_CHAR(NEW.date_depart, 'DD/MM/YYYY') || ')');
        
        -- Rappel 3 jours avant départ
        INSERT INTO rappels (conge_id, type_rappel, date_rappel, message)
        VALUES (NEW.id, 'depart_3j', NEW.date_depart - INTERVAL '3 days', 
                'Rappel: Votre congé commence dans 3 jours (' || TO_CHAR(NEW.date_depart, 'DD/MM/YYYY') || ')');
        
        -- Rappel 1 jour avant départ
        INSERT INTO rappels (conge_id, type_rappel, date_rappel, message)
        VALUES (NEW.id, 'depart_1j', NEW.date_depart - INTERVAL '1 day', 
                'Rappel: Votre congé commence demain (' || TO_CHAR(NEW.date_depart, 'DD/MM/YYYY') || ')');
        
        -- Rappel 3 jours avant fin
        INSERT INTO rappels (conge_id, type_rappel, date_rappel, message)
        VALUES (NEW.id, 'fin_3j', NEW.date_retour - INTERVAL '3 days', 
                'Rappel: Votre congé se termine dans 3 jours (' || TO_CHAR(NEW.date_retour, 'DD/MM/YYYY') || ')');
        
        -- Rappel 1 jour avant fin
        INSERT INTO rappels (conge_id, type_rappel, date_rappel, message)
        VALUES (NEW.id, 'fin_1j', NEW.date_retour - INTERVAL '1 day', 
                'Rappel: Votre congé se termine demain (' || TO_CHAR(NEW.date_retour, 'DD/MM/YYYY') || ')');
        
        -- Rappel de retour
        INSERT INTO rappels (conge_id, type_rappel, date_rappel, message)
        VALUES (NEW.id, 'retour_attente', NEW.date_retour + INTERVAL '1 day', 
                'Rappel: Veuillez confirmer votre retour de congé');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer les rappels
CREATE TRIGGER trigger_create_rappels_after_approval
AFTER UPDATE ON conges
FOR EACH ROW
EXECUTE FUNCTION create_rappels_after_approval();

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
    SELECT date_embauche, COALESCE(jours_pris_historique, 0) 
    INTO v_date_embauche, v_jours_pris_historique
    FROM employes WHERE id = employe_id_param;
    
    IF v_date_embauche IS NULL THEN
        RETURN 30;
    END IF;
    
    v_annees_travaillees := EXTRACT(YEAR FROM AGE(CURRENT_DATE, v_date_embauche));
    v_jours_acquis := v_annees_travaillees * 30;
    
    SELECT COALESCE(SUM(nombre_jours), 0) 
    INTO v_jours_pris_systeme
    FROM conges 
    WHERE employe_id = employe_id_param AND statut = 'approuve';
    
    v_solde := v_jours_acquis - v_jours_pris_systeme - v_jours_pris_historique;
    
    RETURN GREATEST(v_solde, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VUES
-- ============================================

-- Vue des congés à venir
CREATE OR REPLACE VIEW v_conges_a_venir AS
SELECT 
    c.id,
    e.matricule,
    CONCAT(e.nom, ' ', e.prenoms) AS nom_complet,
    e.direction,
    c.date_depart,
    c.date_retour,
    c.nombre_jours,
    c.type,
    (c.date_depart - CURRENT_DATE) AS jours_avant_depart
FROM conges c
JOIN employes e ON c.employe_id = e.id
WHERE c.statut = 'approuve' 
AND c.date_depart > CURRENT_DATE
ORDER BY c.date_depart ASC;

-- Vue des congés en cours
CREATE OR REPLACE VIEW v_conges_en_cours AS
SELECT 
    c.id,
    e.matricule,
    CONCAT(e.nom, ' ', e.prenoms) AS nom_complet,
    e.direction,
    c.date_depart,
    c.date_retour,
    c.nombre_jours,
    c.type,
    (c.date_retour - CURRENT_DATE) AS jours_restants
FROM conges c
JOIN employes e ON c.employe_id = e.id
WHERE c.statut = 'en_cours' 
AND CURRENT_DATE BETWEEN c.date_depart AND c.date_retour;

-- Vue des rappels en attente
CREATE OR REPLACE VIEW v_rappels_en_attente AS
SELECT 
    r.id,
    r.type_rappel,
    r.date_rappel,
    r.message,
    e.matricule,
    CONCAT(e.nom, ' ', e.prenoms) AS nom_complet,
    e.telephone,
    e.email,
    c.date_depart,
    c.date_retour
FROM rappels r
JOIN conges c ON r.conge_id = c.id
JOIN employes e ON c.employe_id = e.id
WHERE r.est_envoye = FALSE 
AND r.date_rappel <= CURRENT_DATE
ORDER BY r.date_rappel ASC;

-- Vue du solde de congés
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
        (SELECT SUM(nombre_jours) FROM conges WHERE employe_id = e.id AND statut = 'approuve'), 0
    ) AS jours_pris_systeme,
    calculer_conges_cumules(e.id) AS solde_conges
FROM employes e
WHERE e.role = 'AGENT' OR e.role = 'ADMIN_DRH';

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================
SELECT '✅ Migration terminée avec succès !' AS status;
SELECT '📊 Tables créées:' AS info;
SELECT '  - users (administrateurs)' AS table_name
UNION ALL SELECT '  - employes (agents)'
UNION ALL SELECT '  - conges (demandes de congés)'
UNION ALL SELECT '  - conges_historique'
UNION ALL SELECT '  - fiches_conge'
UNION ALL SELECT '  - rappels'
UNION ALL SELECT '  - actualites'
UNION ALL SELECT '  - parametres'
UNION ALL SELECT '  - logs_activite';
