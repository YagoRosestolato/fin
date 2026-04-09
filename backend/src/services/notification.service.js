const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async (userId, page = 1, limit = 20) => {
  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { notifications, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

const markRead = async (id, userId) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
};

const markAllRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};

const create = async (userId, title, message, type) => {
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
};

const checkAndNotify = async (userId) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const transactions = await prisma.transaction.findMany({
    where: { userId, referenceMonth: month, referenceYear: year },
  });

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const savedAmount = (user.salary * user.savingsGoal) / 100;
  const available = user.salary - savedAmount - totalSpent;

  if (available <= user.safetyAmount && user.safetyAmount > 0) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'LOW_BALANCE',
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
    });
    if (!existing) {
      await create(userId,
        'Saldo baixo!',
        `Seu saldo disponível (R$ ${available.toFixed(2)}) atingiu o valor de segurança.`,
        'LOW_BALANCE'
      );
    }
  }
};

module.exports = { getAll, markRead, markAllRead, create, checkAndNotify };
