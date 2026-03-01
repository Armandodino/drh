/**
 * Script pour générer un hash bcrypt pour le mot de passe admin123
 * Exécuter avec: node generate-hash.js
 */

const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Erreur:', err);
        return;
    }
    console.log('\n========================================');
    console.log('Mot de passe:', password);
    console.log('Hash généré:', hash);
    console.log('========================================\n');
    
    console.log('SQL pour mettre à jour les mots de passe:');
    console.log(`-- Pour les comptes admin dans employes`);
    console.log(`UPDATE employes SET password = '${hash}' WHERE matricule IN ('drh001', 'dev001');`);
    console.log(`\n-- Pour le compte admin dans users`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'admin';`);
});
