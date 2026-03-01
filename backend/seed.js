const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./mairie_yopougon.sqlite');

const accounts = [
  {
    matricule: 'drh001',
    nom: 'ANZAN',
    prenoms: 'Admin DRH',
    sexe: 'M',
    direction: 'Direction des Ressources Humaines',
    fonction: 'Directeur RH',
    role: 'ADMIN_DRH',
    password: 'admin123',
    statut: 'actif'
  },
  {
    matricule: 'dev001',
    nom: 'DEVELOPPEUR',
    prenoms: 'Système',
    sexe: 'M',
    direction: 'Direction des Systèmes d\'Information',
    fonction: 'Développeur',
    role: 'DEV',
    password: 'dev2026',
    statut: 'actif'
  }
];

async function createAccounts() {
  for (const acc of accounts) {
    const hashed = await bcrypt.hash(acc.password, 10);
    db.run(
      `INSERT OR IGNORE INTO employes (matricule, nom, prenoms, sexe, direction, fonction, role, password, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [acc.matricule, acc.nom, acc.prenoms, acc.sexe, acc.direction, acc.fonction, acc.role, hashed, acc.statut],
      function (err) {
        if (err) console.error('Erreur:', err.message);
        else console.log(`✅ Compte créé/existant: ${acc.matricule} (${acc.role})`);
      }
    );
  }
  setTimeout(() => {
    db.all('SELECT matricule, nom, role, statut FROM employes', (err, rows) => {
      console.log('\n📋 Comptes dans la base:');
      rows.forEach(r => console.log(`  - ${r.matricule} | ${r.nom} | ${r.role}`));
      db.close();
    });
  }, 500);
}

createAccounts();