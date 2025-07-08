const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function debugPassword() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'a@a.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true
      }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHashLength: user.passwordHash.length,
      passwordHashStart: user.passwordHash.substring(0, 20) + '...'
    });
    
    // Test the correct password
    const correctPassword = 'Aa123123*';
    const isMatch = await bcrypt.compare(correctPassword, user.passwordHash);
    console.log(`Password "${correctPassword}": ${isMatch ? 'MATCH ✅' : 'no match ❌'}`);
    
    // Test some common wrong passwords too
    const testPasswords = ['123456', 'password', 'a', 'a@a.com', 'Abdullah'];
    
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
      console.log(`Password "${testPassword}": ${isMatch ? 'MATCH ✅' : 'no match ❌'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPassword(); 