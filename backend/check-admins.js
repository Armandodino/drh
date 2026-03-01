/**
 * Script pour vérifier et réparer les comptes admin
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Session Pooler URL
const DATABASE_URL = 'postgresql://postgres.grhcyxzkaidvfgxbynok:Moutonblanc98%40@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndFixAdmins() {
  console.log('🔍 Vérification des comptes admin...\n');

  try {
    // 1. Vérifier les tables existantes
    console.log('📊 Tables dans la base:');
    const { rows: tables } = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    console.log('');

    // 2. Vérifier les employés
    console.log('👥 Employés dans la base:');
    const { rows: employes } = await pool.query('SELECT id, matricule, nom, prenoms, role, password FROM employes');
    
    if (employes.length === 0) {
      console.log('   ❌ Aucun employé trouvé !');
    } else {
      employes.forEach(e => {
        console.log(`   - ${e.matricule}: ${e.nom} ${e.prenoms} (${e.role}) - Password: ${e.password ? '✅' : '❌'}`);
      });
    }
    console.log('');

    // 3. Générer le hash pour admin123
    console.log('🔐 Génération du hash pour "admin123"...');
    const hash = await bcrypt.hash('admin123', 10);
    console.log(`   Hash: ${hash}\n`);

    // 4. Créer ou mettre à jour les comptes admin
    console.log('⚙️ Création/Mise à jour des comptes admin...');

    // Vérifier si la table employes a la colonne password
    const { rows: columns } = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'employes' AND column_name = 'password'
    `);

    if (columns.length === 0) {
      console.log('   Ajout de la colonne password...');
      await pool.query('ALTER TABLE employes ADD COLUMN IF NOT EXISTS password TEXT');
    }

    // Insérer ou mettre à jour drh001
    await pool.query(`
      INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut, jours_conge_annuel, jours_pris_historique)
      VALUES ('drh001', 'ANZAN', 'Admin DRH', 'M', 'Direction des Ressources Humaines', 'Directeur RH', 'ADMIN_DRH', $1, 'actif', 30, 0)
      ON CONFLICT (matricule) DO UPDATE SET password = $1, role = 'ADMIN_DRH'
    `, [hash]);
    console.log('   ✅ drh001 créé/mis à jour');

    // Insérer ou mettre à jour dev001
    await pool.query(`
      INSERT INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut, jours_conge_annuel, jours_pris_historique)
      VALUES ('dev001', 'DEVELOPPEUR', 'Système', 'M', 'Direction des Systèmes d''Information', 'Développeur', 'DEV', $1, 'actif', 30, 0)
      ON CONFLICT (matricule) DO UPDATE SET password = $1, role = 'DEV'
    `, [hash]);
    console.log('   ✅ dev001 créé/mis à jour');

    // 5. Vérifier le résultat
    console.log('\n🔍 Vérification finale:');
    const { rows: finalCheck } = await pool.query(`
      SELECT matricule, nom, role, password FROM employes WHERE matricule IN ('drh001', 'dev001')
    `);
    finalCheck.forEach(e => {
      console.log(`   - ${e.matricule}: ${e.nom} (${e.role}) - Password: ${e.password ? '✅ présent' : '❌ absent'}`);
    });

    // 6. Tester le hash
    console.log('\n🧪 Test de vérification du mot de passe:');
    const testHash = await bcrypt.compare('admin123', hash);
    console.log(`   bcrypt.compare('admin123', hash) = ${testHash ? '✅ OK' : '❌ ERREUR'}`);

    console.log('\n✅ Terminé ! Vous pouvez maintenant vous connecter avec:');
    console.log('   Matricule: drh001');
    console.log('   Mot de passe: admin123');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await pool.end();
  }
}

checkAndFixAdmins();
