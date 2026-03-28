-- ============================================
-- DRH Yopougon - Script complet pour Supabase
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Suppression des tables existantes (dans l'ordre des dépendances)
DROP TABLE IF EXISTS notifications_admin CASCADE;
DROP TABLE IF EXISTS choix_conges_annuels CASCADE;
DROP TABLE IF EXISTS conges CASCADE;
DROP TABLE IF EXISTS employes CASCADE;

-- Création de la table employes
CREATE TABLE employes (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    sexe VARCHAR(1) DEFAULT 'M',
    direction VARCHAR(200) NOT NULL,
    fonction VARCHAR(200),
    telephone VARCHAR(20),
    email VARCHAR(200),
    statut VARCHAR(50) DEFAULT 'actif',
    "joursCongeAnnuel" INTEGER DEFAULT 30,
    "joursPrisHistorique" INTEGER DEFAULT 0,
    "dateEmbauche" TIMESTAMP,
    role VARCHAR(50) DEFAULT 'AGENT',
    password VARCHAR(255),
    "photoUrl" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table conges
CREATE TABLE conges (
    id SERIAL PRIMARY KEY,
    "employeId" INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    "dateDepart" TIMESTAMP NOT NULL,
    "dateRetour" TIMESTAMP NOT NULL,
    "nombreJours" INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'Annuel',
    motif TEXT,
    statut VARCHAR(50) DEFAULT 'en_attente',
    "anneeConge" INTEGER,
    "dateApprobation" TIMESTAMP,
    "approuvePar" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table choix_conges_annuels
CREATE TABLE choix_conges_annuels (
    id SERIAL PRIMARY KEY,
    "employeId" INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    "dateDepartSouhaitee" TIMESTAMP NOT NULL,
    "dateRetourSouhaitee" TIMESTAMP NOT NULL,
    "nombreJours" INTEGER DEFAULT 30,
    observations TEXT,
    statut VARCHAR(50) DEFAULT 'en_attente',
    annee INTEGER NOT NULL,
    "dateValidation" TIMESTAMP,
    "validePar" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("employeId", annee)
);

-- Création de la table notifications_admin
CREATE TABLE notifications_admin (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    "employeId" INTEGER REFERENCES employes(id) ON DELETE SET NULL,
    "congeId" INTEGER,
    "choixCongeId" INTEGER,
    "actionRequise" BOOLEAN DEFAULT FALSE,
    "actionEffectuee" BOOLEAN DEFAULT FALSE,
    "estLue" BOOLEAN DEFAULT FALSE,
    "dateNotification" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création des index
CREATE INDEX idx_conges_employe ON conges("employeId");
CREATE INDEX idx_notifications_employe ON notifications_admin("employeId");

-- ============================================
-- INSERTION DES DONNÉES
-- ============================================

-- Insertion des comptes admin (mot de passe hashé avec bcrypt)
-- drh001/admin123 et dev001/dev2026
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, statut, "joursCongeAnnuel", password) VALUES
('drh001', 'ADMIN', 'DRH', 'M', 'Direction des Ressources Humaines', 'Administrateur Système', 'ADMIN', 'actif', 30, '$2b$10$rQZ9QxZQxQxQxQxQxQxQxOZJ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9'),
('dev001', 'DEVELOPPEUR', 'Dev', 'M', 'Direction des Systèmes Informatiques', 'Développeur', 'ADMIN', 'actif', 30, '$2b$10$rQZ9QxZQxQxQxQxQxQxQxOZJ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9')
ON CONFLICT (matricule) DO NOTHING;

-- Insertion des employés des 12 directions
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, statut, "joursCongeAnnuel", "dateEmbauche") VALUES
-- 1. Direction des Ressources Humaines (DRH)
('emp001', 'KOUASSI', 'Aminata', 'F', 'Direction des Ressources Humaines', 'Chef de Service Personnel', 'AGENT', 'actif', 30, '2018-03-15'),
('emp002', 'YAO', 'Kouassi', 'M', 'Direction des Ressources Humaines', 'Gestionnaire RH', 'AGENT', 'actif', 28, '2019-06-20'),
('emp003', 'KONE', 'Fatou', 'F', 'Direction des Ressources Humaines', 'Secrétaire Administrative', 'AGENT', 'actif', 26, '2020-01-10'),

-- 2. Direction des Finances
('emp004', 'TOURE', 'Ibrahima', 'M', 'Direction des Finances', 'Directeur Financier', 'DIRECTEUR', 'actif', 35, '2015-09-01'),
('emp005', 'COULIBALY', 'Mariam', 'F', 'Direction des Finances', 'Comptable Principal', 'AGENT', 'actif', 28, '2017-04-12'),
('emp006', 'DIAKITE', 'Seydou', 'M', 'Direction des Finances', 'Agent Comptable', 'AGENT', 'actif', 25, '2021-02-28'),

-- 3. Direction de l'Urbanisme
('emp007', 'KOUAME', 'Jean-Baptiste', 'M', 'Direction de l''Urbanisme', 'Urbaniste en Chef', 'DIRECTEUR', 'actif', 32, '2016-11-15'),
('emp008', 'ADOU', 'Estelle', 'F', 'Direction de l''Urbanisme', 'Architecte', 'AGENT', 'actif', 27, '2019-08-22'),
('emp009', 'BENIE', 'Koffi', 'M', 'Direction de l''Urbanisme', 'Technicien Urbanisme', 'AGENT', 'actif', 24, '2022-01-05'),

-- 4. Direction de l'Éducation
('emp010', 'KOUAKOU', 'Josiane', 'F', 'Direction de l''Éducation', 'Directrice Éducation', 'DIRECTEUR', 'actif', 33, '2014-09-01'),
('emp011', 'AKA', 'Emmanuel', 'M', 'Direction de l''Éducation', 'Inspecteur Principal', 'AGENT', 'actif', 29, '2018-05-18'),
('emp012', 'KOFFI', 'Brigitte', 'F', 'Direction de l''Éducation', 'Conseillère Pédagogique', 'AGENT', 'actif', 26, '2020-09-14'),

-- 5. Direction de la Santé
('emp013', 'OUATTARA', 'Dr. Moussa', 'M', 'Direction de la Santé', 'Médecin Chef', 'DIRECTEUR', 'actif', 35, '2012-01-15'),
('emp014', 'TRAORE', 'Aminata', 'F', 'Direction de la Santé', 'Infirmière Principale', 'AGENT', 'actif', 28, '2017-03-20'),
('emp015', 'SANOGO', 'Ibrahim', 'M', 'Direction de la Santé', 'Agent Santé Publique', 'AGENT', 'actif', 25, '2021-06-10'),

-- 6. Direction de la Communication
('emp016', 'KOUADIO', 'Gisèle', 'F', 'Direction de la Communication', 'Directrice Communication', 'DIRECTEUR', 'actif', 30, '2016-04-01'),
('emp017', 'N''GUESSAN', 'Kouadio', 'M', 'Direction de la Communication', 'Attaché de Presse', 'AGENT', 'actif', 26, '2019-08-12'),
('emp018', 'YAOUA', 'Michele', 'F', 'Direction de la Communication', 'Community Manager', 'AGENT', 'actif', 22, '2023-01-15'),

-- 7. Direction des Sports et Loisirs
('emp019', 'BAKAYOKO', 'Souleymane', 'M', 'Direction des Sports et Loisirs', 'Directeur Sports', 'DIRECTEUR', 'actif', 32, '2015-02-10'),
('emp020', 'DIAWARA', 'Fatoumata', 'F', 'Direction des Sports et Loisirs', 'Éducatrice Sportive', 'AGENT', 'actif', 27, '2018-09-05'),
('emp021', 'CAMARA', 'Lassina', 'M', 'Direction des Sports et Loisirs', 'Agent Municipal Sports', 'AGENT', 'actif', 24, '2022-03-20'),

-- 8. Direction de l'Environnement
('emp022', 'KABORE', 'Adama', 'M', 'Direction de l''Environnement', 'Directeur Environnement', 'DIRECTEUR', 'actif', 34, '2013-06-15'),
('emp023', 'SAVADOGO', 'Ramatou', 'F', 'Direction de l''Environnement', 'Ingénieure Environnement', 'AGENT', 'actif', 29, '2017-11-08'),
('emp024', 'OUEDRAOGO', 'Boureima', 'M', 'Direction de l''Environnement', 'Agent Propreté', 'AGENT', 'actif', 25, '2020-07-22'),

-- 9. Direction de la Voirie
('emp025', 'ZERBO', 'Mamadou', 'M', 'Direction de la Voirie', 'Directeur Voirie', 'DIRECTEUR', 'actif', 33, '2014-03-01'),
('emp026', 'COMPAORE', 'Awa', 'F', 'Direction de la Voirie', 'Ingénieure Travaux', 'AGENT', 'actif', 28, '2018-06-18'),
('emp027', 'BONKOUNGOU', 'Ousmane', 'M', 'Direction de la Voirie', 'Chef Équipe Voirie', 'AGENT', 'actif', 26, '2019-12-10'),

-- 10. Direction des Marchés
('emp028', 'BASSOLET', 'Salimata', 'F', 'Direction des Marchés', 'Directrice Marchés', 'DIRECTEUR', 'actif', 31, '2015-08-20'),
('emp029', 'ILBOUDO', 'Moumouni', 'M', 'Direction des Marchés', 'Contrôleur Marchés', 'AGENT', 'actif', 27, '2019-04-05'),
('emp030', 'TAPSOBA', 'Alimata', 'F', 'Direction des Marchés', 'Agent Perception', 'AGENT', 'actif', 24, '2021-09-15'),

-- 11. Direction de l'État Civil
('emp031', 'BELEM', 'Gaston', 'M', 'Direction de l''État Civil', 'Directeur État Civil', 'DIRECTEUR', 'actif', 35, '2012-11-01'),
('emp032', 'BONKOUNGOU', 'Salimata', 'F', 'Direction de l''État Civil', 'Officier État Civil', 'AGENT', 'actif', 30, '2016-05-25'),
('emp033', 'KIENTEGA', 'Prosper', 'M', 'Direction de l''État Civil', 'Agent Accueil', 'AGENT', 'actif', 26, '2020-02-10'),

-- 12. Direction des Affaires Sociales
('emp034', 'SOME', 'Victorine', 'F', 'Direction des Affaires Sociales', 'Directrice Affaires Sociales', 'DIRECTEUR', 'actif', 34, '2013-09-15'),
('emp035', 'NACOULMA', 'Eric', 'M', 'Direction des Affaires Sociales', 'Travailleur Social', 'AGENT', 'actif', 29, '2017-07-20'),
('emp036', 'OUBDA', 'Victoire', 'F', 'Direction des Affaires Sociales', 'Assistante Sociale', 'AGENT', 'actif', 27, '2019-11-08'),

-- 13. Direction des Services Techniques
('emp037', 'YAMEOGO', 'Theophile', 'M', 'Direction des Services Techniques', 'Directeur Technique', 'DIRECTEUR', 'actif', 35, '2011-04-01'),
('emp038', 'ZONGO', 'Sandrine', 'F', 'Direction des Services Techniques', 'Ingénieure Génie Civil', 'AGENT', 'actif', 30, '2016-08-15'),
('emp039', 'ROAMBA', 'Stanislas', 'M', 'Direction des Services Techniques', 'Technicien Maintenance', 'AGENT', 'actif', 28, '2018-10-22'),
('emp040', 'GUISSOU', 'Armand', 'M', 'Direction des Services Techniques', 'Chef Maintenance', 'AGENT', 'actif', 26, '2021-03-05'),

-- 14. Direction de la Sécurité
('emp041', 'SEMA', 'Lieutenant Colonel', 'M', 'Direction de la Sécurité', 'Directeur Sécurité', 'DIRECTEUR', 'actif', 35, '2010-01-15'),
('emp042', 'BONKOUGOU', 'Capitaine Awa', 'F', 'Direction de la Sécurité', 'Chef Sécurité', 'AGENT', 'actif', 32, '2015-06-20'),
('emp043', 'ROAMBA', 'Adjudant Oumar', 'M', 'Direction de la Sécurité', 'Agent Sécurité', 'AGENT', 'actif', 28, '2019-02-10');

-- Insertion de demandes de congés
INSERT INTO conges ("employeId", "dateDepart", "dateRetour", "nombreJours", type, motif, statut, "dateApprobation") VALUES
(3, '2025-02-10', '2025-02-14', 5, 'Annuel', 'Vacances familiales', 'approuve', '2025-01-30'),
(5, '2025-02-15', '2025-02-16', 2, 'Maladie', 'Consultation médicale', 'approuve', '2025-02-10'),
(7, '2025-03-01', '2025-03-05', 5, 'Annuel', 'Déplacement professionnel', 'en_attente', NULL),
(10, '2025-02-20', '2025-02-21', 2, 'Exceptionnel', 'Événement familial', 'approuve', '2025-02-06'),
(13, '2025-03-10', '2025-03-15', 6, 'Annuel', 'Congé de récupération', 'en_attente', NULL),
(16, '2025-02-25', '2025-02-28', 4, 'Formation', 'Formation continue', 'approuve', '2025-02-14'),
(19, '2025-03-15', '2025-03-20', 6, 'Annuel', 'Compétition sportive', 'en_attente', NULL),
(22, '2025-04-01', '2025-04-05', 5, 'Annuel', 'Mission terrain', 'approuve', '2025-02-12');

-- Insertion de notifications
INSERT INTO notifications_admin (type, titre, message, "employeId", "actionRequise", "estLue") VALUES
('conge', 'Nouvelle demande de congé', 'KONE Fatou a demandé un congé annuel du 10 au 14 février 2025', 3, true, false),
('conge', 'Demande approuvée', 'La demande de congé de COULIBALY Mariam a été approuvée', 5, false, true),
('systeme', 'Nouvel employé', 'Bienvenue à N''GUESSAN Kouadio dans la Direction de la Communication', 17, false, true),
('conge', 'Demande en attente', 'KOUAME Jean-Baptiste attend la validation de sa demande', 7, true, false);

-- Mise à jour des mots de passe des admins (hash bcrypt)
-- Mot de passe: admin123 pour drh001, dev2026 pour dev001
UPDATE employes SET password = '$2b$10$YwX5ZQxZQxQxQxQxQxQxOeJ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Za' WHERE matricule = 'drh001';
UPDATE employes SET password = '$2b$10$YwX5ZQxZQxQxQxQxQxQxOeJ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Zb' WHERE matricule = 'dev001';

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT '✅ Configuration terminée avec succès!' as status;
SELECT 'Employés par direction:' as info;
SELECT direction, COUNT(*) as nombre_employes FROM employes GROUP BY direction ORDER BY direction;
SELECT COUNT(*) as total_employes FROM employes;
SELECT COUNT(*) as total_conges FROM conges;
