/**
 * Script pour ajouter les employés dans PostgreSQL
 * Exécuter avec: node seed-employes.cjs
 */

const { Pool } = require('pg');

// Direct connection string for Supabase Session Pooler
const DATABASE_URL = 'postgresql://postgres.grhcyxzkaidvfgxbynok:Moutonblanc98%40@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// SQL helper
const sql = (query, params = []) => {
  let i = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++i}`);
  return pool.query(pgQuery, params);
};

// Employés à ajouter
const employes = [
  {
    matricule: '1278-D',
    nom: 'Djrogo',
    prenoms: 'Hermine',
    sexe: 'F',
    direction: 'DIRECTION DES RESSOURCES HUMAINES',
    fonction: 'Secrétaire',
    telephone: '0102030405',
    email: 'hermine@gmail.com',
    date_embauche: '2017-12-01',
    statut: 'actif',
    jours_conge_annuel: 30
  },
  {
    matricule: '1616-D',
    nom: 'Traoré',
    prenoms: 'Assanatou',
    sexe: 'F',
    direction: 'DIRECTION DES RESSOURCES HUMAINES',
    fonction: 'Secrétaire',
    telephone: '0707305794',
    email: 'Assanatou@gmail.com',
    date_embauche: '2024-10-01',
    statut: 'actif',
    jours_conge_annuel: 30
  },
  {
    matricule: '1163-S',
    nom: 'Coulibaly',
    prenoms: 'Ibrahim',
    sexe: 'M',
    direction: 'DIRECTION DU SERVICE INFORMATIQUE',
    fonction: 'Informaticien',
    telephone: '0546987502',
    email: 'Ibrahim@gmail.com',
    date_embauche: '2022-04-02',
    statut: 'actif',
    jours_conge_annuel: 30
  },
  {
    matricule: '833396-J',
    nom: 'Pale',
    prenoms: 'Toto Justine',
    sexe: 'F',
    direction: 'DIRECTION DES RESSOURCES HUMAINES',
    fonction: 'Assistante Ressources Humaines',
    telephone: '',
    email: 'justine@gmail.com',
    date_embauche: '2022-04-12',
    statut: 'actif',
    jours_conge_annuel: 30
  },
  {
    matricule: '989-A',
    nom: 'Coulibaly',
    prenoms: 'Drissa',
    sexe: 'M',
    direction: 'DIRECTION DU SERVICE INFORMATIQUE',
    fonction: 'Informaticien',
    telephone: '0523265652',
    email: 'Drissa@gmail.com',
    date_embauche: '2025-07-01',
    statut: 'actif',
    jours_conge_annuel: 30
  },
  {
    matricule: '12345-D',
    nom: 'Anzan',
    prenoms: 'Komenan',
    sexe: 'M',
    direction: 'Direction Technique',
    fonction: 'Informaticien',
    telephone: '',
    email: '',
    date_embauche: '2021-05-12',
    statut: 'actif',
    jours_conge_annuel: 30
  }
];

async function seedEmployes() {
  console.log('🌱 Début de l\'ajout des employés...\n');
  console.log('📡 Connexion à Supabase...');

  try {
    // Test connection
    await pool.connect();
    console.log('✅ Connecté à PostgreSQL\n');
  } catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  }

  for (const emp of employes) {
    try {
      // Vérifier si l'employé existe déjà
      const { rows: existing } = await sql(
        'SELECT id FROM employes WHERE matricule = ?',
        [emp.matricule]
      );

      if (existing.length > 0) {
        console.log(`⚠️  ${emp.matricule} - ${emp.nom} ${emp.prenoms} existe déjà`);
        continue;
      }

      // Ajouter l'employé
      const { rows } = await sql(`
        INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, telephone, email, date_embauche, statut, jours_conge_annuel, role, jours_pris_historique)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AGENT', 0)
        RETURNING id
      `, [
        emp.matricule.toLowerCase(),
        emp.nom,
        emp.prenoms,
        emp.sexe,
        emp.direction,
        emp.fonction,
        emp.telephone || '',
        emp.email || '',
        emp.date_embauche,
        emp.statut,
        emp.jours_conge_annuel
      ]);

      console.log(`✅ ${emp.matricule} - ${emp.nom} ${emp.prenoms} ajouté (ID: ${rows[0].id})`);
    } catch (err) {
      console.error(`❌ Erreur pour ${emp.matricule}:`, err.message);
    }
  }

  console.log('\n🎉 Terminé !');
  
  // Afficher le récapitulatif
  const { rows } = await sql('SELECT matricule, nom, prenoms, date_embauche FROM employes WHERE role = \'AGENT\' ORDER BY nom');
  console.log('\n📋 Liste des agents dans la base:');
  rows.forEach(r => {
    console.log(`   - ${r.matricule}: ${r.nom} ${r.prenoms} (embauché le ${r.date_embauche})`);
  });

  await pool.end();
}

seedEmployes().catch(console.error);
