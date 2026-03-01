-- ============================================
-- INSERTION DES EMPLOYÉS - DRH YOPOUGON
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Employé 1: Djrogo Hermine
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
VALUES (
    '1278-d',
    'Djrogo',
    'Hermine',
    'F',
    'DIRECTION DES RESSOURCES HUMAINES',
    'Secrétaire',
    '0102030405',
    'hermine@gmail.com',
    '2017-12-01',
    'actif',
    30,
    'AGENT',
    0
) ON CONFLICT (matricule) DO NOTHING;

-- Employé 2: Traoré Assanatou
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
VALUES (
    '1616-d',
    'Traoré',
    'Assanatou',
    'F',
    'DIRECTION DES RESSOURCES HUMAINES',
    'Secrétaire',
    '0707305794',
    'Assanatou@gmail.com',
    '2024-10-01',
    'actif',
    30,
    'AGENT',
    0
) ON CONFLICT (matricule) DO NOTHING;

-- Employé 3: Coulibaly Ibrahim
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
VALUES (
    '1163-s',
    'Coulibaly',
    'Ibrahim',
    'M',
    'DIRECTION DU SERVICE INFORMATIQUE',
    'Informaticien',
    '0546987502',
    'Ibrahim@gmail.com',
    '2022-04-02',
    'actif',
    30,
    'AGENT',
    0
) ON CONFLICT (matricule) DO NOTHING;

-- Employé 4: Pale Toto Justine
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
VALUES (
    '833396-j',
    'Pale',
    'Toto Justine',
    'F',
    'DIRECTION DES RESSOURCES HUMAINES',
    'Assistante Ressources Humaines',
    '',
    'justine@gmail.com',
    '2022-04-12',
    'actif',
    30,
    'AGENT',
    0
) ON CONFLICT (matricule) DO NOTHING;

-- Employé 5: Coulibaly Drissa
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
VALUES (
    '989-a',
    'Coulibaly',
    'Drissa',
    'M',
    'DIRECTION DU SERVICE INFORMATIQUE',
    'Informaticien',
    '0523265652',
    'Drissa@gmail.com',
    '2025-07-01',
    'actif',
    30,
    'AGENT',
    0
) ON CONFLICT (matricule) DO NOTHING;

-- Employé 6: Anzan Komenan
INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
VALUES (
    '12345-d',
    'Anzan',
    'Komenan',
    'M',
    'Direction Technique',
    'Informaticien',
    '',
    '',
    '2021-05-12',
    'actif',
    30,
    'AGENT',
    0
) ON CONFLICT (matricule) DO NOTHING;

-- Vérification - Afficher tous les agents
SELECT 
    matricule, 
    nom, 
    prenoms, 
    sexe,
    direction, 
    fonction,
    date_embauche,
    statut
FROM employes 
WHERE role = 'AGENT'
ORDER BY nom, prenoms;

-- Message de confirmation
SELECT '✅ 6 employés ajoutés avec succès !' AS status;
