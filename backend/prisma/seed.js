const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('Demo@1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@fin.app' },
    update: {},
    create: {
      email: 'demo@fin.app',
      password,
      name: 'Usuário Demo',
      salary: 5000,
      savingsGoal: 20,
      safetyAmount: 500,
      paymentDay: 5,
    },
  });

  console.log('User created:', user.email);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const transactions = [
    { name: 'iFood', amount: 45.90, type: 'PIX', category: 'alimentação' },
    { name: 'Uber', amount: 22.50, type: 'DEBIT', category: 'transporte' },
    { name: 'Mercado', amount: 312.40, type: 'DEBIT', category: 'alimentação' },
    { name: 'Academia', amount: 89.90, type: 'DEBIT', category: 'saúde', isFixed: true },
    { name: 'Netflix', amount: 39.90, type: 'CREDIT', category: 'lazer', isFixed: true },
    { name: 'Spotify', amount: 21.90, type: 'CREDIT', category: 'lazer', isFixed: true },
    { name: 'Aluguel', amount: 1200, type: 'PIX', category: 'moradia', isFixed: true },
    { name: 'Farmácia', amount: 67.30, type: 'PIX', category: 'saúde' },
    { name: 'Gasolina', amount: 150, type: 'DEBIT', category: 'transporte' },
    { name: 'Restaurante', amount: 89.00, type: 'CREDIT', category: 'alimentação' },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        ...tx,
        userId: user.id,
        tags: [],
        date: new Date(),
        referenceMonth: month,
        referenceYear: year,
        isFixed: tx.isFixed || false,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Bem-vindo ao Fin!',
      message: 'Configure seu perfil financeiro para começar a controlar seus gastos.',
      type: 'SYSTEM',
    },
  });

  console.log('Seed completed!');
  console.log('Login: demo@fin.app | Senha: Demo@1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
