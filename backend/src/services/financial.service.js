const { PrismaClient } = require('@prisma/client');
const { differenceInDays, getDaysInMonth, startOfDay, endOfDay, setDate } = require('date-fns');

const prisma = new PrismaClient();

const getFinancialSummary = async (userId, month, year) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });

  const transactions = await prisma.transaction.findMany({
    where: { userId, referenceMonth: month, referenceYear: year },
    orderBy: { date: 'desc' },
  });

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const savedAmount = (user.salary * user.savingsGoal) / 100;
  const availableBalance = user.salary - savedAmount - totalSpent;

  const now = new Date();
  const isCurrentMonth = now.getMonth() + 1 === month && now.getFullYear() === year;

  let dailyBudget = 0;
  let daysRemaining = 0;

  if (isCurrentMonth) {
    const today = now.getDate();
    const payDay = user.paymentDay;

    if (today <= payDay) {
      daysRemaining = payDay - today;
    } else {
      const daysInMonth = getDaysInMonth(now);
      daysRemaining = daysInMonth - today + payDay;
    }

    if (daysRemaining > 0 && availableBalance > 0) {
      dailyBudget = availableBalance / daysRemaining;
    }
  }

  const spendingByCategory = transactions.reduce((acc, t) => {
    const cat = t.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const spendingByType = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {});

  return {
    salary: user.salary,
    savingsGoal: user.savingsGoal,
    savedAmount,
    totalSpent,
    availableBalance,
    safetyAmount: user.safetyAmount,
    isBelowSafety: availableBalance < user.safetyAmount,
    dailyBudget,
    daysRemaining,
    paymentDay: user.paymentDay,
    spendingByCategory,
    spendingByType,
    transactionCount: transactions.length,
  };
};

const getMonthlySavingsHistory = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const groups = await prisma.transaction.groupBy({
    by: ['referenceYear', 'referenceMonth'],
    where: { userId },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: [{ referenceYear: 'asc' }, { referenceMonth: 'asc' }],
  });

  const savedPerMonth = (user.salary * user.savingsGoal) / 100;

  return groups.map(g => ({
    month: g.referenceMonth,
    year: g.referenceYear,
    totalSpent: g._sum.amount || 0,
    transactionCount: g._count.id,
    savedAmount: savedPerMonth,
    balance: user.salary - savedPerMonth - (g._sum.amount || 0),
  }));
};

const getDailySpending = async (userId, month, year) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId, referenceMonth: month, referenceYear: year },
    select: { date: true, amount: true, name: true, category: true },
    orderBy: { date: 'asc' },
  });

  const byDay = transactions.reduce((acc, t) => {
    const day = new Date(t.date).getDate();
    if (!acc[day]) acc[day] = { day, total: 0, transactions: [] };
    acc[day].total += t.amount;
    acc[day].transactions.push(t);
    return acc;
  }, {});

  return Object.values(byDay);
};

module.exports = { getFinancialSummary, getMonthlySavingsHistory, getDailySpending };
