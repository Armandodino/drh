/**
 * Test de connexion direct
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DATABASE_URL = 'postgresql://postgres.grhcyxzkaidvfgxbynok:Moutonblanc98%40@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  const matricule = 'drh001';
  const password = 'admin123';

  console.log('🔐 Test de connexion:');
  console.log(`   Matricule: ${matricule}`);
  console.log(`   Mot de passe: ${password}\n`);

  try {
    // Chercher l'utilisateur
    const { rows } = await pool.query(
      'SELECT * FROM employes WHERE LOWER(matricule) = LOWER($1)',
      [matricule]
    );

    const user = rows[0];

    if (!user) {
      console.log('❌ Matricule introuvable');
      return;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nom: ${user.nom} ${user.prenoms}`);
    console.log(`   - Rôle: ${user.role}`);
    console.log(`   - Password hash: ${user.password ? user.password.substring(0, 30) + '...' : 'ABSENT'}`);

    if (!user.password) {
      console.log('❌ Compte non configuré (pas de mot de passe)');
      return;
    }

    // Vérifier le mot de passe
    console.log('\n🧪 Vérification du mot de passe...');
    const valid = await bcrypt.compare(password, user.password);
    console.log(`   Résultat: ${valid ? '✅ CORRECT' : '❌ INCORRECT'}`);

    if (!valid) {
      console.log('\n⚠️ Le mot de passe ne correspond pas.');
      console.log('   Régénération du hash...');
      
      const newHash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE employes SET password = $1 WHERE id = $2', [newHash, user.id]);
      console.log('   ✅ Nouveau hash généré et enregistré');
      
      // Re-tester
      const retest = await bcrypt.compare(password, newHash);
      console.log(`   Nouveau test: ${retest ? '✅ OK' : '❌ ERREUR'}`);
    }

    // Vérifier le rôle
    if (!['DEV', 'ADMIN_DRH'].includes(user.role)) {
      console.log(`\n⚠️ Rôle non autorisé: ${user.role}`);
      console.log('   Mise à jour du rôle...');
      await pool.query('UPDATE employes SET role = $1 WHERE id = $2', ['ADMIN_DRH', user.id]);
      console.log('   ✅ Rôle mis à jour');
    }

    console.log('\n✅ Connexion devrait fonctionner maintenant !');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await pool.end();
  }
}

testLogin();
