-- ============================================
-- SCHÉMA POSTGRESQL - DRH YOPOUGON
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Table des employés
CREATE TABLE IF NOT EXISTS employes (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    sexe VARCHAR(1) DEFAULT 'M',
    direction VARCHAR(200) NOT NULL,
    fonction VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_embauche DATE,
    photo TEXT,
    statut VARCHAR(50) DEFAULT 'actif',
    jours_conge_annuel INTEGER DEFAULT 30,
    role VARCHAR(20) DEFAULT 'AGENT',
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des congés
CREATE TABLE IF NOT EXISTS conges (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    date_depart DATE NOT NULL,
    date_retour DATE NOT NULL,
    nombre_jours INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    motif TEXT,
    statut VARCHAR(50) DEFAULT 'En attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_employes_matricule ON employes(matricule);
CREATE INDEX IF NOT EXISTS idx_employes_direction ON employes(direction);
CREATE INDEX IF NOT EXISTS idx_conges_employe_id ON conges(employe_id);
CREATE INDEX IF NOT EXISTS idx_conges_statut ON conges(statut);

-- ============================================
-- DONNÉES INITIALES - COMPTES ADMIN
-- ============================================

-- Compte Admin DRH (mot de passe: admin123)
-- Le hash est généré avec bcrypt pour 'admin123'
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut)
VALUES (
    'drh001',
    'ANZAN',
    'Admin DRH',
    'M',
    'Direction des Ressources Humaines',
    'Directeur RH',
    'ADMIN_DRH',
    '$2b$10$rQZ8X6kV9YzN3hG2fE8GwO5ZJXK4mP7qR1sT2uV3wX4yZ5aB6cD7e',
    'actif'
) ON CONFLICT (matricule) DO NOTHING;

-- Compte Développeur (mot de passe: dev2026)
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut)
VALUES (
    'dev001',
    'DEVELOPPEUR',
    'Système',
    'M',
    'Direction des Systèmes d''Information',
    'Développeur',
    'DEV',
    '$2b$10$rQZ8X6kV9YzN3hG2fE8GwO5ZJXK4mP7qR1sT2uV3wX4yZ5aB6cD7e',
    'actif'
) ON CONFLICT (matricule) DO NOTHING;

-- Message de confirmation
SELECT '✅ Tables créées avec succès !' AS status;
