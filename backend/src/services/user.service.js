const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, salary: true,
      savingsGoal: true, safetyAmount: true, paymentDay: true,
      currency: true, createdAt: true,
    },
  });
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });
  return user;
};

const updateProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, email: true, name: true, salary: true,
      savingsGoal: true, safetyAmount: true, paymentDay: true,
      currency: true, updatedAt: true,
    },
  });
};

const deleteAccount = async (userId) => {
  await prisma.user.delete({ where: { id: userId } });
};

module.exports = { getProfile, updateProfile, deleteAccount };
