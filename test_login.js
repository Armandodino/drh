const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function test() {
  const db = new PrismaClient();
  try {
    const user = await db.employe.findUnique({ where: { matricule: 'drh001' } });
    if (!user) return console.log('user not found');
    console.log('User found:', user.matricule);
    
    // Test bcrypt
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('Password valid?', isValid);
    
    // Test jwt
    const token = jwt.sign(
      { id: user.id, matricule: user.matricule, role: user.role, nom: user.nom },
      'DRH_YOP_SECRET_2026',
      { expiresIn: '12h' }
    );
    console.log('Token created', !!token);
  } catch (err) {
    console.error('ERROR CATCH:', err);
  } finally {
    db.$disconnect()
  }
}
test();
